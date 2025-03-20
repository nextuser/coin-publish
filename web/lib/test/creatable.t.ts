import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { isCreatable ,} from "../publishCoin";
import suiConfig from '@/lib/suiConfig.json'
import { suiClient } from "@/contracts";
import { getLocalSigner } from "../sui/local_key";
import { getPrecreateTx } from "@/lib/publish_client";
import { getLocalSigners } from '../sui/local_key';
const signers = getLocalSigners();
const operator = signers[signers.length - 1 ];
const minter =  signers[signers.length - 2 ];

export async function waitCreate_test() : Promise<[boolean , string]>{
    const tx = getPrecreateTx(operator.toSuiAddress());
    const signer = getLocalSigner();
    const ret = await suiClient.signAndExecuteTransaction({transaction:tx, signer });
    const rsp = await suiClient.waitForTransaction({digest:ret.digest})
    console.log("waitCreate ret:",rsp);
    let succ : boolean = rsp.effects ?  rsp.effects.status.status == 'success' : false;
    let msg : string = rsp.effects ? rsp.effects.status.error! : ''; 
    return [succ , msg]
}

async function test(){
    console.log("---------wait create------------------");
    console.log(await waitCreate_test());

    
}

async function creatable_test(){
    console.log("-------------isCreatable-----------------");
    let ret = await isCreatable(suiClient,minter.toSuiAddress(),operator.toSuiAddress());
    console.log(ret)
}

//test();

creatable_test();