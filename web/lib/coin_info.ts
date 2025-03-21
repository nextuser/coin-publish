import { SuiClient,getFullnodeUrl,GasCostSummary,SuiEvent,CoinStruct} from '@mysten/sui/client';
import { CoinCreatedEvent , CoinTransferEvent, CurveVault ,MStruct} from './types';
import suiConfig from '@/lib/suiConfig.json';

async function getPkgManger()  {
    return suiConfig.coin_manager_pkg
}

export  async function queryTransferEvents(suiClient : SuiClient, coin_type : string) : Promise<CoinTransferEvent[]>
{   
    const eventType = `${getPkgManger()}::coin_manager::CoinTransferEvent`;
    let events = await suiClient.queryEvents({
        query:{
            MoveEventType: eventType,
        }
    })  
    let  transfer_events :CoinTransferEvent[] = [];
    console.log("query coin_type:",coin_type);
    events.data.forEach((item)=>{
        let e = item.parsedJson as CoinTransferEvent;
        if(coin_type.endsWith(e.coin_type_name )){
             transfer_events.push(e);
        }
    })
    return transfer_events;
}
export async function queryCreatedEvents(suiClient:SuiClient,owner:string) : Promise<Array<CoinCreatedEvent>>{
    const mananger_package = await getPkgManger();
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
        
    if(created_events.length == 0){
        console.log("fail to find event in package ",mananger_package );
    }
    return created_events;
}



export async function getVault(suiClient:SuiClient,vault : string) : Promise<CurveVault | null>{
    const mananger_package = await getPkgManger();
    let result = await suiClient.getObject({
        id : vault,
        options : {
            showContent : true,
        }
    });
    /////console.log("vault :",vault);
    let content = result.data!.content!;
    if(content.dataType == 'moveObject'){
        ////console.log("fields",content.fields as unknown);
        let vault = content.fields as unknown as CurveVault ;
        if(!content.type.startsWith(mananger_package)){
            console.log("VAULT name conflict with COIN_MANAGER_PACKAGE vault.type",content.type, " package",mananger_package  );
            process.exit(-1);
        }
        ///console.log("vault :" ,vault);
        return vault;
    }
    console.log("failed vault fail for address=", vault,',content:',content);
    return null;
} 

export  function getSupply(vault :CurveVault) : bigint{
    return BigInt(vault.total_supply.fields.value) - BigInt(vault.curve_balance);
}


export  function getNormalizeSupply(vault :CurveVault) : number{
    console.log("getNormalizeSupply vault",vault)
    return Number(BigInt(vault.total_supply.fields.value) - BigInt(vault.curve_balance))/ Number(vault.token_decimals_value);
}

function filter_events(events : SuiEvent[] , tname: string) : unknown | null{
    for( let e of events ){
        if(e.type.indexOf(tname) >= 0){
            return e.parsedJson ;
        }
    }
    return null;
}

export function getTransferEvent(events : SuiEvent[]|null | undefined ) : CoinTransferEvent|null{
    if(!events) return null;

    let event = filter_events(events,'CoinTransferEvent');
    if(event != null){
        return event as CoinTransferEvent;
    }
    console.log("null for event :",event,'CoinTransferEvent');
    return null;
}

export async function getTokenByAmount(suiClient : SuiClient,
    owner:string,
    coin_type :string, 
    token_amount : bigint) 
    :  Promise<CoinStruct|null>{

    let tokens = await  suiClient.getCoins({owner: owner,coinType : coin_type})
    if(tokens.data.length == 0 ){
        console.log('no tokens of type',coin_type);
        return  null;
    }

    let token: CoinStruct|null = null;
    for( let t of tokens.data){
        if(BigInt(t.balance) == token_amount){
            token = t;
            break;
        }
    }
    return token;
}


export async function queryCoinVaults(suiClient :SuiClient, minter?:string): Promise < CurveVault[]>{
    const mananger_package = await getPkgManger();
    const eventType = `${mananger_package}::coin_manager::CoinCreatedEvent`;
    console.log("suiConfig:",suiConfig);

    const query = {MoveEventType : eventType  }
    console.log("queryCoinVaults query=",query);
    let events_result = await suiClient.queryEvents({
        query
    })  
    let vault_ids = [];
    for(let e of events_result.data){
        const ce = e.parsedJson as CoinCreatedEvent;
        vault_ids.push(ce.vault_address);
        console.log('event sender,evnet_type',e.sender, e.type)
    }

    const  valut_results = await suiClient.multiGetObjects({
        ids: vault_ids,
        options: {
            showContent : true
        }
    })
    let ret =[];
    for(let v of valut_results){
        let c = v.data?.content as unknown as MStruct<CurveVault>;
        console.log("valut:", v.data?.content as unknown)
        if(!minter || c.fields.coin_creator == minter){
            ret.push(c.fields)
        }
    }

    return ret;

}








