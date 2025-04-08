'use client'
import { Copy } from "lucide-react"
import { Tooltip } from 'react-tooltip';
import { useState,useRef ,useEffect} from "react";
import { isNull } from "node:util";

export default function TitleDisplay(props :{name:string,value :string | number, width : number}) {


    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }


    const ref = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (ref.current) {
          setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
        }
      }, [props.value]);

    return <div className="flex items-centener justify-start ">
        <div className="text-sm">{props.name} : </div>
        <div className="group relative inline-block">
        
            <div   style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '120px' // 必须设置固定宽度
                }} 
            
            ref={ref}>
            {props.value}
            </div>
            { isOverflowing &&<div className="absolute hidden group-hover:block bg-gray-800 text-white p-2 rounded text-sm z-50 w-64 break-words">
            {props.value} <button className="text-sm" onClick={(e)=>copyContent(`${props.value}`)}><Copy size='12'></Copy></button>
            </div>}
        </div> 
        </div>
}





