// app/api/upload/route.ts
'use server'
import { NextResponse } from 'next/server';
import {fetch_coin_owners} from '@/lib/coin_owner'

 
export async function POST(request: Request) {
  try {
    const obj = await request.json();
    console.log("publish coin param:",obj);
    const coin_type = obj.coin_type;
    const rsp = await fetch_coin_owners(coin_type);
    if(rsp?.code == '200'){
        return NextResponse.json({data :rsp.result.data},{status: 200 ,headers:{'Content-Type':'application/json'}})
    } else {
        return NextResponse.json({ message:rsp?.message}, 
                            { status: 500 ,headers:{'Content-Type':'application/json'},statusText: rsp?.message});
    }
  } catch(error){
    return NextResponse.json({ message:'catch error: ${error}'}, 
        { status: 500 ,headers:{'Content-Type':'application/json'}});
  }
}

