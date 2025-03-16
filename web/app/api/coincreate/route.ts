// app/api/upload/route.ts
import axios from 'axios';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSuiConfig } from '@/lib/sui/sui_config';
import { MintForm } from '@/lib/types';
import { PublishCoinParams } from '@/lib/types';
import { publishCoin,getPublishHttpResponse } from '@/lib/publishCoin';
import { getURLFromRedirectError } from 'next/dist/client/components/redirect';



    
type ArgType = keyof MintForm;
function get_string_value(formData:FormData , name :ArgType){
    let value = formData.get(name);
    if(value != null && typeof(value) == 'string'){
        return value;
    } else{
        throw new Error(`invalid paramter value ,paramter name ${name}, value=${value}`)
    }

}


 async function getCoinParams(request:Request){
    const formData = await request.formData();

    const suiConfig = await getSuiConfig();
    let symbol = get_string_value(formData,'symbol');
    let decimals = get_string_value(formData,'decimals');
    let image = get_string_value(formData,'image');
    let description = get_string_value(formData,'description')
    const name = get_string_value(formData ,'name' );

    let param :PublishCoinParams = {
        module_name: symbol.toLowerCase(),
        coin_name : name,
        symbol : symbol ,
        decimal: Number(decimals) ,
        desc: description ,
        imageUrl : image.length > 0  ? image : undefined
    }
    return  param;
 }

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
        imageUrl : image.length > 0  ? image : undefined
    }
    
    return param
 }

 
export async function POST(request: Request) {
  console.log("upload/route.ts :post");
  try {
    const param = await getJsonParams(request);
    const suiConfig = await getSuiConfig();
    console.log("publish coin param:",param);
    let result = await publishCoin(param,suiConfig.operator);
    let pr  = getPublishHttpResponse(result);
    return NextResponse.json(pr.body,
                              pr.options);


  } catch (error ) {
    console.error('上传失败:', error);
    return NextResponse.json({ message: String(error)}, 
                            { status: 500 ,headers:{'Content-Type':'application/json'}});
  }
}

