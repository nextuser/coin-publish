import { queryCreatedEvents , getSupply,getVault,getTypeByMeta } from "../coin_info";
import {get_buy_amount,get_sell_amount} from '../coin_curve'
import {getSigner,getLocalSigner} from '../sui/local_key';
import { SuiClient,getFullnodeUrl,GasCostSummary } from '@mysten/sui/client';
import { test_env as env } from "../sui/config";
import { Transaction } from "@mysten/sui/transactions";
import { sign } from "crypto";
import { CoinCreatedEvent } from "../types";
import dotenv from 'dotenv';
dotenv.config();


async function test(){
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') }); 
    let signer = getLocalSigner();
    let owner = signer.getPublicKey().toSuiAddress();
    let events = await queryCreatedEvents(suiClient,owner);
    let sui_amount = 28100000;

    
    if(events.length > 0){
        let vault_addr = process.env.VAULT
        if(vault_addr == null || vault_addr.length == 0){
            vault_addr = events[0].vault_address;
        }
        let vault = await getVault(suiClient,vault_addr);
        if(vault == null){
            console.log("find vault fain for :",vault_addr);
            return;
        }
        let supply = getSupply(vault);
        console.log("vault supply=",supply);

        let [token_amount,_] = get_buy_amount(Number(supply),sui_amount/1e9);
        token_amount = token_amount * (10** vault.meta.fields.decimals);
        console.log("token amount:",token_amount);
        let tx = new Transaction();
        let [new_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_amount)]);
        tx.setGasBudget(1000000000);
        let type_name = getTypeByMeta(vault.meta.type);
        console.log('coin type name from meta:');
       //entry fun Buy<T>(mut pay : Coin<SUI>, target_amount :u128,vault : &mut CurveVault<T>,ctx : &mut TxContext )
        tx.moveCall({
            target : `${process.env.COIN_MANAGER_PACKAGE}::coin_manager::entry_buy`,
            arguments : [
                new_coin,
                tx.pure.u128(Math.floor(token_amount)),
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
    
        console.log("result to execute:",result);
    }
    console.log(events);
}

test();