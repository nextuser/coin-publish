import { queryCreatedEvents , getSupply,getVault,getTypeByMeta,queryTransferEvents } from "../coin_info";
import {get_buy_amount,get_sell_amount} from '../coin_curve'
import {getSigner,getLocalSigner} from '../sui/local_key';
import { SuiClient,getFullnodeUrl,GasCostSummary,TransactionEffects,SuiEvent } from '@mysten/sui/client';
import { test_env as env } from "../sui/config";
import { Transaction } from "@mysten/sui/transactions";
import { sign } from "crypto";
import { CoinCreatedEvent } from "../types";
import { getCost } from "../sui/sui_client";
import { CoinTransferEvent } from "../types";
import dotenv from 'dotenv';
import { Tiro_Devanagari_Hindi } from "next/font/google";

dotenv.config();
function get_event(events : SuiEvent[] , tname: string) : unknown | null{
    for( let e of events ){
        console.log('get_evnet: type , tname', e.type, tname);
        console.log(e);
        if(e.type.indexOf(tname) >= 0){

            return e.parsedJson ;
        }
    }
    return null;
}

function getTransferEvent(events : SuiEvent[]|null) : CoinTransferEvent|null{
    if(events == null) return null;

    let event = get_event(events,'CoinTransferEvent');
    if(event != null){
        return event as CoinTransferEvent;
    }
    return null;
}

async function test_buy(){
    console.log("------------------------test_buy---------------------");
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') }); 
    let signer = getLocalSigner();
    let owner = signer.getPublicKey().toSuiAddress();
    let events = await queryCreatedEvents(suiClient,owner);
    let sui_amount = 28100000;
    if(events.length == 0){
        console.log("not find when call queryCreatedEvents ");
        return ;
    }


    let vault_addr = process.env.VAULT
    if(vault_addr == null || vault_addr.length == 0){
        vault_addr = events[0].vault_address;
    }
    let vault = await getVault(suiClient,vault_addr);
    if(vault == null){
        console.log("find vault fain for :",vault_addr);
        return;
    }
    let supplied_token = getSupply(vault);
    console.log("vault supplied_token=",supplied_token);

    let [token_amount,_] = get_buy_amount(Number(supplied_token),sui_amount/1e9);
    token_amount = token_amount * (10** vault.meta.fields.decimals);
    console.log("token amount:",token_amount);
    let tx = new Transaction();
    let [new_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_amount)]);
    tx.setGasBudget(1000000000);
    let type_name = getTypeByMeta(vault.meta.type);
    console.log('coin type name from meta:',type_name);
    //entry fun Buy<T>(mut pay : Coin<SUI>, target_amount :u64,vault : &mut CurveVault<T>,ctx : &mut TxContext )
    tx.moveCall({
        target : `${process.env.COIN_MANAGER_PACKAGE}::coin_manager::entry_buy`,
        arguments : [
            new_coin,
            tx.pure.u64(Math.floor(token_amount)),
            tx.object(vault_addr)
        ],
        typeArguments:[type_name]
    });

    const result = await suiClient.signAndExecuteTransaction({
        signer: signer,
        transaction: tx,
        options: {
            showEffects: true,
            ///showObjectChanges:true,
            showEvents:true
        },
        requestType: 'WaitForLocalExecution',
    });
    let event = getTransferEvent(result.events!);
    console.log("---buy event:",event);
    console.log("---buy cost:", getCost(result.effects?.gasUsed));
    //console.log("result to execute:",result);

}

async function test_sell(){
    console.log("------------------------test_sell---------------------");
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') }); 
    let signer = getLocalSigner();
    let owner = signer.getPublicKey().toSuiAddress();
    let events = await queryCreatedEvents(suiClient,owner);
    if(events.length == 0){
        console.log("events.length ==0", events.length);
        return;
    }


    let vault_addr = process.env.VAULT || ''
    if(( vault_addr.length == 0)){
        vault_addr = events[0].vault_address;
    }

    let vault = await getVault(suiClient,vault_addr);
    if(vault == null){
        console.log("find vault fain for :",vault_addr);
        return;
    }
    let supplied_token = getSupply(vault);
    console.log("vault supplied_token=",supplied_token);

    let type_name = getTypeByMeta(vault.meta.type);
    let tokens = await  suiClient.getCoins({owner: owner,coinType : type_name})
    if(tokens.data.length == 0 ){
        console.log('no tokens of type',type_name);
        return;
    }

    let token = tokens.data[0];
    let tdv = Number(vault.token_decimals_value);
    let token_amount = Number(token.balance) / tdv;
    let tds = Number(vault.token_decimals_value);
    let s0  = Number(supplied_token)/ tdv;
    console.log('get_sell_amount(s0, token_amount)', s0,token_amount);
    let [sui_amount ,_] = get_sell_amount(s0,token_amount)

    console.log("--sell  :token amount,sui_amount:",token_amount,sui_amount);
    let tx = new Transaction();
    tx.setGasBudget(1000000000);
    console.log("token",token);

    //entry public fun --sell <T>(token : Coin<T>,vault : &mut CurveVault<T>,ctx : &mut TxContext )
    tx.moveCall({
        target : `${process.env.COIN_MANAGER_PACKAGE}::coin_manager::entry_sell`,
        arguments : [
            tx.object(token.coinObjectId),
            tx.object(vault_addr)
        ],
        typeArguments:[type_name]
    });
    console.log("--sell  :expect sui",sui_amount * Number(vault.sui_decimals_value));

    const result = await suiClient.signAndExecuteTransaction({
        signer: signer,
        transaction: tx,
        options: {
            showEffects: true,
            ///showObjectChanges:true,
            showEvents:true
        },
        requestType: 'WaitForLocalExecution',
    });

    let event = getTransferEvent(result.events!);
    console.log("transfer event:",event);
    console.log("---sell cost:", getCost(result.effects?.gasUsed));
    
    //console.log("--sell  :result to execute:",result);
    
    
}


async function test(){
    await test_buy();
    await test_sell();
}

function get_vault_addr() : string{
    let vault_addr = process.env.VAULT
    if(vault_addr == null || vault_addr.length == 0){
        console.log("export VAULT first");
        process.exit(-1)
    }
    return vault_addr;
}
async function query_events(){

    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') }); 
    let signer = getLocalSigner();
    

    let vault = await getVault(suiClient,get_vault_addr());
    let coin_type = getTypeByMeta(vault!.meta.type);
    //export  async function queryTransferEvents(suiClient : SuiClient, coin_type : string) : Promise<CoinTransferEvent[]>
    let events = await queryTransferEvents(suiClient, coin_type);
    console.log("s0 ,token_amount ,sui, from ->  to,  ")
    events.forEach((e)=>{
        console.log(Number(e.token_before_transfer)/Number(vault!.token_decimals_value),
                    Number(e.token_amount)/Number(vault!.token_decimals_value) , 
                    Number(e.sui_amount)/Number(vault!.sui_decimals_value),
                    e.token_from, e.token_to);
        //console.log( Number(e.coin_type_name));
    })
}

test();

query_events();
