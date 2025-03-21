// src/components/CreateCoin.tsx - 界面三
'use client'
import React, { useEffect, useState } from 'react';
import { useCurrentWallet,useCurrentAccount ,useSignAndExecuteTransaction, SuiClientContext} from '@mysten/dapp-kit';
import { CoinCreatedEvent,PublishCoinParams } from '@/lib/types';
import { ConnectButton } from '@mysten/dapp-kit';
import { SUI_DECIMALS } from '@mysten/sui/utils';
import { number } from 'echarts';
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
import { Button } from '@/components/ui/button';
import { publishCoin } from '@/lib/publishCoin';
import { getPublishTx , parsePublishResult } from '@/lib/publish_client';
import { init_template} from  '@/lib/publish_client';
import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';


const wasmUrl = '/move_bytecode_template_bg.wasm';
export default function CoinCreate(): React.ReactNode {
  
  const wallet = useCurrentWallet();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [inited,setInited] = useState(false);
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
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction(); 




  function  getJsonParams(form:MintForm) {
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

   
  async function handleCreate( )  {
      form.minter = suiConfig.operator;
      const param = getJsonParams(form);
      const txResult = await getPublishTx(param,wasmUrl);     
      if(!txResult.isSucc) return txResult;

      await signAndExecuteTransaction({
        transaction: txResult.data,

      },{
          onSuccess: (r : SuiSignAndExecuteTransactionOutput) =>{


            // console.log(r);
            console.log("txResult digest:",r.digest);
            suiClient.waitForTransaction({
                digest:r.digest ,
                options:{showEvents:true,showObjectChanges:true,showEffects:true}
              }).then(
              (result)=>{
                const pr = parsePublishResult(result);
                setPr(pr);
              }
            )
          
          },
          onError:(err)=>{
            setPr({isSucc:false, errMsg: `signAndExecuteTransaction fail ${err}`});
          }
        }
      )

  }  

  useEffect(()=>{
       init_template(wasmUrl).then((result : Result) =>{
        if(result.isSucc){
          setInited(true);
        } else{
          console.log("init template fail:", result.errMsg);
        }
       });
    },[] );

    if (!wallet.isConnected || !account) {
      return <div>Please connect your SUI wallet to create a coin </div>;
    }
  return (
    <div className="create-coin w-600 ">
      <center>
      <div className="grid grid-cols-2 gap-4 mx-5 ">
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

        <Button variant="action" 
        className='col-span-2'
        onClick={(e)=>{ handleCreate()}}  
        disabled={!wallet.isConnected && inited}>Create Coin</Button>
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
      { pr && !pr.isSucc && <p>{pr.errMsg}</p>}
      </center>
      
    </div>
  );
};
