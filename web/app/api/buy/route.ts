import { NextResponse } from "next/server";
import {buy} from '@/lib/coin_operate';

export async function POST(request: Request) {
  console.log("upload/route.ts :post");
  const mnemonic = process.env.MNEMONIC;
  if(mnemonic == null){
    const msg = "configuration error,mnemonic not configured"
    return NextResponse.json({"message": msg}, {status:500,statusText:msg});
  }
  try {
    //const param = await getJsonParams(request);
  }catch(e){

  }

}