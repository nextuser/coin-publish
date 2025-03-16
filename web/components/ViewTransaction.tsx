import { faTextWidth } from "@fortawesome/free-solid-svg-icons";
import { Link } from "lucide-react";
const  ViewTransaction =( props:{ txId:string, size?:number ,fontSize:number})=>{
    const viewTransaction = (id: string) => {
        window.open(`https://testnet.suivision.xyz/txblock/${id}`, '_blank');
    };
    const txId = props.txId;
    const display = txId.length > 16 ? `${txId.substring(0.4)}...${txId.substring(-3)}` : '**Invalid TxId'
    return (
        <button onClick={(e)=> viewTransaction(txId)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
        <Link size={props.size} className="hover:cursor-pointer"/>
        <p style={{fontSize:props.fontSize}}>{display}</p>
        </button>
        )
}


export default ViewTransaction;
