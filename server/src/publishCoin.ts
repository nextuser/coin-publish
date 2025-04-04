import fs from 'fs';
import path from 'path';
import { bcs } from '@mysten/bcs';
//import bytecode_template from '@mysten/move-bytecode-template/move_bytecode_template/move_bytecode_template';
import * as template from  '../pkg';

import { assert } from 'console';
import { Transaction } from '@mysten/sui/transactions';
import {getSigner,getLocalSigner} from './sui/local_key';
import { fromBase64,fromHex,toHex } from '@mysten/bcs';
import { SuiClient,getFullnodeUrl,GasCostSummary } from '@mysten/sui/client';
import { test_env as env } from "./sui/config";
import { threadId } from 'worker_threads';
import dotenv from 'dotenv'


type DumpFormat ={
    modules : string[],
    dependencies:string[],
    digest : Uint8Array[]
}

type CointCreatedEvent ={
    vault_address : string,
    type_name : string,
    meta_name : string,
    minter    : string,
    treasury_address : string,
}

type PublishCoinParams =  {
    module_name:string,
    coin_name : string,
    symbol :string ,
    decimal:number,
    desc:string ,initialSupply : string, imageUrl? : string
}

function coinTemplateBytes2() : [ Uint8Array,string[]]{
    let file = path.resolve(__dirname, '../../contracts/coin_simple/out.json');
    let json = JSON.parse(String(fs.readFileSync(file))) as DumpFormat;
    let bytecode : Uint8Array =  fromBase64(json.modules[0]);
    ///console.log("coinTemplateBytes2 hex:",toHex(bytecode));
    return [bytecode,json.dependencies];
}


type   CoinCreatedEvent={
    meta_name: string,
    minter: string,
    treasury_address:string, 
    type_name: string
}

type  PublishResult = {
    coin_package_id? : string,
    coin_type? : string,
    vault_id? : string,
    publish_digest? : string,
    sui_cost ? :bigint,
    upgrade_cap? : string,
    created_event? : CoinCreatedEvent,

}

function getCost(gasUsed:GasCostSummary) : bigint{
    return BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost)    - BigInt(gasUsed.storageRebate);
}

async function publishCoin(params : PublishCoinParams, operator :string) : Promise<PublishResult>{

    let publishResult : PublishResult = {};
    //let version = template.version();
    //console.log(version);
    console.log("publish coin");

    let [bytecode,deps] = coinTemplateBytes2();
    //console.log("bytecode length :",bytecode.length);

    
    let jsonRet = template.deserialize(bytecode);
    let bytes = template.serialize(jsonRet);
    assert(bytes.length == bytecode.length);
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
    // console.log("---------------response--------------",response);
    // console.log("digest:",result.digest);
    publishResult.publish_digest = result.digest;
    publishResult.coin_type = params.coin_name;
    
    if (result.effects?.status?.status !== 'success') {
        // console.log('\n\nPublishing failed');
        return publishResult;
    } else{
        // console.log("publish succeed ");
    }

    // console.log("-------------------published result :\n",result);
    publishResult.sui_cost = getCost(result.effects!.gasUsed!);

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
        suiClient.queryEvents({query:{Transaction : result.digest }}).then((events)=>{
            events.data.forEach((item)=>{
                //console.log("event:",item);    
                if(item.type.endsWith("coin_manager::CointCreatedEvent")){
                    publishResult.created_event =  item.parsedJson as CoinCreatedEvent;
                }
            });
        })
    }

    let newbalance = await suiClient.getBalance({owner:signer.getPublicKey().toSuiAddress()})
    console.log("cost", (Number(newbalance.totalBalance) - Number(balance.totalBalance))/1e9);
    ///console.log("coin type:",balance.coinType,newbalance.coinType,balance,newbalance);
    return publishResult;
}


//https://suiscan.xyz/testnet/coin/0x747a057e094034753faac5b7a6402f6482a5cb34d05d3fcb629c519da55c5c7b::ydt::YDT/txs
async function test_publish(){
    const OPERATOR = "0x16781b5507cafe0150fe3265357cccd96ff0e9e22e8ef9373edd5e3b4a808884"
    let publishResult = await publishCoin( {
        module_name:"ydt",
        coin_name : "袁大头",
        symbol : "YDT",
        decimal: 7,
        desc: "袁大头是一个有趣的代币",
        initialSupply : "1000000000000000000",
        imageUrl : "https://img.alicdn.com/bao/uploaded/i4/2211353769366/O1CN01LfIYel2J3gPxGbQws_!!0-item_pic.jpg" 
    },OPERATOR);

    console.log("publish result:",publishResult);
}

if(process.env.TEST=='1'){
    test_publish();
}