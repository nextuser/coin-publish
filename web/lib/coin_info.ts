import { fromBase64,fromHex,toHex } from '@mysten/bcs';
import { SuiClient,getFullnodeUrl,GasCostSummary,SuiEvent,CoinStruct, MoveStruct ,SuiEventFilter } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { CoinCreatedEvent , CoinTransferEvent, CurveVault ,MStruct} from './types';
import dotenv from 'dotenv';
import { getCost } from './sui/sui_client';
import { Keypair } from "@mysten/sui/cryptography";
import { get_buy_amount,get_sell_amount } from './coin_curve';
import { Sevillana } from 'next/font/google';
import { getSuiConfig } from './sui/sui_config';
async function getPkgManger()  {
    return (await getSuiConfig()).coin_manager_pkg
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

export function getTypeByMeta(meta_name : string){
    //console.log('meta_name',meta_name);
    let start = meta_name.indexOf("<");
    let end = meta_name.indexOf(">")
    let type = meta_name.substring(start + 1 ,end);
    //console.log("meta=>type",meta_name, type);
    return type
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

function filter_events(events : SuiEvent[] , tname: string) : unknown | null{
    for( let e of events ){
        if(e.type.indexOf(tname) >= 0){

            return e.parsedJson ;
        }
    }
    return null;
}

function getTransferEvent(events : SuiEvent[]|null) : CoinTransferEvent|null{
    if(events == null) return null;

    let event = filter_events(events,'CoinTransferEvent');
    if(event != null){
        return event as CoinTransferEvent;
    }
    console.log("null for event :",event,'CoinTransferEvent');
    return null;
}


export async function buy(suiClient : SuiClient , 
                            keypair : Keypair, 
                            vault_addr : string,
                            sui_amount : number) : Promise<[CoinTransferEvent |null,bigint,CurveVault|null]>{

        let vault = await getVault(suiClient,vault_addr);
        if(vault == null){
            console.log("find vault fain for :",vault_addr);
            return [null ,0n,vault];
        }
        let owner = keypair.getPublicKey().toSuiAddress();
        let events = await queryCreatedEvents(suiClient,owner);
        if(events.length == 0){
            console.log("not find when call queryCreatedEvents ");
            return [null,0n,vault];
        }

        let supplied_token = getSupply(vault) ;
        //console.log("vault supplied_token=",supplied_token);
        let tdv = 10 ** Number(vault.meta.fields.decimals);
        let normalized_s0 = Number(supplied_token)/tdv;
        let [token_amount,_] = get_buy_amount(normalized_s0,sui_amount/1e9);
        token_amount = token_amount * tdv;
       // console.log("token amount:",token_amount);
        let tx = new Transaction();
        let [new_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_amount)]);
        tx.setGasBudget(1e8);
        let type_name = getTypeByMeta(vault.meta.type);
        //console.log("coin_manager::entry_buy:",sui_amount,token_amount );
        //console.log('coin type name from meta:',type_name);
        //entry fun Buy<T>(mut pay : Coin<SUI>, target_amount :u64,vault : &mut CurveVault<T>,ctx : &mut TxContext )
        tx.moveCall({
            target : `${process.env.COIN_MANAGER_PACKAGE}::coin_manager::entry_buy`,
            arguments : [
                new_coin,
                tx.pure.u64(Math.floor(token_amount)),
                tx.object(vault.id.id)
            ],
            typeArguments:[type_name]
        });
    
        const result = await suiClient.signAndExecuteTransaction({
            signer: keypair,
            transaction: tx,
            options: {
                showEffects: true,
                ///showObjectChanges:true,
                showEvents:true
            },
            requestType: 'WaitForLocalExecution',
        });
        let event = getTransferEvent(result.events!);
        return [event ,getCost(result.effects?.gasUsed),vault]
}

async function getTokenByAmount(suiClient : SuiClient,
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


export async function sell_by_amount(suiClient : SuiClient, 
    keypair : Keypair,
    owner : string,
    vault_addr : string,
    token_num :bigint)
    : Promise<[CoinTransferEvent|null,bigint,CurveVault|null]>{
 
    let vault = await getVault(suiClient,vault_addr);
    const emp_result : [CoinTransferEvent|null,bigint,CurveVault|null] = [null,0n,vault]

 

    if(vault == null ){
        console.log("invalid args ,vault_addr:",vault_addr);
        return emp_result;
    }
        
    let type_name = getTypeByMeta(vault.meta.type);
    let token = await getTokenByAmount(suiClient,owner,type_name, token_num);
    return await sell(suiClient,keypair,owner,vault,token);
}


export async function sell(suiClient : SuiClient, 
                            keypair : Keypair,
                            owner : string,
                            vault : CurveVault,
                            token :CoinStruct|null)
                            : Promise<[CoinTransferEvent|null,bigint,CurveVault|null]>{

    const emp_result : [CoinTransferEvent|null,bigint,CurveVault|null] = [null,0n,vault]

    
    if(vault == null || token == null){
        console.log("invalid args ,(vault,token):",vault,token);
        return emp_result;
    }
    
    let tdv = Number(vault.token_decimals_value);
    let token_amount = Number(token.balance) / tdv;
    let tds = Number(vault.token_decimals_value);
    let supplied_token = getSupply(vault);
    let s0  = Number(supplied_token)/ tdv;
    //console.log('get_sell_amount(s0, token_amount)', s0,token_amount);
    let [sui_amount ,_] = get_sell_amount(s0,token_amount)

    //console.log("--sell  :token amount,sui_amount:",token_amount,sui_amount);
    let tx = new Transaction();
    tx.setGasBudget(1000000000);
    ///console.log("token",token);

    //entry public fun --sell <T>(token : Coin<T>,vault : &mut CurveVault<T>,ctx : &mut TxContext )
    tx.moveCall({
        target : `${process.env.COIN_MANAGER_PACKAGE}::coin_manager::entry_sell`,
        arguments : [
            tx.object(token.coinObjectId),
            tx.object(vault.id.id)
        ],
        typeArguments:[token.coinType]
    });
    //console.log("--sell  :expect sui",sui_amount * Number(vault.sui_decimals_value));

    const result = await suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
            showEffects: true,
            ///showObjectChanges:true,
            showEvents:true
        },
        requestType: 'WaitForLocalExecution',
    });

    let event = getTransferEvent(result.events!);
    return[event ,getCost(result.effects?.gasUsed),vault];
}



export async function queryCoinVaults(suiClient :SuiClient, sender?:string): Promise < CurveVault[]>{
    let suiConfig = await getSuiConfig();
    const mananger_package = await getPkgManger();
    const eventType = `${mananger_package}::coin_manager::CoinCreatedEvent`;
    console.log("suiConfig:",suiConfig);

    const query : SuiEventFilter = sender? {Sender:sender} : {MoveEventType : eventType  }
    console.log("queryCoinVaults query=",query);
    let events_result = await suiClient.queryEvents({
        query
    })  
    let vault_ids = [];
    for(let e of events_result.data){
        const ce = e.parsedJson as CoinCreatedEvent;
        if(e.type == eventType){
            vault_ids.push(ce.vault_address);
        }
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
        //console.log("valut:", v.data?.content as unknown)
        ret.push(c.fields)
    }

    return ret;

}








