import { fromBase64,fromHex,toHex } from '@mysten/bcs';
import { SuiClient,getFullnodeUrl,GasCostSummary } from '@mysten/sui/client';
import { CoinCreatedEvent , CurveVault } from './types';

import dotenv from 'dotenv';
dotenv.config();

const mananger_package = process.env.COIN_MANAGER_PACKAGE || '';
if(!mananger_package || mananger_package.length == 0){
    console.log('COIN_MANAGER_PACKAGE is not set');
    process.exit(1);
}
export async function queryCreatedEvents(suiClient:SuiClient,owner:string) : Promise<Array<CoinCreatedEvent>>{
    const eventType = `${mananger_package}::coin_manager::CoinCreatedEvent`;
    let events = await suiClient.queryEvents({
        query:{
            //Sender:owner,
            MoveEventType: eventType,
        }
    })
    const created_events = new Array<CoinCreatedEvent>;
    events.data.forEach(event => {
        let e = event.parsedJson as CoinCreatedEvent
        created_events.push(e);
        //console.log(event);
    });

    return created_events;

}

export async function getSupply(suiClient:SuiClient,vault : string) : Promise<bigint>{
    let result = await suiClient.getObject({
        id : vault,
        options : {
            showContent : true,
        }
    });
    console.log("vault :",vault);
    let content = result.data!.content!;
    if(content.dataType == 'moveObject'){
        console.log("fields",content.fields as unknown);
        let vault = content.fields as unknown as CurveVault ;
        console.log("vault :" ,vault);
        return BigInt(vault.total_supply.fields.value) - BigInt(vault.curve_balance);
    }

    return 0n;
    
} 




