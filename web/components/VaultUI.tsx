import {CurveVault} from 'lib/types'
import { short_addr } from '@/lib/utils';
import Link from 'next/link';
export default function VaultUI(props :{key:string,vault :CurveVault}) {
    const vault = props.vault
    const meta = vault.meta.fields

    return (
    <div 
    className="coin-card flex"
    onClick={()=>{}}
    >
    <Link href={`/coin_detail/${vault.id.id}`}>
    <img src={meta.icon_url} alt={meta.name} width={240} height={180} />
    </Link>
    <div>
    <h3>{meta.name}</h3>
    <p>Symbol: {meta.symbol}</p>
    <p>{meta.decimals}</p>
    <p>Creator: {`${short_addr(vault.coin_creator)}`}</p>
    <p>Description: {meta.description}</p>
    </div>
    </div>)
}