
import { get_buy_amount,get_sell_amount, get_token_value } from "../coin_curve";
let s= 0
let dt = 0;
let sui_arr = [0.0281,
    0.071062962,
    0.020565808,
    0.021175667,
    0.021282926,
    0.052335967,
    0.052973467,
    0.021387863];

let delta_amount = [];

console.log("_______________buy amount____________");
for(const  v of  sui_arr){
    [dt,s] = get_buy_amount(s ,v);
    ///console.log('dt,s,sui',dt,s,v);
    console.log('dt,s, sui',dt,s, v);
    delta_amount.push(dt);
}
    


console.log("---------------sell amount----------");
for(const  v of  delta_amount.reverse()){
    [dt,s] = get_sell_amount(s , v);
    console.log('dt,s, sui',dt,s, v);
}

[dt,s] = get_buy_amount(0,85);
console.log("dt,s, percent ",dt,s,(s/1e9) * 100 )

let v = get_token_value(8e8);
console.log("v of 8e8",v);