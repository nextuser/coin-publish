// src/components/CoinList.tsx - 界面一
'use client'
import React, { useState, useEffect } from 'react';
import { SuiClient } from '@mysten/sui/client';
import { useSuiClient } from '@mysten/dapp-kit';
import {use} from 'react'
import config from '@/lib/sui/config'
import {queryCoinVaults} from '@/lib/coin_info'
import { CurveVault } from '@/lib/types';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
}

function short_addr(addr:string){
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function CoinList(): React.ReactNode {
  const [vaults, setVaults] = useState<CurveVault[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 12;
  const suiClient = useSuiClient();
  

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const vaults = await queryCoinVaults(suiClient);
        setVaults(vaults);
      } catch (error) {
        console.error('Failed to fetch coins:', error);
      }
    };
    fetchCoins();
  }, []);



  return (
    <div className="coin-list">
      <h1>SUI Coins</h1>
      <div className="grid grid-cols-3 grid-rows-4">
        {
            vaults.map(vault => {
                const id = vault.id.id;
                const meta = vault.meta.fields
            
            return (
            <div 
                key={vault.id.id} 
                className="coin-card flex"
                onClick={()=>{}}
            >
                <img src={meta.icon_url} alt={meta.name} width={240} height={180} />
                <div>
                <h3>{meta.name}</h3>
                <p>Symbol: {meta.symbol}</p>
                <p>{meta.decimals}</p>
                <p>Creator: {`${short_addr(vault.coin_creator)}`}</p>
                <p>Description: {meta.description}</p>
                </div>
            </div>
            )})
        }
      </div>
      {/* 简单分页 */}
      <div className="pagination">
        {Array(Math.ceil(vaults.length / coinsPerPage)).fill(0).map((_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};