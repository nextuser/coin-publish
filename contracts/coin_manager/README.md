# 发币管理
 user 申请发币T, user初始的购买N 个T

1. op 用户发币

2  记录op用户发币的开销,  让登录user 发送开销给op

3. user调用buy 接口,发送sui,收到T

4. user 调用sell,发送T, 获得T.


# 计算价格曲线
totoal value
    k = 1e-16  c = 2.8e-8 
    tv: total_value: 
    S: supply to other user, total_supply - curve_balance
    P:  Price, 
    
    P = 2 * k * S
   EQ0: tv = k *  S * S + c * S
   
   sdv = pow(10,sui.decimals)
   换算成mist为单位 tm = tv * tdv = ( k *  S * S + c * S) * sdv

   

  S =  total_supply - curve_balance
一直 s0, k,c, tv0
已知 新购买的钱 (tv1 - tv0), 求新增可以购买的代币两 s1-s0
   -  EQ1:tv1 = k *  sp1 * sp1 + c * sp1
   - tm1 = tv1 * sdv
   - A = sui_amount = tv1 - tv0  
   这里A 是变动供应量之后获得的SUI数目
   x = token_amount = s1 - s0

将 EQ1-EQ0 获得
```
   tv1 - tv0 = k *  (s1 + s0) ( s1 - s0) + c * (s1 - s0)
    x = s1 - s0
    A = k * (x + s0 + s0 ) * x  + c * x
    A = k * x^2 + 2*k*s0*x + c*x
    k * x*x + (2*k*s0 + c)*x - A = 0
```


    pow(10,n) = 10 ^ n     pow(10,6) => 1000_000

## 变量定义
- td: token.decimals
- sd : sui.decimals
- tdv : pow(10, td) 
- sdv : pow(10,sd)

- sp = s * pow(10,token.decimals) =  s * tdv
- sp0 = s0 * pow(10,token.decimals) = s0 * tdv
- sp1 = s1 * pow(10,token.decimals) = s1 * tdv

## 原有公式:
 $$ tv1 - tv0 = k *  (s1 + s0) ( s1 - s0) + c * (s1 - s0) $$

 增长的sui : A = tv1 - tv0
 增长的mist AM = A * sdv
 因为move输入token参数,都是以 S *  tdv , sui 也是以mist为单位,即  A * sdv
  A = k * (sp1/tdv + sp0/tdv) (sp1/tdv - sp0/tdv)  + c * (sp1/tdv - sp0/tdv)
  A = k * (sp1 *sp1 - sp0 * sp0)/ (tdv * tdv)  +  c * (sp1 - sp0) / tdv
  A * tdv * tdv  = k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)
  A = [k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)] / (tdv * tdv)
  AM =  [k * (sp1 * sp1 - sp0 * sp0) + c* tdv * (sp1 - sp0)] * sdv / (tdv * tdv)
  