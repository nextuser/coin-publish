import suiConfig from '@/lib/suiConfig.json'
import { Transaction } from '@mysten/sui/transactions';
import { PublishCoinParams , PublishResult } from './types';
import { bcs } from '@mysten/bcs';
import { SuiClient } from '@mysten/sui/client';
import coin_types from '@/lib/coin_bytecode.json'
import * as template from '../pkg';
import { readCoinTemplateBytes } from '@/lib/sui/sui_utils';
import { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { getCost } from './sui/sui_utils';
import { CoinCreatedEvent } from './types';
import { Result } from './types';

export function getPrecreateTx(operator :string) : Transaction{
    const tx = new Transaction();
    const pkg = suiConfig.coin_manager_pkg;
    //entry public(package) fun  waitToCreate(coin : Coin<SUI> ,operator : address, manager :&mut Manager, ctx : & TxContext){
    let new_coin = tx.splitCoins(tx.gas,[15_000_000])
    const target = `${pkg}::coin_manager::waitToCreate`;
    console.log("getPrecreateTx target:",target);
    tx.moveCall({target, 
            arguments:[new_coin, tx.pure.address(operator),tx.object(suiConfig.coin_manager)]})
    tx.setGasBudget(1e8)
    return tx;
}

const init_url = async function(wasmUrl : string,useGzip : boolean){
    if(template.isInited()) return;
    
    try {
        const fetchUrl = useGzip ? wasmUrl.replace('wasm','gz') : wasmUrl;
        // 下载 WASM 文件
        const response = await fetch(fetchUrl);
        const buffer = await response.arrayBuffer();

        // 如果是 Gzip 文件，需要解压
        let wasmBuffer = buffer;
        if (useGzip) {
            const ds = new DecompressionStream('gzip');
            const stream = new Response(buffer).body!.pipeThrough(ds);
            wasmBuffer = await new Response(stream).arrayBuffer();
        }
        template.init(wasmBuffer);
    } catch (error) {
        console.error('Error loading or running WASM:', error);
    }
    
}


export async function init_template(wasmUrl : string,supportGzip : boolean) {
    try{                                
        await init_url(wasmUrl,supportGzip);
    }
    catch(error){
        return     {errMsg  : `fail to init_url for wasm:{wasmUrl}`,
                    isSucc : true}
    }
    return {isSucc:true};
}

export async function getPublishTx(params : PublishCoinParams, 
                    wasmUrl :string) : Promise<Result>
{
    if(params.decimal < 0 || params.decimal > 10 || params.decimal != Math.floor(params.decimal)){
        return {isSucc:false, errMsg:`decimal error ${params.decimal}`};
    }

    const bytecode = coin_types.modules;
    const deps = coin_types.dependencies;

    const ct = readCoinTemplateBytes()
    
    // let jsonRet = template.deserialize(ct.bytecode);
    // let bytes = template.serialize(jsonRet);
    // if(bytes.length != ct.bytecode.length){
    //     throw Error("template serialize/deserialize error");
    // }
    
    let updated = template.update_identifiers(ct.bytecode, {
        "TEMPLATE": params.module_name.toUpperCase(),
        "template": params.module_name
    });

    // Update DECIMALS
    updated = template.update_constants(
        updated,
        bcs.u8().serialize(params.decimal).toBytes(), // new value
        bcs.u8().serialize(9).toBytes(), // current value
        'U8', // type of the constant
    );

    // Update SYMBOL
    updated = template.update_constants(
        updated,
        bcs.string().serialize(params.symbol).toBytes(), // new value
        bcs.string().serialize('SYMBOL_TEMPLATE').toBytes(), // current value
        'Vector(U8)', // type of the constant
    );

    // Update NAME
    updated = template.update_constants(
        updated,
        bcs.string().serialize(params.coin_name).toBytes(), // new value
        bcs.string().serialize('COIN_NAME_TEMPLATE').toBytes(), // current value
        'Vector(U8)', // type of the constant
    );


    // Update desc
    updated = template.update_constants(
        updated,
        bcs.string().serialize(params.desc).toBytes(), // new value
        bcs.string().serialize('COIN_DESCRIPTION_TEMPLATE').toBytes(), // current value
        'Vector(U8)', // type of the constant
    );


    // Update URL
    let url = params.imageUrl ? params.imageUrl : '';
    updated = template.update_constants(
        updated,
        bcs.string().serialize(url).toBytes(), // new value
        bcs.string().serialize('IMAGE_URL_TEMPLATE').toBytes(), // current value
        'Vector(U8)', // type of the constant
    );

    let tx = new Transaction();
    let arr = updated as unknown as number[];
    let modules :number [][] = [];
    modules.push(arr)
    const [upgradeCap] = tx.publish({ modules, dependencies:deps });
    
    tx.transferObjects([upgradeCap], suiConfig.operator);
    tx.setGasBudget(1e8);
    return {isSucc:true,data:tx};
}


export function parsePublishResult(
        result : SuiTransactionBlockResponse
        ): PublishResult{
    const publishResult : PublishResult = {isSucc:true};
    ////console.log("wait response:",response);
    publishResult.publish_digest = result.digest;
    //publishResult.coin_type = params.coin_name;

    if (result.effects?.status?.status !== 'success') {
        console.log("effects:",result.effects);
        console.log('\n\nPublishing failed error=', result.effects?.status?.error,'result=',result);
        return {
            isSucc:false,
            errMsg : result.effects?.status?.error
        };
    }

    // console.log("-------------------published result :\n",result);
    publishResult.sui_cost = String(getCost(result.effects!.gasUsed!));

    console.log('-------object changes--------------');
    if(result.objectChanges){
        result.objectChanges.forEach((item) =>{
            if(item.type == 'published'){
                console.log('package id:',item.packageId);
                publishResult.coin_package_id = item.packageId;
            } else if (item.type == "created"){
                console.log("publish created object_type",item.objectType);
                const match = "::coin_manager::CurveVault<";
                const start_lt = item.objectType.indexOf(match)
                
                if(start_lt != -1){
                    publishResult.vault_id = item.objectId;
                    const c_start = start_lt + match.length;
                    const c_end = item.objectType.indexOf(">", c_start );
                    publishResult.coin_type = item.objectType.substring(c_start,c_end)
                }

                if(item.objectType.endsWith("0x2::package::UpgradeCap")){
                    publishResult.upgrade_cap = item.objectId;
                }
            }
        })
    }

    if(result.events){
        result.events.forEach((e)=>{
            if(e.type.endsWith('coin_manager::CoinCreatedEvent')){
                publishResult.created_event = e.parsedJson as CoinCreatedEvent
            }
            
        })
    }
    return publishResult;
}

