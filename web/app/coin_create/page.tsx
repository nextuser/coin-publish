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
import ViewTransaction from '@/components/ViewTransaction';
import IntegerInput from '@/components/IntegerInput';
import ImageFileInput from '@/components/ImageFileInput'
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

export default function CoinCreate(): React.ReactNode {
  
  const wallet = useCurrentWallet();
  const account = useCurrentAccount();
  const [form, setForm] = useState<MintForm>({
    name: '',
    symbol: '',
    decimals : '4',
    description: '',
    image: '',
    minter : account ? account.address : ''
  });
  const [pr,setPr] = useState<PublishResult|null> (null)
  
  const pkg = suiConfig.coin_manager_pkg;
  console.log("coin_create: pkg=",pkg);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction(); 
  async function preCreate() : Promise<Result> {
    const tx = getPrecreateTx(suiConfig.operator);
    let ret : Result = {isSucc:true};
    await signAndExecuteTransaction({transaction:tx},{
      onSuccess:() =>{
          ret = {isSucc:true}
      },
      onError: (err)=>{ 
          ret = { isSucc : false,errMsg:`fail to call coin_manager::waitToCreate ${err.message}`};
      }
    });

    return ret;
    
  }
  
  const handleCreate = async () => {
    if (!wallet.isConnected) {
      alert('Please connect wallet first');
      return;
    }
    
    if(account == null){
    	return alert("connect first");
    }

    try {
      // 这里实现合约调用创建coin
      console.log('Creating coin with:', form);
      // const formData = new FormData();
      // Object.entries(form).forEach(([k,v])=>{
      //   formData.append(k,v);
      // })
      const result = await preCreate();
      console.log("precreate result:",result);

      if(!result.isSucc){
        return <p>{result.errMsg}</p>
      }


      const uploadUrl = '/api/coincreate';
      console.log("uploadFile:",uploadUrl);
      form.minter = account.address
        
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
  };

  if (!wallet.isConnected) {
    return <div>Please connect your SUI wallet to create a coin </div>;
  }

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
            <ImageFileInput setFileUrl={(url:string) => setForm({...form, image: url})} fileUrl={form.image}></ImageFileInput>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Description
            </label>
            <textarea 
            placeholder="Description" 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            />

        <button onClick={(e)=>{ handleCreate()}}  disabled={!wallet.isConnected}>Create Coin</button>
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
        <p>Vault</p><p>{pr.vault_id}</p>
        </div>

        <Link href={`/coins_by/${account?.address}`}>My Coins</Link>
        </div>
      }

      { pr && !pr.isSucc && <p>{pr.errMsg}</p>    
      }
      </center>
      
    </div>
  );
};
