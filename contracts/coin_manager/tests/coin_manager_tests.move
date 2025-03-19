
#[test_only]
module coin_manager::coin_manager_tests;
//use sui::sui::SUI;
// uncomment this line to import the module
use coin_manager::coin_manager::{Self,waitToCreate,afterCreate,Manager,is_creatable_by};
use sui::coin;
//use std::unit_test::assert_eq;
use sui::test_scenario::{Self as tsc};

#[test]
fun test_create(){
    let alice : address = @0xa;
    let bob : address = @0xb;
    let mut sc = tsc::begin(alice);
    coin_manager::init_for_test(sc.ctx());
    let _ = tsc::next_tx(&mut sc, alice);

    let mut manager = tsc::take_shared<Manager>(&sc);
    let coin = coin::mint_for_testing(15_0000_0000, sc.ctx());
    waitToCreate(coin,bob,&mut manager,sc.ctx());
    assert!(is_creatable_by(bob,& manager, sc.ctx()));
    assert!(!is_creatable_by(alice,& manager, sc.ctx()));
    afterCreate(&mut manager,bob, sc.ctx());
    assert!(!is_creatable_by(bob,& manager, sc.ctx()));

    tsc::return_shared(manager);
    

    tsc::end(sc);
}

#[test]
fun test2(){

}