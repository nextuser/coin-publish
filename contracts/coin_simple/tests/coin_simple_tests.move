/*
#[test_only]
module coin_simple::coin_simple_tests;
// uncomment this line to import the module
// use coin_simple::coin_simple;

const ENotImplemented: u64 = 0;
*/

#[test_only]
module coin_simple::coin_simple_tests;
use coin_simple::template::{TEMPLATE,Self};
use coin_manager::coin_manager::{Self,CoinCreatedEvent,CoinTransferEvent,CoinManagerCreated,CurveVault};
use sui::test_scenario::{Self as tsc,TransactionEffects,Scenario};
use sui::tx_context;
use std::option::{Self,Option};

const Operator : address = @0xa;
const User : address = @0xb;

// fun findEvent<T: copy + drop>(effects :&TransactionEffects,sc : & Scenario, owner : address) : Option<T> {
//     let len = effects.num_user_events();
//     if(len == 0){
//         return option::none()
//     };
//     let created = &effects.created();
//     let len = created.length();
//     let mut i = 0;
//     loop{
//         if(i < len){
//             break;
//         };
//         let id = created[i];
//         let obj =  tsc::take_from_address_by_id(sc,owner,id)

//         i = i + 1;
//     };
//     return option::none()
// }


#[test]
fun test_coin_crate(){
    let mut sc1 =  tsc::begin(Operator);
    //manager init
    coin_manager::init_for_test( sc1.ctx());
    let effects = sc1.next_tx(User);
    let manager = tsc::take_shared<coin_manager::Manager>(&sc1);
    assert!(manager.manager_owner() == Operator,1);
    assert!(effects.num_user_events() > 0);
    tsc::return_shared(manager);
    //coin template init
    template::init_for_test(sc1.ctx());

    let effects = tsc::next_tx(&mut sc1, User);
    assert!(effects.num_user_events() > 0 ,3);
    let vault = tsc::take_shared<CurveVault<coin_simple::template::TEMPLATE>>(&sc1);
    assert!(vault.vault_creator() == User,4);
    assert!(vault.vault_supply() == 0,5);
    tsc::return_shared(vault);
    tsc::end(sc1);
    
    
}

// #[test, expected_failure(abort_code = ::coin_simple::coin_simple_tests::ENotImplemented)]
// fun test_coin_simple_fail() {
//     abort ENotImplemented
// }

