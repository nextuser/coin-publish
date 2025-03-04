import { Transaction } from "@mysten/sui/transactions";
import {  SuiClient, getFullnodeUrl} from '@mysten/sui/client'
import { test_env as env } from "./config";
import {getSigner} from './local_key'
let config = env.config();
const client = new SuiClient({ url: getFullnodeUrl(config.env) });


client.getObject({ id :config.template_package, options : { showBcs:true, showType:true} }).then((rsp )=>{
    if(rsp.error){
        console.log('error:', rsp.error);
    }
    else{
        console.log('rsp.data:',rsp.data);
    }
})



