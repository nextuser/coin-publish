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

import { PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER } from "next/dist/lib/constants";
import { Dela_Gothic_One } from "next/font/google";


const K = 1e-16;
const C = 2.8e-8;
export function get_token_value(s :number) :number{
    return K * s * s + C * s;
}

export function get_buy_amount(s0 :number, sui_amount:number, decimals =6) :[number,number]{
    const decimal_value = 10 ** decimals;
    let b = 2*K*s0 + C;
    let a = K;
    let c = -sui_amount;

    let u = Math.sqrt( b**2  - 4*a*c) - b;
    let delta  = u/(2*K);
    //保留6位小数
    delta = Math.floor(delta * decimal_value)/decimal_value;

    let  s1 = s0 + delta;
    let tv1 = K * s1 * s1 + C * s1;
    let tv0 = K * s0 * s0 + C * s0;
   
    let diff = tv1 -  tv0

    return [delta,s1];
}


export function get_sell_amount(s0 : number, delta : number) :[number,number]{
    let  s1 = s0 - delta;
    let tv1 = K * s1 * s1 + C * s1;
    let tv0 = K * s0 * s0 + C * s0;
    let diff = tv0 -  tv1;
    diff = Math.floor(diff * 1e9)/1e9
    return [diff, s1];
}


/*    pow(10,n) = 10 ^ n     pow(10,6) => 1000_000

td: token.decimals
sd : sui.decimals
tdv : pow(10, td) 
sdv : pow(10,sd)

S = s * pow(10,token.decimals) =  s * tdv
sp0 = s0 * pow(10,token.decimals) = s0 * tdv
sp1 = s1 * pow(10,token.decimals) = s1 * tdv


 tv1 - tv0 = k *  (s1 + s0) ( s1 - s0) + c * (s1 - s0)
 增长的sui : A = tv1 - tv0
 增长的mist AM = A * sdv
 因为move输入参数,都是以 S *  tdv , sui 也是以mist为单位
  A = k * (sp1/tdv + sp0/tdv) (sp1/tdv - sp0/tdv)  + c * (sp1/tdv - sp0/tdv)
  A = k * (sp1 *sp1 - sp0 * sp0)/ (tdv * tdv)  +  c * (sp1 - sp0) / tdv
  A * tdv * tdv  = k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)
  A = [k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)] / (tdv * tdv)
  AM =  [k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)] * sdv / (tdv * tdv)
  
*/



