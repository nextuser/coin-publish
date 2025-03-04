
/// Module: coin_manager
module coin_manager::coin_manager;
use sui::coin::{Coin,CoinMetadata,TreasuryCap};
use sui::balance::{Self,Balance,Supply};
use sui::sui::SUI;
use std::string;
use std::ascii;
use sui::event::emit;

const INIT_SUPPLY: u64 = 1000_000_000;
public struct CoinCreatedEvent has copy,drop{
    vault_address : address,
    type_name : ascii::String,
    meta_name : string::String,
    minter    : address,
    treasury_address : ascii::String,
}

public struct CoinTransferEvent has copy,drop{
    coin_type_name : ascii::String,
    token_from : address,
    token_to : address,
    token_amount : u64,
    sui_amount: u64,
}

public struct CoinManagerCreated has copy,drop{
    manager : address,
    publisher : address,
}

public struct Manager has key{
    id : UID,
    owner : address,
}

public fun manager_owner(m : &Manager) : address{
    m.owner
}

public struct CurveVault<phantom T> has key,store{
    id : UID,
    coin_creator : address,
    total_supply : Supply<T>,
    curve_balance : Balance<T>,
    meta : CoinMetadata<T>,
    curve_money :Balance<sui::sui::SUI>,
}

public  fun vault_supply<T>(vault : &CurveVault<T>) : u64 {
    vault.total_supply.supply_value() - vault.curve_balance.value()
}

public fun vault_creator<T>(vault : &CurveVault<T>) : address{
    vault.coin_creator
}


fun init(ctx : &mut TxContext){
    let manager = Manager{
        id : object::new(ctx),
        owner : ctx.sender(),
    };
    let manager_addr = object::id(&manager).to_address();
    sui::event::emit(CoinManagerCreated{
        manager : manager_addr,
        publisher : ctx.sender(),
    });
    transfer::share_object(manager);
}

public fun register_coin<T >( treasury: TreasuryCap<T>, meta : CoinMetadata<T>, ctx : &mut TxContext  ){
    let treasury_addr = sui::object::id(&treasury).to_address().to_ascii_string();
    let type_name = std::type_name::get<T>();
    let name = type_name.borrow_string();
    let meta_name = meta.get_name();
    
    let mut supply = treasury.treasury_into_supply();
    let balance = supply.increase_supply(INIT_SUPPLY);
    let vault = CurveVault<T>{
        
        id : sui::object::new(ctx ),
        coin_creator : ctx.sender(),
        total_supply : supply,
        meta:meta,
        curve_balance : balance,
        curve_money : sui::balance::zero(),
    };

    sui::event::emit(CoinCreatedEvent{
        vault_address : object::id(&vault).to_address(),
        type_name : * name,
        meta_name : meta_name,
        minter : ctx.sender(),
        treasury_address: treasury_addr
    });

    transfer::public_share_object(vault);
}

/**
totoal value
    k = 1e-16  c = 2.8e-8 
    tv: total_value: 
    S: supply to other user, total_supply - curve_balance
    P:  Price, 
    
    P = 2 * k * S
   EQ0: tv = k *  S * S + c * S

  S =  total_supply - curve_balance
一直 s0, k,c, tv0
已知 新购买的钱 (tv1 - tv0), 求新增可以购买的代币两 s1-s0
   EQ1:tv1 = k *  S1 * S1 + c * S1
   A = sui_amount = tv1 - tv0
   x = token_amount = s1 - s0

将 EQ1-EQ0 获得
   tv1 - tv0 = k *  (s1 + s0) ( s1 - s0) + c * (s1 - s0)
    x = s1 - s0
    A = k * (x + s0 + s0 ) * x  + c * x
    A = k * x^2 + 2*k*s0*x + c*x
    k * x*x + (2*k*s0 + c)*x - A = 0
*/
const K : u128 = 100; // 放大1e18 倍
const C : u128 = 28_000_000_000; // 放大1e18 倍
const AMPLIFY : u128 = 1_000_000_000_000_000_000; // 放大1e18 倍
const ERR_NO_NOUGH_BALANCE : u64 = 1;

#[allow(lint(self_transfer))]
entry public(package) fun buy<T>(mut pay : Coin<SUI>, target_amount :u128,vault : &mut CurveVault<T>,ctx : &mut TxContext )  {
    let s0 = (balance::supply_value<T>(&vault.total_supply) - balance::value<T>(&vault.curve_balance)) as u128;
    let s1 = (s0 + target_amount) as u128;
    let tv0 = K * s0 * s0 + C * s0;
    let tv1 = K * s1 * s1 + C * s1;
    let diff = ((tv1 - tv0) / AMPLIFY) as u64;
    let pay_value = pay.balance().value() ;
    assert!( pay_value >= diff,ERR_NO_NOUGH_BALANCE);
    
    if(pay_value == diff){
        // transfer::public_transfer(pay, vault.coin_creator);
        vault.curve_money.join(pay.into_balance());
    }
    else{
        let newCoin = pay.split(diff ,ctx);
        balance::join(&mut vault.curve_money,newCoin.into_balance());
        transfer::public_transfer(pay, ctx.sender())
    };

    let token = vault.curve_balance.split(target_amount as u64).into_coin(ctx);
    transfer::public_transfer(token, ctx.sender());

    let curve_address = object::id(vault).to_address();
    let coin_type_name = std::type_name::get<T>().into_string();
    emit(CoinTransferEvent{
        coin_type_name : coin_type_name ,
        token_amount : target_amount as u64,
        token_from: curve_address,
        token_to:ctx.sender(),
        sui_amount : diff,
    })
    
}


#[allow(lint(self_transfer))]
entry public(package) fun sell<T>(token_amount : u128,vault : &mut CurveVault<T>,ctx : &mut TxContext )  {
    let s0 = (balance::supply_value<T>(&vault.total_supply) - balance::value<T>(&vault.curve_balance)) as u128;
    let s1 = s0 - token_amount ;
    let tv0 = K * s0 * s0 + C * s0;
    let tv1 = K * s1 * s1 + C * s1;
    let diff = ((tv0 - tv1) / AMPLIFY) as u64;
    let coin = vault.curve_money.split(diff).into_coin(ctx);
    transfer::public_transfer(coin, ctx.sender());

    let curve_address = object::id(vault).to_address();
    let coin_type_name = std::type_name::get<T>().into_string();
    emit(CoinTransferEvent{
        coin_type_name : coin_type_name ,
        token_amount : token_amount as u64,
        token_from: ctx.sender(),
        token_to: curve_address,
        sui_amount : diff,
    })
}


public fun freeze_meta<T>(meta :CoinMetadata<T>){
    transfer::public_freeze_object(meta);
}

entry fun make_immutable(cap : sui::package::UpgradeCap){
    sui::package::make_immutable(cap);
}

#[test_only]
public fun init_for_test(ctx:&mut TxContext){
    init(ctx);
}


