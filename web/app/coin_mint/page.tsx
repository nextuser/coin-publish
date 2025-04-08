// src/components/CreateCoin.tsx - 界面三
'use client'
import React, { useEffect, useState } from 'react';
import { useCurrentWallet,useCurrentAccount ,useSignAndExecuteTransaction, SuiClientContext} from '@mysten/dapp-kit';
import { CoinCreatedEvent,PublishCoinParams } from '@/lib/types';
import { ConnectButton } from '@mysten/dapp-kit';
import { SUI_DECIMALS } from '@mysten/sui/utils';
import { number } from 'echarts';
import CopyButton from '@/components/CopyButton';
import CopyViewTransaction from '@/components/ViewTransaction';
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
import { short_addr } from '@/lib/utils';
import ImageFileUpload from '@/components/ImageFileUpload';


const wasmUrl = '/move_bytecode_template_bg.wasm';
export default function CoinCreate(): React.ReactNode {

  const wallet = useCurrentWallet();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [inited,setInited] = useState(false);
  const empty_form = {
    name: '',
    symbol: '',
    decimals : '4',
    description: '',
    image: '',
    minter : account ? account.address : ''
  };
  const [form, setForm] = useState<MintForm>(empty_form);

  const [pr,setPr] = useState<PublishResult|null> (null)
  const pkg = suiConfig.coin_manager_pkg;
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction(); 

  function onChangeSymbol(value : string){
    // 将输入内容转换为大写
    value = value.toUpperCase();
    // 使用正则表达式替换所有非大写字母和下划线的字符
    value = value.replace(/[^A-Z_0-9\-]/g, '');
    setForm({...form, symbol: value});
  }

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
            console.log("txResult digest:",r.digest);
            suiClient.waitForTransaction({
                digest:r.digest ,
                options:{showEvents:true,showObjectChanges:true,showEffects:true}
              }).then(
              (result)=>{
                const pr = parsePublishResult(result);
                setPr(pr);
                if(pr.vault_id){
                  redirect(`coin_detail/${pr.vault_id}?digest=${r.digest}`)
                }

              }
            )
          },
          onError:(err)=>{
            setPr({isSucc:false, errMsg: `signAndExecuteTransaction fail ${err}`});
          }
        }
      )

  }  
  const [supportsGzip, setSupportsGzip] = useState(false);

  useEffect(()=>{
       if (typeof window !== 'undefined') {
            // 直接判断浏览器是否支持 Gzip
            const userAgent = navigator.userAgent;
            const isOldBrowser = /MSIE |Trident\/|Edge\//.test(userAgent);
            setSupportsGzip(!isOldBrowser);
        }
       init_template(wasmUrl,supportsGzip).then((result : Result) =>{
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
    <div className="create-coin  justify-center align-top w-600 pt-8">
      <center>
      <div className="grid grid-cols-2 gap-4 mx-5 w-600">
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
          <input type="text" id="Symbol"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={form.symbol}  
          onChange={(e) =>onChangeSymbol(e.target.value || '')} 
          placeholder="input uppercase letters, numbers, or hyphens." />


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
            <ImageFileUpload setFileUrl={(url:string) => setForm({...form, image: url})} fileUrl={form.image} />
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Description
            </label>
            <textarea 
            placeholder="Description" 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            />  
        <Button variant="action" className="max-w-250" onClick={(e)=>{ setForm(empty_form)}} >Reset</Button>
        <Button variant="action" className="max-w-250"  onClick={(e)=>{ handleCreate()}}  disabled={!wallet.isConnected && inited}>Create Coin</Button>
      </div>
      <hr/>
      { pr && pr.isSucc && <div className="">
        {pr.publish_digest && (
        <div className="grid grid-cols-2 gap-4  w-600">
          <div>Transaction:</div>
          <div><CopyViewTransaction size={20} fontSize={12} txId={pr.publish_digest!} /></div>
        </div>)
        }
        <div className="grid grid-cols-2 gap-4">
        <p className='text-base'>Coin Type :</p>
        <div className='text-sm text-blue-300 hover:text-blue-700 flex justify-start'>
        <Link href={`/coin_detail/${pr.vault_id}` } target='_blank'><p> {pr.coin_type}</p></Link></div>
        </div>
        </div>
      }
      { pr && !pr.isSucc && <p>{pr.errMsg}</p>}
      </center>
      
    </div>
  );
};
