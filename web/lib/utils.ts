// lib/utils.ts
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