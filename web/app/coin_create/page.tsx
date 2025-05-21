// src/components/CreateCoin.tsx - 界面三
'use client'
import React, { useState } from 'react';
import { useCurrentWallet,useCurrentAccount ,useSignAndExecuteTransaction, SuiClientContext} from '@mysten/dapp-kit';
import { CoinCreatedEvent,PublishCoinParams } from '@/lib/types';
import { ConnectButton } from '@mysten/dapp-kit';
import { SUI_DECIMALS } from '@mysten/sui/utils';
import { number } from 'echarts';
import { publishCoin } from '@/lib/publishCoin';
import CopyButton from '@/components/CopyButton';
import ViewTransaction from '@/components/CopyViewTransaction';
import IntegerInput from '@/components/IntegerInput';
import ImageFileUpload from '@/components/ImageFileUpload'
import { MintForm } from '@/lib/types';
import { PublishedBody,PublishResult} from '@/lib/types';
import  Link  from 'next/link';
import { redirect } from 'next/navigation';
import { Transaction } from '@mysten/sui/transactions';
import { useSuiClient } from '@mysten/dapp-kit';
import  suiConfig from '@/lib/suiConfig.json'
import { Result } from '@/lib/types';
import { NextPage } from 'next';
import { getPrecreateTx} from '@/lib/publish_client';
import { Button } from '@/components/ui/button';

export default function CoinCreate(): React.ReactNode {
  
  const wallet = useCurrentWallet();
  const account = useCurrentAccount();

  const empty_form = {
    name: '',
    symbol: '',
    decimals : '4',
    description: '',
    image: '',
    minter : account ? account.address : ''
  }
  const [form, setForm] = useState<MintForm>(empty_form);
  const [pr,setPr] = useState<PublishResult|null> (null)
  const pkg = suiConfig.coin_manager_pkg;
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction(); 


  if (!wallet.isConnected || !account) {
    return <div>Please connect your SUI wallet to create a coin </div>;
  }
  
  async function preCreate(  cb: ()=>Promise<void>) : Promise<Result> {
    const tx : Transaction  = getPrecreateTx(suiConfig.operator);
    let ret : Result = {isSucc:true};
    await signAndExecuteTransaction({transaction:tx},{
      onSuccess:() =>{
        cb().then(()=>{
        ret = {isSucc:true}
        });
      },
      onError: (err)=>{ 
          ret = { isSucc : false,errMsg:`fail to call coin_manager::waitToCreate ${err.message}`};
      }
    });
    return ret;
  }
  
  const create_coin = async ()=>{
    try {
      const uploadUrl = '/api/coincreate';
      console.log("uploadFile:",uploadUrl);
      form.minter = account!.address
        
      const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form)
      });
      console.log("response of api/uploadUrl")
      if(response.ok){
        const rspBody = await response.json() as unknown as PublishedBody;
        
        if(rspBody.publishResult){
          setPr(rspBody.publishResult);
        } else {
          setPr(null);
        }
        console.log("rspBody:",rspBody);
      } else{
        setPr({isSucc:false,errMsg: response.statusText})
      }
    } catch (error) {
      console.error('Failed to create coin:', error);
      setPr(null)
    }
  }
  
  const handleCreate = async () => {
    const result = await preCreate( create_coin);

    console.log("precreate result:",result);

    if(!result.isSucc){
      return <p>{result.errMsg}</p>
    }
  };


  return (
    <div className="create-coin w-800 ">
      <center>
      <div className="grid grid-cols-2 gap-4">
            <label htmlFor="Name" className="block text-sm font-medium text-gray-700">Name</label>

            <input 
            name='Name'
            placeholder="Name" 
            value={form.name} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            onChange={(e) => setForm({...form, name: e.target.value})} 
            />
            <label htmlFor="Symbol" className="block text-sm font-medium text-gray-700">
                Symbol
            </label>
            <input 
            name='Symbol'
            placeholder="Symbol" 
            value={form.symbol} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            onChange={(e) => setForm({...form, symbol: e.target.value})} 
            />
            <label htmlFor="Decimals" className="block text-sm font-medium text-gray-700">
                Decimals
            </label>
            <IntegerInput 
            name='Decimals'
            value={form.decimals}
            min = {0}
            max = {10} 
            setValue= {(s:string) => setForm({...form,decimals : s }) }></IntegerInput>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                image
            </label>
            <ImageFileUpload setFileUrl={(url:string) => setForm({...form, image: url})} fileUrl={form.image}></ImageFileUpload>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Description
            </label>
            <textarea 
            placeholder="Description" 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            />

          <Button variant="action" onClick={(e)=>{ setForm(empty_form)}} >Reset</Button>
          <Button variant="action" onClick={(e)=>{ handleCreate()}}  disabled={!wallet.isConnected}>Create Coin</Button>
      </div>
      { pr && pr.isSucc && <div>
        {pr.publish_digest && (
        <div className="grid grid-cols-1 gap-4  w-800">
          <div><CopyButton display={pr.publish_digest!} copy_value={pr.publish_digest!} size={20} fontSize={12}></CopyButton></div>
          <div><ViewTransaction size={20} fontSize={12} txId={pr.publish_digest!}></ViewTransaction></div>
        </div>)
        }
        <div className="grid grid-cols-2 gap-4">
        <p>Coin Type</p><p>{pr.coin_type}</p>
        <p>Coin Details:</p><p>{pr.vault_id}</p>
        </div>

        <Link href={`/coins_by/${account?.address}`}>My Coins</Link>
        </div>
      }
      { pr && !pr.isSucc && <p>{pr.errMsg}</p>}
      </center>
      
    </div>
  );
};
