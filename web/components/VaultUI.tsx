import {CurveVault} from 'lib/types'
import { short_addr } from '@/lib/utils';
import Link from 'next/link';
import { getSupply } from '@/lib/coin_info';
import TitleDisplay from '@/components/TitleDisplay'
import { metadata } from '@/app/layout';
import { useRef,useState,useEffect } from 'react';

export default function VaultUI(props :{key:string,vault :CurveVault}) {
    const vault = props.vault
    const meta = vault.meta.fields;
    const s0 =  Number(getSupply(vault))

    const ref = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
            if (ref.current) {
                setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
                console.log('scroll client',ref.current.scrollWidth, ref.current.clientWidth)
            }
    }, [props.vault]);

    return (
    <div style={{order: -s0, width:'400px',height:'400px'} }
    key = {vault.id.id}
    onClick={()=>{} }  className='grid grid-cols-2'
    >
    <div>
    <Link href={`/coin_detail/${vault.id.id}`}>
    <img src={meta.icon_url} alt={meta.name} width={240} height={180} />
    </Link>
    </div>
    <div>
    <TitleDisplay name="Name" value={meta.name} width={100}></TitleDisplay>
    <TitleDisplay name="Symbol" value={meta.symbol} width={100}></TitleDisplay>

    <TitleDisplay name="Decimals" value={meta.decimals} width={100}></TitleDisplay>
    <TitleDisplay name="Creator" value={vault.coin_creator} width={100} ></TitleDisplay>

    <TitleDisplay name="Supply" value={s0} width={100} ></TitleDisplay>
    
    <p>Description:</p>

        <div className="group relative inline-block">
            <div className="line-clamp-3 w-[160px]" ref={ref}>
             {meta.description}
            </div>
            { isOverflowing &&<div className="absolute hidden group-hover:block bg-gray-800 text-white p-2 rounded text-sm z-50 w-64 break-words">
            {meta.description}
            </div>}
        </div> 
    </div>
    </div>)
}