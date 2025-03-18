module coin_manager::inflat_supply;
use sui::balance::{Supply,Balance};
use sui::coin::{Self,TreasuryCap};
use sui::clock::Clock;

//支持通胀模型，每个周期不超过特定的通胀率
// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions
///const ERR_LARGE_THAN_SUPPLY : u64 = 1;
const ERR_EXCEED_INFLATION : u64 = 2;
const ERR_INFLATION_TIME_LOCKED : u64 = 3;


public struct InflatSupply<phantom T> has key {
    id : UID,
    supply : Supply<T>,
    inflation_rate_limit : u64, // 0.01 percent , 0.0001
    last_inflation_time_ms : u64,
    inflation_interval_ms : u64,
}

entry fun inflatation_supply<T>( cap : TreasuryCap<T>,  inflationRate : u64,last_inflation_time_ms:u64, inflationInterval : u64, ctx: &mut TxContext){
        let supply = coin::treasury_into_supply(cap);
        let ifs = InflatSupply<T> {
            id : object::new(ctx),
            supply ,
            inflation_rate_limit : inflationRate, // 0.01 percent , 0.0001
            last_inflation_time_ms ,
            inflation_interval_ms : inflationInterval,
        };

        transfer::transfer(ifs, tx_context::sender(ctx));
}   



fun  inner_mint_inflat<T>(clock : &Clock,amount : u64,ifs : &mut InflatSupply<T>) : Balance<T>{
    let supply = &mut ifs.supply;
    let inflation_rate = ifs.inflation_rate_limit;
    let last_inflation_time_ms = ifs.last_inflation_time_ms;
    let inflation_interval_ms = ifs.inflation_interval_ms;
    let current_time_ms = clock.timestamp_ms();
    assert!(last_inflation_time_ms +  inflation_interval_ms <= current_time_ms, ERR_INFLATION_TIME_LOCKED) ;
    let old_supply = supply.supply_value();
    let inflation_amount = ( old_supply * inflation_rate) / 10000;
    assert!(amount <= inflation_amount ,ERR_EXCEED_INFLATION);
    ifs.last_inflation_time_ms = current_time_ms;
    supply.increase_supply(amount)
}


fun  inner_mint_inflat_max<T>(clock : &Clock,ifs : &mut InflatSupply<T>) : Balance<T>{
    let old_supply = ifs.supply.supply_value();
    let inflation_amount = ( old_supply * ifs.inflation_rate_limit) / 10000;  
    inner_mint_inflat(clock,inflation_amount, ifs)
}

entry fun mint_inflat<T>(clock : &Clock,amount : u64,ifs : &mut InflatSupply<T>,ctx : &mut TxContext) {
    let balance = inner_mint_inflat(clock,amount,ifs);
    let coin = coin::from_balance(balance, ctx);
    transfer::public_transfer(coin,tx_context::sender(ctx));
}


entry fun mint_inflat_max<T>(clock : &Clock,ifs : &mut InflatSupply<T>,ctx : &mut TxContext) {
    let balance = inner_mint_inflat_max(clock,ifs);
    let coin = coin::from_balance(balance, ctx);
    transfer::public_transfer(coin,tx_context::sender(ctx));
}
