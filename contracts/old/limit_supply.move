/// 固定货币总供应量 
module coin_manager::limit_supply;
use sui::balance::{Self,Supply,Balance};
use sui::coin::{Self,TreasuryCap};
use coin_manager::lock::{LockedBank};

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions
const ERR_LARGE_THAN_SUPPLY : u64 = 1;

public struct LimitSupply<phantom T> has key{
    id : UID,
    supply:Supply<T>,
    locked : bool,
    max : u64
}

public fun lock_supply<T>(ls :&mut LimitSupply<T>,amount :u64){
    ls.locked = true;
    assert!(balance::supply_value(&ls.supply) <= amount ,ERR_LARGE_THAN_SUPPLY);
    ls.max = amount;
}



fun inner_mint<T>(ls : & mut LimitSupply<T> ,amount:u64):Balance<T>{
    if(ls.locked){
        assert!(balance::supply_value(&ls.supply) + amount <= ls.max );
        
    };
    ls.supply.increase_supply(amount)
}

entry fun mint_and_transfer<T> (ls : & mut LimitSupply<T> ,amount:u64, recipient  : address,ctx : &mut TxContext){
    let b =  inner_mint(ls,amount);   
    let coin = coin::from_balance(b,ctx);
    transfer::public_transfer(coin, recipient);
    ls.max = std::u64::max(balance::supply_value(&ls.supply),ls.max);
}


entry fun entry_mint<T> (ls : & mut LimitSupply<T> ,amount:u64, ctx : &mut TxContext){
    mint_and_transfer(ls, amount, ctx.sender(), ctx)
}


entry fun limit_supply<T>( cap : TreasuryCap<T>,  ctx: &mut TxContext){
        let supply = coin::treasury_into_supply(cap);
        let ls = LimitSupply<T> {
            id : object::new(ctx),
            supply: supply,
            max : 0,
            locked : false
        };

        transfer::transfer(ls, tx_context::sender(ctx));
}   



entry fun mint_and_lock<T>(bank : &mut LockedBank<T>,ls : &mut LimitSupply<T>, amount : u64,unlocked_time_ms : u64,_ctx : &mut TxContext){
    let b = inner_mint(ls, amount);

    coin_manager::lock::lock_balance(bank,b,unlocked_time_ms)
}
