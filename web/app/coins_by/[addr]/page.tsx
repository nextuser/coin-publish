// src/components/CoinList.tsx - 界面一
'use client'
import React, { useState, useEffect } from 'react';
import { useCurrentWallet ,useCurrentAccount} from '@mysten/dapp-kit';
import { SuiClient } from '@mysten/sui/client';
import { useSuiClient } from '@mysten/dapp-kit';
import {use} from 'react'
import config from '@/lib/sui/config'
import {queryCoinVaults} from '@/lib/coin_info'
import { CurveVault } from '@/lib/types';
import { short_addr } from '@/lib/utils';
import VaultUI from '@/components/VaultUI'
import { ConnectButton } from '@mysten/dapp-kit';
import { useParams } from 'next/navigation';



interface Coin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
}

  

export default function CoinsCreated(): React.ReactNode {
  const params = useParams();
  const [vaults, setVaults] = useState<CurveVault[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 12;
  const suiClient = useSuiClient();
  const account = params.addr ;
  if(typeof(account ) != 'string'){
    return "<p>coins_created/<addr> </p>"
  }
   

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const vaults = await queryCoinVaults(suiClient,account);
        setVaults(vaults);
        console.log("qeury vaults length",vaults.length);
      } catch (error) {
        console.error('Failed to fetch coins:', error);
      }
    };
    if(account ){
      fetchCoins();
    } else{
      setVaults([])
    }
  }, []);



  return (
    <div >
      <h1>SUI Coins</h1>
      <div className="grid grid-cols-3 grid-rows-4">
        {
            vaults.map(vault  => {
              return (<VaultUI key={vault.id.id} vault={vault}></VaultUI>)
            })
        }
      </div>

    </div>
  );
};