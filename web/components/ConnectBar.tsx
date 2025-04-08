'use client'
import Link from 'next/link'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit';
import { usePathname } from 'next/navigation';
import { LampDesk } from 'lucide-react';

type LinkData = {
    href : string,
    title : string,
}

const showLink = (ld : LinkData,path : string )=> {
    let matched = ld.href.endsWith(path) ;
    return <span key={ld.title}  
         className= { matched ? "text-2xl": "text-xl"}>
    <Link href={ld.href}
         
    >{ld.title}
    </Link>
    <span className='mx-4' ></span>
    </span>
}



export default function ConnectBar(){
    const acc = useCurrentAccount()! ;  
    const path = usePathname();
    console.log("currPath:",path);

    const links :LinkData[] = [
        {
            href:'/coins',
            title:'All Coins',
        },
        {
            href:'/coin_mint',
            title:'Create Coin',
        }

    ]

    if(acc){
        links.push({
            href:`/coins_by/${acc.address}`,
            title:'My Works',
        })
    }

    return (<header className="flex justify-between items-center p-4 bg-white shadow-md">
        <div className='group flex justify-between px-4 m-5' >      
            {links.map((link)=>showLink(link,path))}
        </div>
    
        <ConnectButton />
    </header>)
}