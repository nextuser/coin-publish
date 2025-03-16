import { Copy } from "lucide-react";
let CopyButton =( props:{ display:string, copy_value: string,size:number,fontSize:number})=>{
    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }
    return (
        <button onClick={()=>copyContent(props.copy_value)} className="text-gray-500 hover:text-gray-700 ">
        <Copy size={props.size} className="hover:cursor-pointer" />
        <p style={{fontSize:props.fontSize }}>{props.display}</p>
        </button>
        )
}


export default CopyButton;