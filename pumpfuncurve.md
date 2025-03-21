# 价格曲线
## 函数
- 价格是供应量的线性函数
- 供应量越多,价格越高 (这是炒作的基础, 有人总想着自己便宜买了,卖给后面的人)

```math
   P = 2 * k * S  + c  
``` 
- P 价格
- S 是普通用户购买的coin的总数.

## 我采用的参数
   - k = 1e-16  c = 2.8e-8 
   - tv: total_value: 
   - S: supply to other user, total_supply - curve_balance
   - P:  Price, 
   
# 供应货币的总价值 

```math
   tv = k *  S ^2 + c * S  
```

## 代币价值估算

- 采用总代币供应量是10亿(10e9)   
- 当达到 80%  S= 8e8 时, tv = 86.4
```javascript
function value(s) {  
   const k = 1e-16;
   const c= 2.8e-8; 
   return k*(s*s) + c *s  ; 
}
console.log(value(8e8));// 86.4
```
pump.fun 据说是达到85SOL 左右会转入swap



## 合约里面的供应量含义
  ```math
 S =  total\_supply - curve\_balance 
  ```
- total_supply 是总供应量 10e9
- curve_balance 是curve保有的余额

## 合约里面的余额表示,每个coin有一个decimals参数 
### 根据decimals 计算乘以10的几次方
```math
 dv = 10 ^ {decimals}  
```

   - sdv = pow(10,sui.decimals)
   - tdv = pow(10,token.decimals)
### pow 函数定义
```math
 pow(10,n) = 10 ^ n 
 ```
例如: pow(10,6) => 1000_000


## 计算已知供应量s0 , 花一笔sui_amount ,能够买到多少token_amount

已知 s_0, k,c, tv_0
已知 新购买的钱 (tv_1 - tv_0), 求新增可以购买的代币个数 s1-s_0
- EQ0:
```math
 tv_0 = k *  sp_0 * sp_0 + c * sp_0 
```

- EQ1:
```math
 tv_1 = k *  sp_1 * sp_1 + c * sp_1 
```
### 卖出token:
  - 用户 => Curve : token
  - Curve => 用户 : coin<SUI>

  已知token_amount = s0 - s1
  求解: 

   ```math
 A = tv_1 - tv_0
   ```


- 将 EQ1-EQ0 获得
```math
 A = tv_1 - tv_0 = k *  (s1 + s_0) ( s1 - s_0) + c * (s1 - s_0) 
```

 ```math
 x = s1 - s_0 
 ```
```math
  A = k * (x + s_0 + s_0 ) * x  + c * x  
```
```math
  A = k * x^2 + 2*k*s_0*x + c*x  
```

  ```math
  k * x*x + (2*k*s_0 + c)*x - A = 0  
  ```
### 买入token 已知A ,求解X
我们需要解方程：

\[ k \cdot x^2 + (2 \cdot k \cdot s_0 + c) \cdot x - A = 0 \]

这是一个关于 \( x \) 的二次方程，标准形式为：

\[ a x^2 + b x + c = 0 \]

其中：
- \( a = k \)
- \( b = 2 \cdot k \cdot s_0 + c \)
- \( c = -A \)

#### 求解一元二次方程的根：
1. **判别式**：
   判别式 \( D \) 用于判断方程的根的性质：
   \[
   D = b^2 - 4ac
   \]

   \[
   x = \frac{-b + \sqrt{D}}{2a}
   \]
   

#### 使用typescript实现
```ts
const Decimal = 10e6;
export function get_buy_amount(s0 :number, sui_amount:number) :[number,number]{
    let b = 2*K*s0 + C;
    let a = K;
    let c = -sui_amount;

    let u = Math.sqrt( b**2  - 4*a*c) - b;
    let delta  = u/(2*K);
    //保留6位小数
    delta = Math.floor(delta * Decimal)/Decimal;

    let  s1 = s0 + delta;
    let tv1 = K * s1 * s1 + C * s1;
    let tv0 = K * s0 * s0 + C * s0;
   
    let diff = tv1 -  tv0

    return [delta,s1];
}
```


# Move语言侧计算购买数量
因为Move语言不支持浮点数,因此需要使用整数运算来模拟.

- td: token.decimals
- sd : sui.decimals
- tdv : pow(10, td) 
- sdv : pow(10,sd)
```math
 sp = s * pow(10,token.decimals) =  s * tdv 
```

```math
 sp_0 = s_0 * pow(10,token.decimals) = s_0 * tdv
```
```math
 sp_1 = s1 * pow(10,token.decimals) = s1 * tdv
```
```math
tv_1 - tv_0 = k *  (s1 + s_0) ( s1 - s_0) + c * (s1 - s_0)
```
#### 购买token:

 增长的sui : 
```math
 A = tv_1 - tv_0
```
 此时已知购买的的token_amount = s1 - s0, 
求解 A


 - 购买时,输入的sui balance,是一个增加的值,换算单位为mist: 
```math
 AM = A * sdv 
```


 - 因为move输入参数,都是整数 .token的balance :
```math
 sp = S * 10 ^ {token.decimals}  = S * 10^ {td} = S * tdv  
```

 - 输入的sui balance,  以mist为单位
```math
  AM = A * 10 ^{sui.decimals} = A * 10 ^sdv = A * sdv 
```

```math
 A = k * ( \frac{sp_1}{tdv})^2  - (\frac{sp_0}{tdv})^2  + c * (\frac{sp_1}{tdv} - \frac{sp_0}{tdv}) 
```

```math
 A = k * (sp_1 *sp_1 - sp_0 * sp_0)/ (tdv * tdv)  +  c * (sp_1 - sp_0) / tdv 
```

```math
 A * tdv * tdv  = k * (sp_1 * sp_1 - sp_0 * sp_0) + c* tdv * (sp_1 - sp_0) 
```

```math
 A = [k * (sp_1 * sp_1 - sp_0 * sp_0) + c* tdv * (sp_1 - sp_0)] / (tdv * tdv) 
```

- 两边乘以sdv ( AM = A * sdv) 
  - 卖的时候,根据sp,求AM ,因为数字很大,可能会越界,目前move支持最大整数是128bits, 最大支持10^38

```node
> Math.log10(2**128)
38.53183944498959
``` 
- EQ2
```math
 AM =  [k * (sp_1 * sp_1 - sp_0 * sp_0) + c* tdv * (sp_1 - sp_0)] * sdv / (tdv * tdv) 
```


#### 买入token
  输入SUI: AM'  delta_sp
 使用move计算太复杂,让typescript计算出来 delta_sp, 
验证
根据 sp0 , sp1=(sp0 - delta_sp  ),根据EQ2 计算AM.
只要保证
AM' 是发送给curve的.
验证:
abs( AM)  <= AM'

```puml
user -> coin_manager : sell(AM',delta_sp)
coin_manager->coin_manager:calculate 
note over coin_manager:根据delta_sp计算AM
alt AM <= AM'
coin_manager -> CurveVault : transfer(AM)

CurveVault -> user : transfer(token_delta_sp)
coin_manager -> user : transfer(AM' - AM)
end
```
