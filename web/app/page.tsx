'use client'
import  Link  from 'next/link';
import { useCurrentAccount,useCurrentWallet, useAccounts } from "@mysten/dapp-kit"
import { ConnectButton } from "@mysten/dapp-kit"

export default function Home(){

    const account = useCurrentAccount();
    const wallet = useCurrentWallet();
    return (
            <div></div>
        );
}