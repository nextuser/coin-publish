import { SuiClient,SuiEvent,CoinStruct,  } from '@mysten/sui/client';
import { Transaction,TransactionArgument } from '@mysten/sui/transactions';
import { CoinCreatedEvent , CoinTransferEvent, CurveVault } from './types';
import { getCost } from './sui/sui_utils';
import { Keypair } from "@mysten/sui/cryptography";
import { get_buy_amount,get_sell_amount } from './coin_curve';
import { getTypeByMeta } from './utils';
import suiConfig from '@/lib/suiConfig.json'
import { getVault,queryCreatedEvents,queryCoinVaults,queryTransferEvents ,getSupply,getTransferEvent,getTokenByAmount, getNormalizeSupply} from './coin_info';
import { Coins } from 'lucide-react';
import { resourceLimits } from 'worker_threads';
import { Result } from './types';
type BuyRequest ={
    vault_address:string,
    sui_amount : string,
}   

type TransferResult ={
    transferEvent?:CoinTransferEvent,
    cost : bigint,
    vault? : CurveVault,
}

async function getTokensFormAmount(
    suiClient:SuiClient,
    tx:Transaction, 
    owner:string,
    coinType:string, 
    targetAmount : bigint)
     
    {
    let amount = 0;
    let cursor = undefined;
    const coins = []
    let hasNext = false;
    do{

        let result = await suiClient.getCoins({owner,coinType,cursor,})
        for(let c of result.data){
            coins.push(tx.object(c.coinObjectId))
            amount += Number(c.balance)
            if(amount >= targetAmount){
                return {isSucc:true,data:{coins,amount}};
            }
        }

        if(!result.hasNextPage ){
            break;
        }
        if(result.nextCursor){
            cursor = result.nextCursor;
        }else{
            break;
        }
        
    }while(amount < targetAmount );

    return {isSucc:amount>= targetAmount, data:{coins,amount}}
}

export async function getSellTx(
                                suiClient: SuiClient,
                                vault:CurveVault,
                                token_amount : number, 
                                owner:string)
                                : Promise<Result>
                                {
    const s0 = getNormalizeSupply(vault);
    const [sui_amount,_] = get_sell_amount(s0,token_amount);
    const tx = new Transaction();
    tx.setGasBudget(1e8);
    const targetAmount = BigInt(Math.floor(token_amount * Number(vault.token_decimals_value)) ); 
    const coinType = getTypeByMeta(vault.meta.type);
    const {isSucc,data} = await getTokensFormAmount(suiClient,tx, owner,coinType, targetAmount )
    const tokens = data.coins;
    const new_amount = data.amount;
    if(!isSucc){
        return {isSucc:false,errMsg:`can not find enough token getTokensFormAmount targetAmount=${targetAmount}`}
    }
    console.log("tokens:",tokens);
    let new_coin : TransactionArgument = tokens[0]; 
    if(tokens.length > 1){
        tx.mergeCoins(tokens[0], tokens.slice(1))
    }
    let coin2 : TransactionArgument = new_coin;
    if(new_amount > targetAmount){
        [coin2] = tx.splitCoins(new_coin,[targetAmount])
    }
    //entry public fun --sell <T>(token : Coin<T>,vault : &mut CurveVault<T>,ctx : &mut TxContext )
    tx.moveCall({
        target: `${suiConfig.coin_manager_pkg}::coin_manager::entry_sell`,
        arguments: [
            coin2,
            tx.object(vault.id.id)
        ],
        typeArguments: [coinType]
    });
    return {isSucc:true,data:tx};
}

export function getBuyTx(vault:CurveVault,sui_amount_mist : number){
    const sui_amount = sui_amount_mist / Number(vault.sui_decimals_value)
    let supplied_token = getSupply(vault);
    console.log("vault supplied_token=",supplied_token);
    let tdv = Number(vault.token_decimals_value);
    let normalized_s0 = Number(supplied_token) / tdv;
    let [token_amount, _] = get_buy_amount(normalized_s0, sui_amount);
    
    console.log("getBuyTx token amount:",token_amount,"sui amount", sui_amount);
    let tx = new Transaction();
    let [new_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_amount_mist)]);
    tx.setGasBudget(1e8);
    let type_name = getTypeByMeta(vault.meta.type);

    tx.moveCall({
        target: `${suiConfig.coin_manager_pkg}::coin_manager::entry_buy`,
        arguments: [
            new_coin,
            tx.pure.u64(Math.floor(token_amount * tdv)),
            tx.object(vault.id.id)
        ],
        typeArguments: [type_name]
    });
    return tx;
}
export async function buy(suiClient: SuiClient,
    keypair: Keypair,
    vault_addr: string,
    sui_amount: number): Promise<[CoinTransferEvent | null, bigint, CurveVault | null]> {

    let vault = await getVault(suiClient, vault_addr);
    if (vault == null) {
        console.log("find vault fail to queryVault :", vault_addr);
        return [null, 0n, vault];
    }

    console.log("getBuyTx ",sui_amount);
    const tx = getBuyTx(vault,sui_amount)
    console.log("await signAndExecuteTransaction");

    const result = await suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
            showEffects: true,
            ///showObjectChanges:true,
            showEvents: true
        },
        requestType: 'WaitForLocalExecution',
    });
    let event = getTransferEvent(result.events!);
    return [event, getCost(result.effects?.gasUsed), vault]
}

export async function sell_by_amount(suiClient: SuiClient,
    keypair: Keypair,
    owner: string,
    vault_addr: string,
    token_num: bigint)
    : Promise<[CoinTransferEvent | null, bigint, CurveVault | null]> {

    let vault = await getVault(suiClient, vault_addr);
    const emp_result: [CoinTransferEvent | null, bigint, CurveVault | null] = [null, 0n, vault]

    if (vault == null) {
        console.log("invalid args ,vault_addr:", vault_addr);
        return emp_result;
    }

    let type_name = getTypeByMeta(vault.meta.type);
    let token = await getTokenByAmount(suiClient, owner, type_name, token_num);
    return await sell(suiClient, keypair, owner, vault, token);
}


export async function sell(suiClient: SuiClient,
    keypair: Keypair,
    owner: string,
    vault: CurveVault,
    token: CoinStruct | null)
    : Promise<[CoinTransferEvent | null, bigint, CurveVault | null]> {

    const emp_result: [CoinTransferEvent | null, bigint, CurveVault | null] = [null, 0n, vault]


    if (vault == null || token == null) {
        console.log("invalid args ,(vault,token):", vault, token);
        return emp_result;
    }

    let tdv = Number(vault.token_decimals_value);
    let token_amount = Number(token.balance) / tdv;
    let tds = Number(vault.token_decimals_value);
    let supplied_token = getSupply(vault);
    let s0 = Number(supplied_token) / tdv;
    //console.log('get_sell_amount(s0, token_amount)', s0,token_amount);
    let [sui_amount, _] = get_sell_amount(s0, token_amount)

    //console.log("--sell  :token amount,sui_amount:",token_amount,sui_amount);
    let tx = new Transaction();
    tx.setGasBudget(1000000000);
    ///console.log("token",token);

    //entry public fun --sell <T>(token : Coin<T>,vault : &mut CurveVault<T>,ctx : &mut TxContext )
    tx.moveCall({
        target: `${suiConfig.coin_manager_pkg}::coin_manager::entry_sell`,
        arguments: [
            tx.object(token.coinObjectId),
            tx.object(vault.id.id)
        ],
        typeArguments: [token.coinType]
    });
    //console.log("--sell  :expect sui",sui_amount * Number(vault.sui_decimals_value));

    const result = await suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
            showEffects: true,
            ///showObjectChanges:true,
            showEvents: true
        },
        requestType: 'WaitForLocalExecution',
    });

    let event = getTransferEvent(result.events!);
    return [event, getCost(result.effects?.gasUsed), vault];
}