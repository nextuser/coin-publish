import {CurveVault} from 'lib/types'
import { short_addr } from '@/lib/utils';
import Link from 'next/link';
import { getSupply } from '@/lib/coin_info';
export default function VaultUI(props :{key:string,vault :CurveVault}) {
    const vault = props.vault
    const meta = vault.meta.fields;
    const s0 =  Number(getSupply(vault))

    return (
    <div style={{order: -s0, width:'400px',height:'400px'} }
    onClick={()=>{} }  className='grid grid-cols-2'
    >
    <div>
    <Link href={`/coin_detail/${vault.id.id}`}>
    <img src={meta.icon_url} alt={meta.name} width={240} height={180} />
    </Link>
    </div>
    <div>
    <h3>{meta.name}</h3>
    <p>Symbol: {meta.symbol}</p>
    <p>{meta.decimals}</p>
    <p>Creator: {`${short_addr(vault.coin_creator)}`}</p>
    <p>Description: {meta.description}</p>
    <p>Supply:{s0}</p>
    </div>
    </div>)
}