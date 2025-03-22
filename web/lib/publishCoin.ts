import { bcs } from '@mysten/bcs';
//import bytecode_template from '@mysten/move-bytecode-template/move_bytecode_template/move_bytecode_template';
//import * as template from  'move-bytecode-template';
import * as template from '../pkg';
import { assert } from 'console';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64,fromHex,toHex } from '@mysten/bcs';
import { SuiClient,getFullnodeUrl } from '@mysten/sui/client';
import { test_env as env } from "./sui/config";
import { Keypair } from '@mysten/sui/cryptography';
import { getCost } from './sui/sui_utils';
import { CoinCreatedEvent,PublishCoinParams,PublishResult,HttpPublishResponse, CurveVault } from './types';
import suiConfig from '@/lib/suiConfig.json'; 
import { normaize_address } from './utils';
import { Result } from './types';
import { readCoinTemplateBytes } from '@/lib/sui/sui_utils';

type DumpFormat ={
    modules : string[],
    dependencies:string[],
    digest : Uint8Array[]
}




//public fun after_create<T>(user : address,vault : &mut CurveVault<T>,manager:&mut Manager , ctx : &mut TxContext)
export function getAfterCreateTx(minter:string,vault :string, coin_type :string):Transaction{
    
    const tx = new Transaction();
    const pkg = suiConfig.coin_manager_pkg;
    const target =  `${pkg}::coin_manager::after_create`;
    console.log('after_create argurments',target,minter,vault,suiConfig.coin_manager ,' type-arguments:',coin_type);
    const arg = { target , 
        arguments:[tx.pure.address(minter), tx.object(vault),tx.object(suiConfig.coin_manager),],
        typeArguments : [coin_type] 
    }
    //console.log("getAfterCreateTx , arg", arg);
    tx.moveCall(arg)
    tx.setGasBudget(1e8)
    return tx;
}





export function getPublishHttpResponse(  result: Result ,publishResult? : PublishResult) : HttpPublishResponse{
    const response : HttpPublishResponse = {
        body : {  message : result.errMsg || "success" ,
                  result,
                  publishResult
               },
        options : {
            status : result.isSucc ? 200 : 500,
            statusText : result.errMsg
        }
    }   
    return response;
}

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

export async function publishCoin(params : PublishCoinParams,  signer : Keypair, wasmUrl? :string) : Promise<PublishResult>{

    let publishResult : PublishResult = {isSucc:true};
    const ct = readCoinTemplateBytes();
    const bytecode = ct.bytecode;
    const deps = ct.dependencies;
    if(wasmUrl){
        template.init_url(wasmUrl);
    } else{
        template.init_local();
    }
    
    let jsonRet = template.deserialize(bytecode);
    let bytes = template.serialize(jsonRet);
    assert(bytes.length == bytecode.length);

    if(params.decimal < 0 || params.decimal > 10 || params.decimal != Math.floor(params.decimal)){
        return {
            isSucc: false,
            errMsg: `decimal: ${params.decimal} should in [0..10] `
        } 
    }

    
    let updated = template.update_identifiers(bytecode, {
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

    const operator = signer.getPublicKey().toSuiAddress();

    let tx = new Transaction();
    let arr = updated as unknown as number[];
    let modules :number [][] = [];
    modules.push(arr)
    const [upgradeCap] = tx.publish({ modules, dependencies:deps });
    
    tx.transferObjects([upgradeCap], operator);
    tx.setGasBudget(1e8);
    
    let config = env.config();
    const suiClient = new SuiClient({ url: getFullnodeUrl(config.env) });    
    let balance = await suiClient.getBalance({owner:operator});

    const result = await suiClient.signAndExecuteTransaction({
        signer: signer,
        transaction: tx,
        options: {
            showEffects: true,
            showObjectChanges : true,
            ///showObjectChanges:true,
            showEvents:true
        },
        requestType: 'WaitForLocalExecution',
    });

    console.log('-------------execute result--------------');
    // console.log(result,result);
    let response  = await suiClient.waitForTransaction({ digest: result.digest });
    // console.log("---------------response--------------",response);
    ////console.log("wait response:",response);
    publishResult.publish_digest = result.digest;
    publishResult.coin_type = params.coin_name;
    
    if (result.effects?.status?.status !== 'success') {
        console.log('\n\nPublishing failed', result);
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
                if(item.objectType.indexOf("::coin_manager::CurveVault<") != -1){
                    publishResult.vault_id = item.objectId;
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

 
    let newbalance = await suiClient.getBalance({owner:operator})
    console.log("cost", (Number(newbalance.totalBalance) - Number(balance.totalBalance))/1e9);
    ///console.log("coin type:",balance.coinType,newbalance.coinType,balance,newbalance);
    return publishResult;
}


