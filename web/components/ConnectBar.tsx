'use client'
import Link from 'next/link'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit';
export default function ConnectBar(){
    const acc = useCurrentAccount();  
    return (<header className="flex justify-between items-center p-4 bg-white shadow-md">
        <div className='flex justify-between px-4 m-5' >      
                <Link href="/coins">AllCoins</Link>

                <Link href="/coin_create">Create_Coin</Link>
            {acc && 
                <Link href={`/coins_by/${acc.address}`}>My Coins</Link> 
            }
        </div>
    
        <ConnectButton />
    </header>)
}