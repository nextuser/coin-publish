
#[test_only]
module coin_manager::coin_manager_tests;
//use sui::sui::SUI;
// uncomment this line to import the module
use coin_manager::coin_manager::{Self,waitToCreate,Manager,is_creatable_by};
use sui::coin;
//use std::unit_test::assert_eq;
use sui::test_scenario::{Self as tsc};

#[test]
fun test_create(){
    let operator : address = @0xa;
    let user : address = @0xb;
    let other : address = @0xc;
    let mut sc = tsc::begin(operator);

    coin_manager::init_for_test(sc.ctx());
    let _ = tsc::next_tx(&mut sc, user);

    let mut manager = tsc::take_shared<Manager>(&sc);
    let coin = coin::mint_for_testing(15_0000_0000, sc.ctx());
    waitToCreate(coin,operator,&mut manager,sc.ctx());
    
    let _ = tsc::next_tx(&mut sc,operator);
    assert!(is_creatable_by(user,& manager, sc.ctx()));
    assert!(!is_creatable_by(other,& manager, sc.ctx()));
    assert!(!is_creatable_by(operator,& manager, sc.ctx()));
    
    // after_create(user,vault,&mut manager, sc.ctx());
    // assert!(!is_creatable_by(user,& manager, sc.ctx()));
    tsc::return_shared(manager);
    tsc::end(sc);
}

#[test]
fun test2(){

}