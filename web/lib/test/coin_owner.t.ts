import { fetch_coin_owners ,Response} from "../coin_owner";
async function test_get_owner(){
    let rsp =    await fetch_coin_owners('0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI');
    if(rsp == null){
        console.log('rsp is null');
        process.exit(-1);
    }
    for(let d of rsp.result.data){
        console.log(d.account, d.balance, Number(d.percentage) * 100);
    }
}

test_get_owner();
