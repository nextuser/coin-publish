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

function show_transfer_header(){
    console.log(
    's0',
    'token_delta' , 
    'sui',
    'sui_delta',
    'fee',
    'from', 
    'to', 
    ); 
}
function show_transfer_event(e : CoinTransferEvent|null,vault :CurveVault | null , fee : bigint){
    if(e == null || vault == null){
        console.log("show_transfer_event invalid arg e=",e,'vault=',vault);
    }
    else{
        let tdv = Number(vault!.token_decimals_value);
        let sdv = Number(vault!.sui_decimals_value);
        console.log(Number(e.token_before_transfer)/tdv,
                    Number(e.token_amount)/tdv , 
                    Number(vault.curve_money)/sdv,
                    Number(e.sui_amount)/sdv,
                    fee,
                    e.token_from, 
                    e.token_to, 
                    
                );
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
    show_transfer_header();
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
    show_transfer_header()
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
    show_transfer_header();
    if(events != null){
        events.forEach((e)=>{
            show_transfer_event(e,vault,0n);
        });
    }
        
}

test();

//query_events();
