import { Transaction } from "@mysten/sui/transactions";
import {  SuiClient, getFullnodeUrl,GasCostSummary} from '@mysten/sui/client'
import { test_env as env } from "./config";
import {getSigner} from './local_key'
let config = env.config();
const client = new SuiClient({ url: getFullnodeUrl(config.env) });


// client.getObject({ id :config.template_package, options : { showBcs:true, showType:true} }).then((rsp )=>{
//     if(rsp.error){
//         console.log('error:', rsp.error);
//     }
//     else{
//         console.log('rsp.data:',rsp.data);
//     }
// })


export function getCost(gasUsed?:GasCostSummary) : bigint{
	if(!gasUsed) return 0n;
    return BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost)    - BigInt(gasUsed.storageRebate);
}




