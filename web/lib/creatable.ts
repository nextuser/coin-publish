import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import suiConfig from '@/lib/suiConfig.json';

export async function isCreatable(suiClient : SuiClient , minter : string, operator : string) :Promise<boolean>{
    const tx = new Transaction();
    console.log("isCreatable:",minter,operator);
    //public fun is_creatable_by(user:address,manager :& Manager, ctx : &mut  TxContext) : bool
    tx.moveCall({
        target : `${suiConfig.coin_manager_pkg}::coin_manager::is_creatable_by`,
        arguments: [tx.pure.address(minter),tx.object(suiConfig.coin_manager)],
    })
    console.log("suiclient ",suiClient);
    const ret = await suiClient.devInspectTransactionBlock({transactionBlock: tx ,sender : operator})
    if(ret.results && ret.results.length > 0 ){
        ///console.log('return values ',ret.results[0].returnValues)
        return ret.results[0].returnValues![0][0][0] != 0
    } 
    return false;
}