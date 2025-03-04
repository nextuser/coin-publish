import { queryCreatedEvents , getSupply } from "../coin_info";
import {get_buy_amount,get_sell_amount} from '../coin_curve'
import {getSigner,getLocalSigner} from '../sui/local_key';
import { SuiClient,getFullnodeUrl,GasCostSummary } from '@mysten/sui/client';
import { test_env as env } from "../sui/config";
import { Transaction } from "@mysten/sui/transactions";
import { sign } from "crypto";

async function test(){
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') }); 
    let signer = getLocalSigner();
    let owner = signer.getPublicKey().toSuiAddress();
    let events = await queryCreatedEvents(suiClient,owner);
    let sui_amount = 28100000;
    


    if(events.length > 0){
        let event = events[0];
        let supply = await getSupply(suiClient,event.vault_address);
        console.log("vault supply=",supply);

        let [token_amount,_] = get_buy_amount(Number(supply),sui_amount/1e9);
        let tx = new Transaction();
        let [new_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_amount)]);
        tx.setGasBudget(1000000000);
       //entry fun Buy<T>(mut pay : Coin<SUI>, target_amount :u128,vault : &mut CurveVault<T>,ctx : &mut TxContext )
        tx.moveCall({
            target : `${process.env.COIN_MANAGER_PACKAGE}::coin_manager::Buy`,
            arguments : [
                new_coin,
                tx.pure.u128(Math.floor(token_amount)),
                tx.object(event.vault_address)
            ],
            typeArguments:[event.type_name]
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