import { Transaction } from "@mysten/sui/transactions";
import {  SuiClient, getFullnodeUrl,GasCostSummary} from '@mysten/sui/client'
import { test_env as env } from "./config";
import {getSigner} from './local_key'
import module_bytes from '@/lib/coin_bytecode.json'
import { fromBase64 } from "@mysten/bcs";
import suiConfig from "@/lib/suiConfig.json"
import { normaize_address } from "@/lib/utils"

type CoinTemplate = {
  bytecode :Uint8Array,
   dependencies : string[];
}

export function readCoinTemplateBytes() : CoinTemplate{

    let bytecode : Uint8Array =  fromBase64(module_bytes.modules[0]);
    //校验 json中的coin_manager package应该和suiConfig里面的coin_manager_pkg 匹配
    const pkg = normaize_address(suiConfig.coin_manager_pkg);
    if(module_bytes.dependencies.indexOf(pkg) == -1){
        process.exit(-1)
    }
    return {bytecode,dependencies : module_bytes.dependencies};
}

// let config = env.config();
// const client = new SuiClient({ url: getFullnodeUrl(config.env) });

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




