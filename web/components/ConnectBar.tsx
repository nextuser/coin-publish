'use client'
import Link from 'next/link'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit';
export default function ConnectBar(){
    const acc = useCurrentAccount();  
    return (<header className="flex justify-between items-center p-4 bg-white shadow-md">
        <div className='flex justify-between px-4 m-5' >      
                <Link href="/coins">AllCoins</Link>
                <span className='mx-4'/>
                <Link href="/coin_mint">Create_Coin</Link>
                <span className='mx-4'/>
            {acc && 
                <Link href={`/coins_by/${acc.address}`}>My Coins</Link> 
            }
        </div>
    
        <ConnectButton />
    </header>)
}