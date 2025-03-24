import { short_addr } from "@/lib/utils";
import { faTextWidth } from "@fortawesome/free-solid-svg-icons";
import { Link } from "lucide-react";
const  CopyViewTransaction =( props:{ txId:string, size?:number ,fontSize:number})=>{
    const viewTransaction = (id: string) => {
        window.open(`https://testnet.suivision.xyz/txblock/${id}`, '_blank');
    };

    
    const txId = props.txId;
    const display = short_addr(txId)
    return (
        <button onClick={(e)=> viewTransaction(txId)} className="text-gray-500 hover:text-gray-700 cursor-pointer flex">
        <Link size={props.size} className="hover:cursor-pointer mx-2"/>
        <p style={{fontSize:props.fontSize}}>{display}</p>
        </button>
        )
}


export default CopyViewTransaction;
