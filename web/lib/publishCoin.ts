import fs from 'fs';
import path from 'path';
import { bcs } from '@mysten/bcs';
//import bytecode_template from '@mysten/move-bytecode-template/move_bytecode_template/move_bytecode_template';
//import * as template from  'move-bytecode-template';
import * as template from '../pkg';
import { assert } from 'console';
import { Transaction } from '@mysten/sui/transactions';
import {getSigner,getLocalSigner} from './sui/local_key';
import { fromBase64,fromHex,toHex } from '@mysten/bcs';
import { SuiClient,getFullnodeUrl,GasCostSummary } from '@mysten/sui/client';
import { test_env as env } from "./sui/config";
import { threadId } from 'worker_threads';
import dotenv from 'dotenv'
import { getCost } from './sui/sui_client';
import { CoinCreatedEvent,PublishCoinParams,PublishResult,HttpPublishResponse } from './types';
import { types } from 'util';
type DumpFormat ={
    modules : string[],
    dependencies:string[],
    digest : Uint8Array[]
}

import module_bytes from './out.json'
import { responseCookiesToRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
function readCoinTemplateBytes() : [ Uint8Array,string[]]{
    //let file = path.resolve(__dirname, './out.json');
    //let json = JSON.parse(String(fs.readFileSync(file))) as DumpFormat;
    let bytecode : Uint8Array =  fromBase64(module_bytes.modules[0]);
    ///console.log("readCoinTemplateBytes hex:",toHex(bytecode));
    return [bytecode,module_bytes.dependencies];
}




export function getPublishHttpResponse(  publish_info: PublishResult) : HttpPublishResponse{
    const response : HttpPublishResponse = {
        body : {  message : publish_info.errMsg || "success" ,
                  publish_info
               },
        options : {
            status : publish_info.isSucc ? 200 : 500,
            statusText : publish_info.errMsg
        }
    }   
    return response;
}


const INITIAL_SUPPLY = 1000_000_000;
export async function publishCoin(params : PublishCoinParams, operator :string) : Promise<PublishResult>{

    let publishResult : PublishResult = {isSucc:true};
    //let version = template.version();
    //console.log(version);
    //console.log("publish coin");

    let [bytecode,deps] = readCoinTemplateBytes();
    //console.log("bytecode length :",bytecode.length);
    
    let jsonRet = template.deserialize(bytecode);
    let bytes = template.serialize(jsonRet);
    assert(bytes.length == bytecode.length);

    if(params.decimal < 0 || params.decimal > 10 || params.decimal != Math.floor(params.decimal)){
        return {
            isSucc: false,
            errMsg: `decimal: ${params.decimal} should in [0..10] `
        } 
    }
    // console.log("jsonRet",jsonRet);
    // console.log("bytes ",bytes);
    // console.log("bytecodes ",json.modules[0]);

    
    // please, manually scan the existing values, this operation is very sensitive
    ///console.log("constants:",template.get_constants(bytecode));

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
    if(params.imageUrl){
        updated = template.update_constants(
            updated,
            bcs.string().serialize(params.imageUrl).toBytes(), // new value
            bcs.string().serialize('IMAGE_URL_TEMPLATE').toBytes(), // current value
            'Vector(U8)', // type of the constant
        );
    }


       // Update URL
    updated = template.update_constants(
        updated,
        bcs.u64().serialize(INITIAL_SUPPLY).toBytes(), // new value
        bcs.u64().serialize('1000000').toBytes(), // current value
        'U64', // type of the constant
    );
    let signer = getLocalSigner();
    let tx = new Transaction();
    let arr = updated as unknown as number[];
    let modules :number [][] = [];
    modules.push(arr)
    const [upgradeCap] = tx.publish({ modules, dependencies:deps });
    // console.log("upgradeCap:",upgradeCap);

    tx.transferObjects([upgradeCap], operator);
    tx.setGasBudget(1e8);
    
    let config = env.config();
    const suiClient = new SuiClient({ url: getFullnodeUrl(config.env) });    
    let balance = await suiClient.getBalance({owner:signer.getPublicKey().toSuiAddress()});


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


    let response  = await suiClient.waitForTransaction({ digest: result.digest });
    console.log("---------------response--------------",response);
    console.log("digest:",result.digest);
    publishResult.publish_digest = result.digest;
    publishResult.coin_type = params.coin_name;
    
    if (result.effects?.status?.status !== 'success') {
        // console.log('\n\nPublishing failed');
        return {
            isSucc:false,
            errMsg : result.effects?.status?.error
        };
    } else{
        // console.log("publish succeed ");
    }

    // console.log("-------------------published result :\n",result);
    publishResult.sui_cost = String(getCost(result.effects!.gasUsed!));

    // const createdObjectIds = result.effects.created!.map(
    //     (item) => {
    //         console.log("created:",item)
    //         return item.reference.objectId
    //     }
    // );
    // const createdObjects = await suiClient.multiGetObjects({
    //     ids: createdObjectIds,
    //     options: { showContent: true, showType: true, showOwner: true },
    // });

    // console.log('-------created objects--------------');
    // createdObjects.forEach((item) => {
    //     if(item.data){
    //         console.log("id,type,owner",item.data.objectId,item.data.type,item.data.owner);
    //     }
    // })


    console.log('-------object changes--------------');
    if(result.objectChanges){
        result.objectChanges.forEach((item) =>{
            if(item.type == 'published'){
                console.log('package id:',item.packageId);
                publishResult.coin_package_id = item.packageId;
            } else if (item.type == "created"){
                if(item.objectType.endsWith("coin_manager::CurveVault")){
                    publishResult.vault_id = item.objectId;
                }

                if(item.objectType.endsWith("0x2::package::UpgradeCap")){
                    publishResult.upgrade_cap = item.objectId;
                }
                // if(item.objectType.endsWith("coin_manager::CointCreatedEvent")){
                //     console.log("CoinCreatedEvent",item);
                // } 
                // console.log("created objects:id, objectType,owner",item.objectId, item.objectType,item.owner)
            }
        })
    }

    let eventsDigest = result.effects.eventsDigest;
    if(eventsDigest){
       let events = await suiClient.queryEvents({query:{Transaction : result.digest }});
        events.data.forEach((item)=>{
            //console.log("event:",item);    
            if(item.type.endsWith("coin_manager::CoinCreatedEvent")){
                publishResult.created_event =  item.parsedJson as CoinCreatedEvent;
                publishResult.event_type = item.type;
            }
        });
    }

    let newbalance = await suiClient.getBalance({owner:signer.getPublicKey().toSuiAddress()})
    console.log("cost", (Number(newbalance.totalBalance) - Number(balance.totalBalance))/1e9);
    ///console.log("coin type:",balance.coinType,newbalance.coinType,balance,newbalance);
    return publishResult;
}


