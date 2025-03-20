import {publishCoin } from '../publishCoin'
import {getLocalSigner} from '../sui/local_key';
//https://suiscan.xyz/testnet/coin/0x747a057e094034753faac5b7a6402f6482a5cb34d05d3fcb629c519da55c5c7b::ydt::YDT/txs


import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { isCreatable ,} from "../publishCoin";
import suiConfig from '@/lib/suiConfig.json'
import { suiClient } from "@/contracts";
import {  getAfterCreateTx} from "../publishCoin";
import { getPrecreateTx} from '../publish_client';
import { getLocalSigners } from '../sui/local_key';
const signers = getLocalSigners();
const operator = signers[signers.length - 1 ];
const minter =  signers[signers.length - 2 ];

export async function waitCreate() : Promise<[boolean , string]>{
    const tx = getPrecreateTx(operator.toSuiAddress());
    const ret = await suiClient.signAndExecuteTransaction({
        transaction:tx, 
        signer : minter,
        requestType : 'WaitForEffectsCert',
        options: {
            showEffects:true            
        }
     });

    let succ : boolean = ret.effects ?  ret.effects.status.status == 'success' : false;
    let msg : string = ret.effects ? ret.effects.status.error! : ''; 
    return [succ , msg]
}


async function create_coin(){
    const keypair = getLocalSigner();
    const OPERATOR = "0x16781b5507cafe0150fe3265357cccd96ff0e9e22e8ef9373edd5e3b4a808884"
    let publishResult = await publishCoin( {
        module_name:"ydt",
        coin_name : "袁大头",
        symbol : "YDT",
        decimal: 7,
        desc: "袁大头是一个有趣的代币",
	    minter : minter.toSuiAddress(),
        imageUrl : "https://img.alicdn.com/bao/uploaded/i4/2211353769366/O1CN01LfIYel2J3gPxGbQws_!!0-item_pic.jpg" 
    },operator);

    console.log("publish result:",publishResult);
    return publishResult;
}

//
async function after_create_test(vault:string, coint_type :string){
    const tx = getAfterCreateTx(minter.toSuiAddress(), vault,coint_type);
    const result = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer:operator,
        requestType : 'WaitForLocalExecution',
        options: {
            showEffects:true,
        }
    });
    return result;
    //console.log("----------------after_create_test result:", result)
}



async  function  getBlanace(addr : string) : Promise<bigint>{
    return BigInt( (await suiClient.getBalance({owner:addr})).totalBalance)
}

async function test(){
    console.log("---------wait create------------------");
    let minterBalance = await getBlanace(minter.toSuiAddress());
    let operatorBalance = await getBlanace(operator.toSuiAddress());
    
    let [succ,msg] =await waitCreate();
    if(!succ){
        console.log(msg)
        return;
    }

    

    console.log("-------------isCreatable-----------------");
    let creatable = await isCreatable(suiClient,minter.toSuiAddress(),operator.toSuiAddress());
    if(!creatable) {
        console.log("not creatable");
        return;
    }

    let ret = await create_coin()

    if(!ret.isSucc){
        console.log("isCreatable is not succ, errMsg:" ,ret.errMsg);
        return;
    }

    let after_result = await after_create_test(ret.created_event!.vault_address, ret.created_event!.type_name);
    console.log("succ status=",after_result.effects?.status.status);

    console.log(await getBlanace(minter.toSuiAddress()) - minterBalance);
    console.log(await getBlanace(operator.toSuiAddress()) - operatorBalance);
    

}

test();

//create_coin().then(console.log)

///after_create_test('0x6c918352545df45fcf73a7dab96da072fba36f4a3a7ed53268e362ac53dd2972','b612a02954e0b576827379eb2b4bd369fdfafc5337b40f641ea4c7f56022e9b1::ydt::YDT')