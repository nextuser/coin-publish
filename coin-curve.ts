/**
totoal value
    k = 1e-16  c = 2.8e-8 
    tv: total_value: 
    S: supply to other user, total_supply - curve_balance
    P:  Price, 
    
    P = 2 * k * S
   EQ0: tv = k *  S * S + c * S

  S =  total_supply - curve_balance
一直 s0, k,c, tv0
已知 新购买的钱 (tv1 - tv0), 求新增可以购买的代币两 s1-s0
   EQ1:tv1 = k *  S1 * S1 + c * S1
   A = sui_amount = tv1 - tv0
   x = token_amount = s1 - s0

将 EQ1-EQ0 获得
   tv1 - tv0 = k *  (s1 + s0) ( s1 - s0) + c * (s1 - s0)
    x = s1 - s0
    A = k * (x + s0 + s0 ) * x  + c * x
    A = k * x^2 + 2*k*s0*x + c*x
    k * x*x + (2*k*s0 + c)*x - A = 0
*/


const K = 1e-16;
const C = 2.8e-8;

function get_buy_amount(s0 :number, sui_amount:number) {
    let b = 2*K*s0 + C;
    let a = K;
    let c = -sui_amount;

    let u = Math.sqrt( b**2  - 4*a*c) - b;
    let delta  = u/(2*K);
    console.log('delta:',delta);
    // 验算
    let  s1 = s0 + delta;
    let tv1 = K * s1 * s1 + C * s1;
    let tv0 = K * s0 * s0 + C * s0;
    console.log('t0 t1',tv0,tv1);
    console.log("tv1 - t0 vs delta", tv1 -  tv0, delta);
    return delta;
}


get_buy_amount(0,0.0281);
get_buy_amount(1e6,0.0991);