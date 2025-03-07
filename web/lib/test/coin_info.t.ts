import { queryCreatedEvents , getSupply,getVault,getTypeByMeta,queryTransferEvents, Sell, sell_by_amount } from "../coin_info";
import { CoinTransferEvent,CoinCreatedEvent, CurveVault } from "../types";
import {get_buy_amount,get_sell_amount} from '../coin_curve'
import {getSigner,getLocalSigner} from '../sui/local_key';
import { SuiClient,getFullnodeUrl,GasCostSummary,TransactionEffects,SuiEvent } from '@mysten/sui/client';
import { test_env as env } from "../sui/config";
import { Transaction } from "@mysten/sui/transactions";
import { sign } from "crypto";
import { getCost } from "../sui/sui_client";
import dotenv from 'dotenv';
import { buy ,sell} from "../coin_info";
import { exit } from "process";
dotenv.config();

function show_transfer_event(e : CoinTransferEvent|null,vault :CurveVault | null , fee : bigint){
    if(e == null || vault == null){
        console.log("show_transfer_event invalid arg e=",e,'vault=',vault);
    }
    else{
        console.log(Number(e.token_before_transfer)/Number(vault!.token_decimals_value),
                    Number(e.token_amount)/Number(vault!.token_decimals_value) , 
                    Number(e.sui_amount)/Number(vault!.sui_decimals_value),
                    fee,
                    e.token_from, 
                    e.token_to);
    }
}


const suis = [
    0.0281,
    0.071062962,
    0.020565808,
    0.021175667,
    0.021282926,
    0.052335967,
    0.052973467,
    0.021387863
    ];
async function test_buy() : Promise<bigint[]>{
    console.log("------------------------test_buy---------------------");
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') }); 
    let signer = getLocalSigner();
    let vault_addr = process.env.VAULT
    if(vault_addr == null || vault_addr.length == 0){
        console.log("export VAULT first ");
        process.exit(-1);
    }
    let token_numbers :bigint[] = [];
    for( let i = 0 ; i < suis.length; ++ i){
        let sui_amount = suis[i] * 1e9;
        const  [event , cost , vault ] = await buy(suiClient,signer,vault_addr,sui_amount  );
        console.log("transefer:",sui_amount);
        show_transfer_event(event,vault,cost);
        if(event) {
             token_numbers.push(event?.token_amount);
        } else{
            console.log("event is null for sui_amount,token_amount",sui_amount,event );
        }
    }
    return token_numbers;
}


async function test_sell(token_numbers : bigint []){
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
    console.log("token numbers:",token_numbers);
    for(let i = token_numbers.length - 1; i >= 0; -- i){
        const [event , cost, vault ] = await sell_by_amount(suiClient,signer,signer.getPublicKey().toSuiAddress(),vault_addr,token_numbers[i]);
        
        show_transfer_event(event,vault,cost);
    }    
}

async function test(){
   let token_nums = await test_buy();
    await test_sell( token_nums);
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

//query_events();
