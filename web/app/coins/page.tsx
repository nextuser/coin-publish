// src/components/CoinList.tsx - 界面一
'use client'
import React, { useState, useEffect } from 'react';
import { SuiClient } from '@mysten/sui/client';
import { useSuiClient } from '@mysten/dapp-kit';
import {use} from 'react'
import config from '@/lib/sui/config'
import {queryCoinVaults} from '@/lib/coin_info'
import { CurveVault } from '@/lib/types';
import { short_addr } from '@/lib/utils';
import VaultUI from '@/components/VaultUI'
import { ConnectButton } from '@mysten/dapp-kit';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
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
      <div style={{display:"flex",flexWrap:"wrap", alignItems:"flex-start", justifyContent:"flex-start"}}>
        {
            vaults.map(vault  => {
              return (<VaultUI key={vault.id.id} vault={vault}></VaultUI>)
            })
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