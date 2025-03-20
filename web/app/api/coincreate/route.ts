// app/api/upload/route.ts
'use server'
import axios from 'axios';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import suiConfig from '@/lib/suiConfig.json'
import { MintForm } from '@/lib/types';
import { PublishCoinParams } from '@/lib/types';
import { publishCoin,getPublishHttpResponse, getAfterCreateTx } from '@/lib/publishCoin';
import { isCreatable } from '@/lib/creatable';
import { Keypair } from '@mysten/sui/cryptography';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getServerSideSuiClient } from '@/lib/suiClient';
 async function  getJsonParams(request:Request) {
    const form = await request.json() as MintForm;
    const symbol = form.symbol;
    const image = form.image;
    let param :PublishCoinParams = {
        module_name: symbol.toLowerCase(),
        coin_name : form.name,
        symbol : symbol.toUpperCase() ,
        decimal: Number(form.decimals) ,
        desc: form.description ,
        minter : form.minter,
        imageUrl : image.length > 0  ? image : undefined,
        
    }
    
    return param
 }

 
export async function POST(request: Request) {
  console.log("upload/route.ts :post");
  const mnemonic = process.env.MNEMONIC;
  if(mnemonic == null){
    const msg = "configuration error,mnemonic not configured"
    return NextResponse.json({"message": msg}, {status:500,statusText:msg});
  }
  try {
    const param = await getJsonParams(request);
    console.log("publish coin param:",param);
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic)
    const suiClient = getServerSideSuiClient();
    //let object = await suiClient.getObject({id:suiConfig.coin_manager,options:{showContent:true}});
    //console.log(object);
    if(!await isCreatable(suiClient,param.minter,suiConfig.operator)){
        return NextResponse.json({ message: String("not creatable")}, 
                                 { status: 500 ,headers:{'Content-Type':'application/text'}});
    }
    let result = await publishCoin(param,keypair);
    
    console.log('publishCoinresult:',result);
    if(!result.isSucc){
      let pr  = getPublishHttpResponse(result,result);
      return NextResponse.json(pr.body,pr.options);
    }

    const tx = await getAfterCreateTx(param.minter,result.created_event!.vault_address,result.created_event!.type_name);
    const after_result  = await suiClient.signAndExecuteTransaction({transaction:tx, signer:keypair,options : {showEffects:true}});
    let succ = after_result.effects?.status.status == 'success';

    let pr  = getPublishHttpResponse({isSucc:succ,errMsg:after_result.effects?.status.error},result);
    return NextResponse.json(pr.body,
                             pr.options);
  } catch (error ) {
    console.error('api/coincreate fail:', error);
    return NextResponse.json({ message:error}, 
                            { status: 500 ,headers:{'Content-Type':'application/json'}});
  }
}

