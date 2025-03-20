// lib/utils.ts
import { faAddressBook } from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs : any[]) {
  return twMerge(clsx(inputs))
}


export function short_addr(addr:string) : string{
  if(addr.length < 16){
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

// console.log(normaize_address('0x37478d1d2daa86df006fec55047ab97f1c4bbffa7c78bac446d67c9e01b1daa'));
// console.log(normaize_address('37478d1d2daa86df006fec55047ab97f1c4bbffa7c78bac446d67c9e01b1daa'));