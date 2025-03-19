/*
#[test_only]
module coin_simple::coin_simple_tests;
// uncomment this line to import the module
// use coin_simple::coin_simple;

const ENotImplemented: u64 = 0;
*/

#[test_only]
module coin_simple::coin_simple_tests;
use sui::coin::{Self};
use sui::sui::SUI;
use coin_simple::template::{TEMPLATE,Self};
use coin_manager::coin_manager::{Self,waitToCreate,after_create,Manager,CurveVault};
use sui::test_scenario::{Self as tsc};
use coin_manager::logger::log;

const Operator : address = @0xa;
const User : address = @0xb;
const Other : address = @0xc;


#[test]
fun test_create(){


    let mut sc = tsc::begin(Operator);
    coin_manager::init_for_test(sc.ctx());
    

    let _ = tsc::next_tx(&mut sc, User);
    {
        let mut manager = tsc::take_shared<Manager>(&sc);
        let coin = coin::mint_for_testing(15_0000_0000, sc.ctx());
        waitToCreate(coin,Operator,&mut manager,sc.ctx()); 
        tsc::return_shared(manager);
    };

    let _ = tsc::next_tx(&mut sc, Operator);
    {

        template::init_for_test(sc.ctx());
    };

    let _ = tsc::next_tx(&mut sc, Operator);
    {
        let mut manager = tsc::take_shared<Manager>(&sc);
        assert!(coin_manager::is_creatable_by(User,& manager, sc.ctx()));
        assert!(!coin_manager::is_creatable_by(Other,& manager, sc.ctx()));
        assert!(!coin_manager::is_creatable_by(Operator,& manager, sc.ctx()));
        let mut vault : CurveVault<coin_simple::template::TEMPLATE> = sc.take_shared();
        after_create(User,&mut vault,&mut manager, sc.ctx());
        assert!(!coin_manager::is_creatable_by(User,& manager, sc.ctx()));
        tsc::return_shared(vault);
        tsc::return_shared(manager);

    };

    
    tsc::end(sc);
}

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
    {
        //manager init
        coin_manager::init_for_test( sc1.ctx());
    };
    
    let effects = sc1.next_tx(User);
    {
        let manager = tsc::take_shared<coin_manager::Manager>(&sc1);
        assert!(manager.manager_owner() == Operator,1);
        assert!(effects.num_user_events() > 0);
        tsc::return_shared(manager);
        //coin template init
        template::init_for_test(sc1.ctx());
    };

    //buy
    let effects = tsc::next_tx(&mut sc1, User);
    {
        assert!(effects.num_user_events() > 0 ,3);
        let mut vault = tsc::take_shared<CurveVault<coin_simple::template::TEMPLATE>>(&sc1);
        assert!(vault.vault_creator() == User,4);
        assert!(vault.vault_supply() == 0,1000_000);
        let pay = coin::mint_for_testing<SUI>(28100000, sc1.ctx());
        let target_amount = 1_000_000 * vault.token_decimals_value() ;
        let sp = vault.vault_supply();
        let (token,cost,s0 ) = coin_manager::buy(pay, target_amount as u64,&mut vault,sc1.ctx());
        assert!(s0 == sp);
        assert!(token.value() == (target_amount as u64));
        transfer::public_transfer(token, User);
        log(b"cost:",&cost);
        //std::debug::print(&vault);
        tsc::return_shared(vault);
    };

    //sell
    _ = tsc::next_tx(&mut sc1, User);
    {
        ////assert!(effects.num_user_events() > 0 ,3);
        let mut vault = tsc::take_shared<CurveVault<coin_simple::template::TEMPLATE>>(&sc1);
        let token_amount = 1_000_000 * (vault.token_decimals_value() as u64);
        assert!(vault.vault_creator() == User,4);
        assert!(vault.vault_supply() == token_amount,5);
        
        let token = coin::mint_for_testing<TEMPLATE>(token_amount, sc1.ctx());
        let (c,_) = coin_manager::sell(token,&mut vault,sc1.ctx());
        assert!(vault.vault_supply() == 0,6);
        log(b"sell result :coin=",&c);
        transfer::public_transfer(c, User);
        tsc::return_shared(vault);
    };
    tsc::end(sc1);
}

// #[test, expected_failure(abort_code = ::coin_simple::coin_simple_tests::ENotImplemented)]
// fun test_coin_simple_fail() {
//     abort ENotImplemented
// }

#[test]
fun test_type_name(){
    let coin_type_name = std::type_name::get<coin_simple::template::TEMPLATE>();
    log(b"test_type_name coin_type:",&coin_type_name);
}