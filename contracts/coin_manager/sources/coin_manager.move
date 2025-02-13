
/// Module: coin_manager
module coin_manager::coin_manager;
use sui::coin::{CoinMetadata,TreasuryCap};
use std::string;
use std::ascii;

public struct CoinInfo has copy,drop{
    type_name : ascii::String,
    type_addr : ascii::String,
    meta_name : string::String,
    treasury_address : ascii::String,
}
public struct CoinInfoStore has key{
    id : UID,
}

public fun register_coin<T >( treasury: &TreasuryCap<T>, meta : &CoinMetadata<T>  ){
    let treasury_addr = sui::object::id(treasury).to_address().to_ascii_string();
    let type_name = std::type_name::get<T>();
    let name = type_name.borrow_string();
    let meta_name = meta.get_name();
    let type_addr = type_name.get_address();

    sui::event::emit(CoinInfo{
        type_name : * name,
        type_addr : type_addr,
        meta_name : meta_name,
        treasury_address: treasury_addr
    })
}

public fun freeze_meta<T>(meta :CoinMetadata<T>){
    transfer::public_freeze_object(meta);
}

entry fun make_immutable(cap : sui::package::UpgradeCap){
    sui::package::make_immutable(cap);
}



