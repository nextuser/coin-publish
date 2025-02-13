
/// Module: coin_manager
module coin_manager::coin_manager;
use sui::coin::CoinMetadata;
use std::string;
use std::ascii;
public struct CoinInfo has copy,drop{
    type_name : ascii::String,
    addr : ascii::String,
    meta_name : string::String,
    treasury_address : ascii::String,
}
public struct CoinInfoStore has key{
    id : UID,
}

public fun register_coin<T >( treasury: address, meta : &CoinMetadata<T>  ){
    let type_name = std::type_name::get<T>();
    let name = type_name.borrow_string();
    let meta_name = meta.get_name();
    let addr = type_name.get_address();

    sui::event::emit(CoinInfo{
        type_name : * name,
        addr : addr,
        meta_name : meta_name,
        treasury_address: treasury.to_ascii_string()
    })
}

public fun freeze_meta<T>(meta :CoinMetadata<T>){
    transfer::public_freeze_object(meta);
}

entry fun make_immutable(cap : sui::package::UpgradeCap){
    sui::package::make_immutable(cap);
}



