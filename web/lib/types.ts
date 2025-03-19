import { stringify } from "querystring"

export type CoinCreatedEvent ={
    vault_address : string,
    type_name : string,
    meta_name : string,
    minter    : string,
    treasury_address : string,
}

export type CoinTransferEvent ={
    coin_type_name : string,
    token_before_transfer : string,
    token_from : string,
    token_to : string,
    token_amount : bigint,
    sui_amount: bigint,
}

export type CoinManagerCreated ={
    manager : string,
    publisher : string,
}

type UID ={
    id : string
}

type Supply = {
    value : string,
}

export type MStruct<T> = {
    type : string,
    fields : {
        [P in keyof T] : T[P]
    }
}

type Balance = {
    value : bigint,
}
type Url = {
    url:string,
}
export type CoinMetadata = {
    id: UID,
    /// Number of decimal places the coin uses.
    /// A coin with `value ` N and `decimals` D should be shown as N / 10^D
    /// E.g., a coin with `value` 7002 and decimals 3 should be displayed as 7.002
    /// This is metadata for display usage only.
    decimals: number,
    /// Name for the token
    name: string,
    /// Symbol for the token
    symbol: string,
    /// Description of the token
    description: string,
    /// URL for the token logo
    icon_url?: string,
}

export type CurveVault = {
    id : UID,
    coin_creator : string,
    total_supply : MStruct<Supply>,
    curve_balance : string,
    meta : MStruct<CoinMetadata>,
    curve_money :string,
    token_decimals_value : string,
    sui_decimals_value : string,
}


function getTypeName<T>(obj: T): string {
    if (typeof obj === 'object') {
        if (obj === null) {
            return 'null';
        }
        return obj.constructor.name;
    }
    return typeof obj;
}


export type CointCreatedEvent ={
    vault_address : string,
    type_name : string,
    meta_name : string,
    minter    : string,
    treasury_address : string,
}

export type PublishCoinParams =  {
    module_name:string,
    coin_name : string,
    symbol :string ,
    decimal:number,
    desc:string ,
    minter : string,
    imageUrl? : string
}


export type MintForm ={
    name: string,
    symbol: string,
    description: string,
    image: string,
    decimals:string,
    minter : string
}


export type  PublishResult = {
    coin_package_id? : string,
    coin_type? : string,
    vault_id? : string,
    publish_digest? : string,
    sui_cost ? :string,
    upgrade_cap? : string,
    created_event? : CoinCreatedEvent,
    event_type ? : string,
    errMsg ? : string,
    isSucc : boolean
}


export type  PublishedBody = {
    message : string,
    publish_info? : PublishResult

}

export type HttpPublishResponse = {
    body : PublishedBody
    options: {
        //headers?: Headers;
        status?: number;
        statusText?: string;
    }
}

class  T1 {
    name ? : string;
}
let cur :T1 ={

}

let val = 33n;