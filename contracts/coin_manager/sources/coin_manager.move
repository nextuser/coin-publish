
/// Module: coin_manager
module coin_manager::coin_manager;
use sui::coin::{Coin,CoinMetadata,TreasuryCap};
use sui::balance::{Self,Balance,Supply};
use sui::sui::SUI;
use std::string;
use std::ascii;
use sui::event::emit;
use coin_manager::logger::log;
use coin_manager::utils::pow;

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
    token_before_transfer : u64,
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
    //token_amplify : u128,
    token_decimals_value : u128,
    sui_decimals_value : u128,
}

public  fun vault_supply<T>(vault : &CurveVault<T>) : u64 {
    vault.total_supply.supply_value() - vault.curve_balance.value()
}

public fun vault_creator<T>(vault : &CurveVault<T>) : address{
    vault.coin_creator
}

public fun token_decimals_value<T>(vault : &CurveVault<T>) : u128{
     vault.token_decimals_value
}

public fun sui_decimals_value<T>(vault : &CurveVault<T>) : u128{
     vault.sui_decimals_value
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

const SUI_DECIMALS : u8 = 9;

public fun register_coin<T >( treasury: TreasuryCap<T>, meta : CoinMetadata<T>, ctx : &mut TxContext  ){
    let treasury_addr = sui::object::id(&treasury).to_address().to_ascii_string();
    let type_name = std::type_name::get<T>();
    let name = type_name.borrow_string();
    let meta_name = meta.get_name();
    
    let mut supply = treasury.treasury_into_supply();
    let token_decimals_value = pow(10,meta.get_decimals() ) ;
    let balance = supply.increase_supply(INIT_SUPPLY * token_decimals_value);
    let vault = CurveVault<T>{
        
        id : sui::object::new(ctx ),
        coin_creator : ctx.sender(),
        total_supply : supply,
        meta:meta,
        curve_balance : balance,
        curve_money : sui::balance::zero(),
        token_decimals_value : token_decimals_value as u128,
        sui_decimals_value : pow(10,SUI_DECIMALS) as u128
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
   
   sdv = pow(10,sui.decimals)
   换算成mist为单位 tm = tv * tdv = ( k *  S * S + c * S) * sdv

   

  S =  total_supply - curve_balance
一直 s0, k,c, tv0
已知 新购买的钱 (tv1 - tv0), 求新增可以购买的代币两 s1-s0
   EQ1:tv1 = k *  sp1 * sp1 + c * sp1
   tm1 = tv1 * sdv
   A = sui_amount = tv1 - tv0
   x = token_amount = s1 - s0

将 EQ1-EQ0 获得
   tv1 - tv0 = k *  (s1 + s0) ( s1 - s0) + c * (s1 - s0)
    x = s1 - s0
    A = k * (x + s0 + s0 ) * x  + c * x
    A = k * x^2 + 2*k*s0*x + c*x
    k * x*x + (2*k*s0 + c)*x - A = 0


    pow(10,n) = 10 ^ n     pow(10,6) => 1000_000

td: token.decimals
sd : sui.decimals
tdv : pow(10, td) 
sdv : pow(10,sd)

S = s * pow(10,token.decimals) =  s * tdv
sp0 = s0 * pow(10,token.decimals) = s0 * tdv
sp1 = s1 * pow(10,token.decimals) = s1 * tdv


 tv1 - tv0 = k *  (s1 + s0) ( s1 - s0) + c * (s1 - s0)
 增长的sui : A = tv1 - tv0
 增长的mist AM = A * sdv
 因为move输入参数,都是以 S *  tdv , sui 也是以mist为单位
  A = k * (sp1/tdv + sp0/tdv) (sp1/tdv - sp0/tdv)  + c * (sp1/tdv - sp0/tdv)
  A = k * (sp1 *sp1 - sp0 * sp0)/ (tdv * tdv)  +  c * (sp1 - sp0) / tdv
  A * tdv * tdv  = k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)
  A = [k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)] / (tdv * tdv)
  AM =  [k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)] * sdv / (tdv * tdv)
  
*/
const K : u128 = 100; // 放大1e18 倍
const C : u128 = 28_000_000_000; // 放大1e18 倍
const AMPLIFY : u128 = 1_000_000_000_000_000_000; // 放大1e18 倍
//const SUI_AMPLIFY : u64 = 1_000_000_000;
const ERR_NO_NOUGH_BALANCE : u64 = 1;


#[allow(lint(self_transfer))]
public fun buy<T>(mut pay : Coin<SUI>, target_amount :u64,vault : &mut CurveVault<T>,ctx : &mut TxContext ) : ( Coin<T>, u64,u64) {
    let sp =  (balance::supply_value<T>(&vault.total_supply) - balance::value<T>(&vault.curve_balance));
    let  sp0 = sp as u128 ;
    let  sp1 = (sp + target_amount) as u128;
    let tdv = vault.token_decimals_value;
    let sdv = vault.sui_decimals_value;
    log(b"sp0",&sp0);
    log(b"sp1",&sp1);
    let tm0 = (K * sp0 * sp0 + C * sp0 * tdv)  /tdv * sdv / tdv;
    let tm1 = (K * sp1 * sp1 + C * sp1 * tdv)  /tdv * sdv / tdv ;
    log(b"tm1",&tm1);
    let am  = ((tm1 - tm0) / AMPLIFY  ) as u64;
    log(b"am",&am);
    let pay_value = pay.balance().value() ;
    log(b"diff:",&am);
    log(b"pay_value",& pay_value);
    assert!( pay_value >= am,ERR_NO_NOUGH_BALANCE);

    log(b"diff",&am);
    if(pay_value == am){
        // transfer::public_transfer(pay, vault.coin_creator);
        vault.curve_money.join(pay.into_balance());
    }
    else{
        let newCoin = pay.split(am ,ctx);
        balance::join(&mut vault.curve_money,newCoin.into_balance());
        transfer::public_transfer(pay, ctx.sender())
    };
    log(b"curve_balance:",&vault.curve_balance.value());
    log(b"target_amount:",&target_amount);
    let token = vault.curve_balance.split(target_amount as u64).into_coin(ctx);
    (token,am,sp )
}

entry public fun entry_buy<T>(pay : Coin<SUI>, target_amount :u64,vault : &mut CurveVault<T>,ctx : &mut TxContext ){
    let (token,cost,sp0) = buy(pay,target_amount,vault,ctx);
    transfer::public_transfer(token, ctx.sender());

    let curve_address = object::id(vault).to_address();
    let coin_type_name = std::type_name::get<T>().into_string();
    emit(CoinTransferEvent{
        token_before_transfer : sp0 ,
        coin_type_name : coin_type_name ,
        token_amount : target_amount ,
        token_from: curve_address,
        token_to:ctx.sender(),
        sui_amount : cost ,
    })
}


#[allow(lint(self_transfer))]
public fun sell<T>(token : Coin<T> ,vault : &mut CurveVault<T>,ctx : &mut TxContext ) : (Coin<SUI>,u64)  {
    let token_amount  = token.value();
    let sp = (balance::supply_value<T>(&vault.total_supply) - balance::value<T>(&vault.curve_balance)) ;
    let sp0 = sp as u128;
    log(b"sp0",&sp0);
    log(b"token_amount",&token_amount);
    let sp1 = sp0 - (token_amount as u128) ;
    let tdv = vault.token_decimals_value;
    let sdv = vault.sui_decimals_value;
    log(b"sp0",&sp0);
    log(b"sp1",&sp1);
    let tm0 = (K * sp0 * sp0 + C * sp0 * tdv) /tdv * sdv / tdv;
    let tm1 = (K * sp1 * sp1 + C * sp1 * tdv)  /tdv * sdv / tdv ;

    let am  = ((tm0 - tm1) / AMPLIFY  ) as u64;
    let coin = vault.curve_money.split(am).into_coin(ctx);
    vault.curve_balance.join(token.into_balance());
    (coin,sp)
}

entry public fun entry_sell<T>(token : Coin<T>,vault : &mut CurveVault<T>,ctx : &mut TxContext )  {
    let token_amount = token.value();
    let (coin , sp0) = sell(token,vault,ctx);
    let sui_amount = coin.value();
    transfer::public_transfer(coin, ctx.sender());

    let curve_address = object::id(vault).to_address();
    let coin_type_name = std::type_name::get<T>().into_string();  
    emit(CoinTransferEvent{
        token_before_transfer : sp0,
        coin_type_name : coin_type_name ,
        token_amount : token_amount ,
        token_from: ctx.sender(),
        token_to: curve_address,
        sui_amount : sui_amount,
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


