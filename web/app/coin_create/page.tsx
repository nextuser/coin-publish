// src/components/CreateCoin.tsx - 界面三
'use client'
import React, { useState } from 'react';
import { useCurrentWallet} from '@mysten/dapp-kit';
import { CoinCreatedEvent,PublishCoinParams } from '@/lib/types';
import { getSuiConfig } from '@/lib/sui/sui_config';
import { ConnectButton } from '@mysten/dapp-kit';
import { SUI_DECIMALS } from '@mysten/sui/utils';
import { number } from 'echarts';
import { publishCoin } from '@/lib/publishCoin';
import CopyButton from '@/components/CopyButton';
import ViewTransaction from '@/components/ViewTransaction';
import IntegerInput from '@/components/IntegerInput';
import ImageFileInput from '@/components/ImageFileInput'
import { MintForm } from '@/lib/types';
import { kMaxLength } from 'buffer';
import { PublishedBody,PublishResult} from '@/lib/types';

const CreateCoin: React.FC = () => {
  const wallet = useCurrentWallet();
  const [form, setForm] = useState<MintForm>({
    name: '',
    symbol: '',
    decimals : '4',
    description: '',
    image: ''
  });
  const [pr,setPr] = useState<PublishResult|null> (null)
  const handleCreate = async () => {
    if (!wallet.isConnected) {
      alert('Please connect wallet first');
      return;
    }

    try {
      // 这里实现合约调用创建coin
      console.log('Creating coin with:', form);
      const formData = new FormData();
      Object.entries(form).forEach(([k,v])=>{
        formData.append(k,v);
      })

      const uploadUrl = '/api/coincreate';
      console.log("uploadFile:",uploadUrl);
        
      const response = await fetch('/api/coincreate', {
          method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        console.log("response:",response);
        throw new Error('上传失败');
      }

      const rspBody = await response.json() as unknown as PublishedBody;
      if(rspBody.publish_info){
        setPr(rspBody.publish_info!);
      } else {
        setPr(null);
      }

      console.log("rspBody:",rspBody);
    } catch (error) {
      console.error('Failed to create coin:', error);
      setPr(null)
    }
  };

  if (!wallet.isConnected) {
    return <div>Please connect your SUI wallet to create a coin  <ConnectButton /></div>;
  }

  return (
    
    <div className="create-coin w-800 ">
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1>Create New Coin</h1>
        <ConnectButton />
      </header>
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

        <button onClick={handleCreate}>Create Coin</button>
      </div>
      { (pr && pr.isSucc) &&
      <div className="grid grid-cols-2 gap-4">
        <CopyButton display={pr.publish_digest!} copy_value={pr.publish_digest!} size={20} fontSize={12}></CopyButton>
        <ViewTransaction size={20} fontSize={12} txId={pr.publish_digest!}></ViewTransaction>
        <p>Coin Type</p><p>{pr.coin_type}</p>
        <p>Vault</p><p>{pr.vault_id}</p>

      </div>
      }


      { pr && !pr.isSucc && <p>{pr.errMsg}</p>

      }
      </center>
      
    </div>
  );
};

export default CreateCoin;