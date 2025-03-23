// lib/utils.ts
import { faAddressBook } from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs : any[]) {
  return twMerge(clsx(inputs))
}


export function short_addr(addr:string |undefined ) : string{
  if(!addr || addr.length < 16){
    return 'invalid addr';
  }
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// 0x00....  66bytes
const ADDR_LENGHT=66;
export function normaize_address(addr_arg : string){
    let addr = addr_arg;
    if(!addr.startsWith('0x')){
      addr = '0x' +  addr;
    }
    if(addr.length < ADDR_LENGHT){
      return '0x' + '0'.repeat(ADDR_LENGHT - addr.length ) + addr.slice(2);
    }

    if(addr.length != ADDR_LENGHT){
      console.error('invalid arg of normaize_address :',addr_arg)
      process.exit(-1);
    }
    return addr;

}

//type ArgType = keyof MintForm;
function get_string_value<ArgType extends string>(formData:FormData , name :ArgType){
    let value = formData.get(name);
    if(value != null && typeof(value) == 'string'){
        return value;
    } else{
        throw new Error(`invalid paramter value ,paramter name ${name}, value=${value}`)
    }
}


export function getTypeByMeta(meta_name : string){
    //console.log('meta_name',meta_name);
    let start = meta_name.indexOf("<");
    let end = meta_name.indexOf(">")
    let type = meta_name.substring(start + 1 ,end);
    //console.log("meta=>type",meta_name, type);
    return type
}

// console.log(normaize_address('0x37478d1d2daa86df006fec55047ab97f1c4bbffa7c78bac446d67c9e01b1daa'));
// console.log(normaize_address('37478d1d2daa86df006fec55047ab97f1c4bbffa7c78bac446d67c9e01b1daa'));