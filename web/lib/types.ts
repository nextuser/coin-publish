export type CoinCreatedEvent ={
    vault_address : string,
    type_name : string,
    meta_name : string,
    minter    : string,
    treasury_address : string,
}

export type CoinTransferEvent ={
    coin_type_name : string,
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

type MStruct<T> = {
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
}