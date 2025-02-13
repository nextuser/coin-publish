module coin_manager::lock;
use sui::balance::{Self, Balance};
use sui::coin::{Self};
use sui::clock::Clock;
public struct LockedBalance<phantom T> has store{
    
    balance :Balance<T>,
    unlock_time_ms : u64,
}

public struct LockedBank<phantom T> has key,store{
    id: UID,
    locked_balances : vector<LockedBalance<T>>,
}

entry public fun createLockedBank<T>(ctx : &mut TxContext){
    let bank = LockedBank<T>{
        id : object::new(ctx),
        locked_balances : vector::empty()
    };
    transfer::transfer(bank, tx_context::sender(ctx));

}

fun unlock<T>(clock :&Clock,bank : &mut LockedBank<T>) : Balance<T>{
    let  mut ret_balance = balance::zero<T>();
    let mut i = bank.locked_balances.length() - 1; 
    let curr_time_ms = clock.timestamp_ms();
    while( i >=  0){
        
        if(curr_time_ms >= bank.locked_balances[i].unlock_time_ms){
            let e = bank.locked_balances.remove(i);
            let LockedBalance{ balance: b, unlock_time_ms: _ } = e;
            ret_balance.join(b);
        };
        
        i = i - 1;
    };

    ret_balance
}

entry fun entry_unlock_to<T>(clock :&Clock,bank : &mut LockedBank<T>,recipient : address,ctx:&mut TxContext){
    let balance = unlock(clock,bank);
    let coin = coin::from_balance(balance, ctx);
    transfer::public_transfer(coin, recipient)
}


entry fun entry_unlock<T>(clock :&Clock,bank : &mut LockedBank<T>,ctx:&mut TxContext){
    entry_unlock_to(clock,bank,ctx.sender(),ctx);
}

public(package) fun lock_balance<T>(bank : &mut LockedBank<T>,b : Balance<T> ,unlocked_time_ms : u64 ){
    let lb = LockedBalance<T>{
        balance : b,
        unlock_time_ms : unlocked_time_ms
    };
    bank.locked_balances.push_back(lb);
}