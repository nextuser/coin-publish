module coin_manager::logger;
use std::debug::print;
use std::string::utf8;
public fun log<T>(msg : vector<u8>, arg : &T){
    print(&utf8(msg));
    print(arg);
}