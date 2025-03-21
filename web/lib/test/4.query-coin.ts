import { SuiEventFilter,SuiEvent } from '@mysten/sui/client';
import { suiClient } from '@/contracts';
import dotenv from 'dotenv';
import { CoinTransferEvent } from '../types';
import { get_token_value } from '../coin_curve';
import suiConfig from '@/lib/suiConfig.json'
dotenv.config();
const VAULT  = process.env.VAULT;
const manager_pkg = suiConfig.coin_manager_pkg;

const ownerMap:Map<string,bigint> = new Map<string,bigint>

function get_or_zero(map:Map<string,bigint> , key : string){
    let old = map.get(key);
    return old ?  old  : 0n;
}
async function query(coin_type:string)
{
    // 配置Sui主网或测试网的WebSocket连接

    // 假设我们要监听的CoinType是 "0x...::c1::C1"，需要替换为实际的类型
    const TARGET_COIN_TYPE = coin_type; // 请替换为真实的CoinType

    // 定义事件过滤器，监听CoinBalanceChange事件
    const eventFilter: SuiEventFilter = {
        MoveEventType: `${manager_pkg}::coin_manager::CoinTransferEvent`, // Sui标准代币余额变化事件
    };

    let cursor = null;
    let events ;
    let i = 0;
    do{
        events = await suiClient.queryEvents({ query:eventFilter , cursor: cursor,limit : 50, order: 'ascending'});
        console.log("events length:",events.data.length);
        events.data.forEach((event:SuiEvent)=> {
            let te = event.parsedJson! as CoinTransferEvent;
            if(te.coin_type_name != coin_type) 
            {
                return ;
            }
            console.log(te.coin_type_name);
            console.log(new Date(Number(event.timestampMs)))
            if(process.env.VAULT != te.token_from){
                let val = get_or_zero(ownerMap,te.token_from) - BigInt(te.token_amount)
                ownerMap.set(te.token_from,val)
                console.log(te.token_from,- Number(te.token_amount)/1e7,Number(val)/1e7)
            }

            if(process.env.VAULT != te.token_to){
                let val = get_or_zero(ownerMap,te.token_to) + BigInt(te.token_amount)
                ownerMap.set(te.token_to,val)

                console.log(te.token_to,+ Number(te.token_amount)/1e7,Number(val)/1e7)
            }
           // console.log('event:',te);
        });
        cursor = events.nextCursor
    }while(events.hasNextPage );
    console.log(ownerMap);
}
let  cointype = process.env.COIN_TYPE||'';
if(cointype.length > 0 ){
     query(cointype);
} else{
    console.error('export COIN_TYPE=... first ');
}



// async function subscribeToCoinTransfers(TARGET_COIN_TYPE :string) {
//     try {
//         console.log(`开始监听CoinType为 ${TARGET_COIN_TYPE} 的转账事件...`);
//         const eventFilter: SuiEventFilter = {
//             MoveEventType: '0x2::coin::CoinBalanceChange', // Sui标准代币余额变化事件
            
//         };
//         suiClient.getBalance
//         const unsubscribe = await provider.subscribeEvent({
//         filter: eventFilter,
//         onMessage(event:any) {
//             // 检查事件类型并提取数据
//             if (event.type === '0x2::coin::CoinBalanceChange') {
//             const coinType = event.parsedJson?.coin_type;
//             const amount = event.parsedJson?.amount;
//             const owner = event.parsedJson?.owner?.AddressOwner || event.parsedJson?.owner;
//             const txDigest = event.transactionDigest;

//             // 过滤出目标CoinType的事件
//             if (coinType === TARGET_COIN_TYPE) {
//                 console.log(`检测到 ${TARGET_COIN_TYPE} 转账事件:`);
//                 console.log(`- 交易Digest: ${txDigest}`);
//                 console.log(`- 金额: ${amount}`);
//                 console.log(`- 接收者: ${owner}`);
//                 console.log('-------------------');
//             }
//             }
//         },
//         });
//     }
//     catch(ex){
//         console.log(ex);
//     }
// }