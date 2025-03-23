import { short_addr } from "@/lib/utils";
import { faTextWidth } from "@fortawesome/free-solid-svg-icons";
import { Link ,Copy, FileX} from "lucide-react";
const  ViewTransaction =( props:{ txId:string, size?:number ,fontSize:number})=>{
    const viewTransaction = (id: string) => {
        window.open(`https://testnet.suivision.xyz/txblock/${id}`, '_blank');
    };

    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }

    const txId = props.txId;
    const display = props.txId;
    return (
        <div style={ {display:"flex", }}>
        <button onClick={()=>copyContent(props.txId)} className="text-blue-200 hover:text-blue-500 ">
        <Copy size={props.size} className="hover:cursor-pointer" />
        </button>
        
        <button onClick={(e)=> viewTransaction(txId)} className="text-blue-200 hover:text-blue-500 cursor-pointer flex justify-start">
        <Link size={props.size} className="hover:cursor-pointer"/>
        
        <span style={{fontSize:props.fontSize}}>{display}</span>
        </button>
        
        
        </div>
        )
}


export default ViewTransaction;
