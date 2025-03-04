
#[test_only]
module coin_manager::coin_manager_tests;
// uncomment this line to import the module
// use coin_manager::coin_manager;
use coin_manager::utils::pow;


#[test]
fun test_pow() {
    assert!(pow(10,0)==1);
    assert!(pow(10,2)==100);
    assert!(pow(10,3)== 1000);
    assert!(pow(10,4)== 10_000);
    assert!(pow(10,5)== 100_000);
    assert!(pow(10,6)== 1000_000);
}

