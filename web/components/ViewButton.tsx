import { Link } from "lucide-react";
let ViewButton =( props:{ display:string, size?:number , onClick: (e:any)=>void ,fontSize:number})=>{
    return (
        <button onClick={props.onClick} className="text-gray-500 hover:text-gray-700 cursor-pointer">
        <Link size={props.size} className="hover:cursor-pointer"/>
        <p style={{fontSize:props.fontSize}}>{props.display}</p>
        </button>
        )
}


export default ViewButton;