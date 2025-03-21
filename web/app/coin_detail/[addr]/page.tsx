'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SuiClient } from '@mysten/sui/client';
import { CurveVault ,CoinTransferEvent} from '@/lib/types';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { get_buy_amount,get_sell_amount } from '@/lib/coin_curve';
import { getBuyTx ,getSellTx} from '@/lib/coin_operate';
import { getTypeByMeta } from '@/lib/utils';
import {getTransferEvent} from '@/lib/coin_info'
import { getNormalizeSupply } from '@/lib/coin_info';
async function getVault(suiClient : SuiClient,addr : string){
  let object =  await suiClient.getObject({id : addr,  options:{ showContent : true}});
  if(object.data?.content?.dataType == 'moveObject'){
      const vault = object.data.content.fields as unknown as CurveVault
      console.log("vault:",vault)
      return vault;
  } else{
    console.log("fail to getVault ",object);
    return null;
  }
}


type UserInfo ={
  token_balance : number;
  sui_balance : number;
} 

async function getUserInfo(suiClient : SuiClient, account:string ,vault : CurveVault|null )
{
   let ret : UserInfo = { token_balance : 0, sui_balance:0};
   
   if(vault == null){ 
      console.log("getUserInfo vault==null")  
      return ret;
   }

   let sui_balance = await suiClient.getBalance({owner:account});
   console.log("sui balance", sui_balance, account)

   const coinType = getTypeByMeta(vault.meta.type);
   
   let token_balance = await suiClient.getBalance({owner:account , coinType})
   console.log("token balance", token_balance, coinType)
   ret.sui_balance = sui_balance ? Number(sui_balance.totalBalance)/1e9 : 0;
   ret.token_balance = token_balance? Number(token_balance.totalBalance)/Number(vault.token_decimals_value) : 0;
   return ret;
}


export default function CoinDetail(): React.ReactNode  {
  const params = useParams();
  const vault_addr  = params.addr;
  const suiClient = useSuiClient();
  const [timeFrame, setTimeFrame] = useState('1h');
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellToken, setSellToken] = useState(0);
  const [buyToken, setBuyToken] = useState(0);
  const [gain, setGain] = useState(0);
  const [activeTab, setActiveTab] = useState('buy');
  const [ vault,setVault] = useState<CurveVault|null>(null);
  const account = useCurrentAccount()
  const [tokenSupply,setTokeSupply] = useState(0);
  const [transferEvent,setTransferEvent] = useState<CoinTransferEvent|null>(null);
  const [user_sui_balance, setUserSuiBalance] = useState(0)
  const [user_token_balance,setUserTokenBalance] = useState(0)

  async function init_call(suiClient : SuiClient,vault_addr : string, user_addr :string|null|undefined){
    const vault = await getVault(suiClient,vault_addr)
    setVault(vault);
    if(vault == null){
      setTokeSupply(0);
    }
    else{
      const s0 = getNormalizeSupply(vault);
      setTokeSupply(s0);
      console.log("init_call supply:", s0);
    }
    if(user_addr){
      const info = await getUserInfo(suiClient,user_addr,vault);
      if(info){
        setUserSuiBalance(info.sui_balance)
        setUserTokenBalance(info.token_balance)
      }
    } 
  }
  const { mutate : signAndExecuteTransaction} = useSignAndExecuteTransaction();
  async function Buy()
  {
    if(vault == null) return;
    const tx = getBuyTx(vault,Math.floor(buyAmount * Number(vault.sui_decimals_value)))
    signAndExecuteTransaction({transaction:tx},{
      onSuccess(data,variables){
        console.log("on success effects",data.effects);
        suiClient.waitForTransaction({digest:data.digest,options:{showEffects:true,showEvents:true}}).then(
          (result)=>{
              console.log("buy tx:wait effects" ,result.effects?.status)
              console.log("buy tx:wait events:",result.events)
              
              const te = getTransferEvent(result.events);
              console.log("buy tx:transferevnet:",te);
              setTransferEvent(te);

              init_call(suiClient,vault.id.id, account?.address);
          }
        );
      }
    })
  }

  async function Sell(){
    if(!vault || !account ){
      console.log("vault account invalid");
      return;
    }
    const owner = account!.address;
    const token_amount = sellToken;
    const result = await getSellTx(
      suiClient,
      vault,
      token_amount , 
      owner);
    
    if(!result.isSucc){
      console.log("Sell fail:",result.errMsg);
    }
     await  signAndExecuteTransaction({transaction:result.data},{
        onSuccess(data,variables){
          //console.log("on success effects",data.effects);
          suiClient.waitForTransaction({digest:data.digest,options:{showEffects:true,showEvents:true}}).then(
            (result)=>{
                console.log("sell tx:wait digest=" ,result.digest," effects=",result.effects?.status)
                console.log("sell tx:wait events:",result.events)
                if(result.effects?.status.status == 'success'){
                  const te = getTransferEvent(result.events);
                  console.log("sell tx:transferevnet:",te);
                  setTransferEvent(te);
                } else{
                  setTransferEvent(null);
                }
                init_call(suiClient,vault.id.id, account?.address);
            }
          );
        }
      })
  }

  function changeBuyPercent(percent :number){
    const amount = percent *  user_sui_balance / 100;
    changeBuyAmount(amount)
  }

  function changeBuyAmount(amount : number){
   
    setBuyAmount(amount);
    let [token_amount , _ ] = get_buy_amount(tokenSupply,amount,Number(vault?.meta.fields.decimals))
    setBuyToken(token_amount);
    console.log("changeBuyAmount",amount,token_amount);
  }

  function changeSellPercent(percent: number){
    const token_delata = percent *  user_token_balance / 100;
    changeSellToken(token_delata);
  }

  function changeSellToken(token_delta: number){
    
    let [sui_amount , _ ] = get_sell_amount(tokenSupply,token_delta)
    setSellToken(token_delta);
    setGain(sui_amount)
    console.log("changeBuyAmount",sui_amount,token_delta);
  }

  useEffect(()=>{
   
    if(vault_addr && typeof(vault_addr) == 'string')
    {
      init_call(suiClient,vault_addr, account? account.address : '');
    }
  },[account])

  if(vault == null){
    return <p>can not find vault for {vault_addr}</p>
  }
  return (
    <div className="coin-detail">
      
      <h1>Coin Details</h1>
      <div className="content">
      {/* 
        <div className="kline-section">
          <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
            <option value="5d">5 Days</option>
          </select>

          <div className="kline-chart">K-Line Chart Placeholder</div>
        </div> */}

        <div className="trade-section">
          <div className="tabs">
 
            <button 
              className={activeTab === 'buy' ? 'active' : ''} 
              onClick={() => setActiveTab('buy')}
            >
              Buy
            </button>
            <button 
              className={activeTab === 'sell' ? 'active' : ''} 
              onClick={() => setActiveTab('sell')}
            >
              Sell
            </button>
          </div>

          {activeTab === 'buy' ? (
            <div className="trade-panel">
              <p>Max: {user_sui_balance} SUI</p>
              <input 
                type="number" 
                value={buyAmount} 
                onChange={(e) => changeBuyAmount(Number(e.target.value))} 
              />
              <p>Token : {buyToken} </p>
              <div className="quick-buttons mx-4">
                <button className='mx-2' onClick={() => changeBuyPercent(0 )}>Reset</button>
                <button className='mx-2' onClick={() => changeBuyPercent(25)}>25%</button>
                <button className='mx-2' onClick={() => changeBuyPercent(50 )}>50%</button>
                <button className='mx-2' onClick={() => changeBuyPercent(75 )}>75%</button>
                <button className='mx-2'onClick={() => changeBuyPercent(  100)}>100%</button>
              </div>
              <button onClick={ (e)=>{Buy()} }> place trade </button>
            </div>
          ) : (
            <div className="trade-panel">
              <p>Max: {user_token_balance} {vault.meta.fields.symbol}</p>
       
              <input 
                type="number" 
                value={sellToken} 
                onChange={(e) => changeSellToken(Number(e.target.value))} 
              />
              <p>estimate gain : {gain} SUI</p>
              <div className="quick-buttons max-4">
                <button className='mx-2' onClick={() => changeSellPercent(0 )}>Reset</button>
                <button className='mx-2' onClick={() => changeSellPercent(25)}>25%</button>
                <button className='mx-2' onClick={() => changeSellPercent(50)}>50% </button>
                <button className='mx-2' onClick={() => changeSellPercent(75 )}>75%</button>
                <button className='mx-2' onClick={() => changeSellPercent(100 )}>100%</button>
              </div>
              <button onClick={ (e)=>{Sell()} }> place trade </button>
              <hr/>
              {transferEvent && 
              <div>
                <p>{vault.meta.fields.symbol} :{transferEvent.token_from } ===&gt; {transferEvent.token_to}: {transferEvent.token_amount} </p>
                <p>SUI: {Number(transferEvent.sui_amount)/Number(vault.sui_decimals_value)} </p>
              </div>
              }
              
          </div>

            
          )}

         
        </div>
      </div>
    </div>
  );
};