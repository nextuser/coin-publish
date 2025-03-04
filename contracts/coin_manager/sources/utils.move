module coin_manager::utils;
const ConvertDivide : u8 = 1;
const ConvertMultiply : u8 = 2;
const ConvertEqual : u8 = 0;

public fun pow(base : u64, exponent : u8 ) : u64{
    let mut i = 0;
    let mut ret = 1;
    loop {
        if(i >= exponent){
            break
        };
        ret = ret * base;
        i = i + 1;        
    };
    ret
}


public struct Convert has store{
    ctype : u8,
    times : u64
}

public fun get_convert(from : u8, to :u8) : Convert {
    if(from == to ){
        return Convert{
            ctype : ConvertEqual,
            times : 1
        }
    };

    if(from < to ){
        Convert{
            ctype : ConvertMultiply,
            times : pow(10,to - from)
        }
    } else {
        Convert {
            ctype : ConvertDivide,
            times : pow(10, from - to)
        }
    }
}

public fun convert(amount : u128, convert : &Convert) : u128 {
    if(convert.ctype == ConvertDivide){
        return amount / (convert.times as u128)
    };

    if(convert.ctype == ConvertMultiply){
        return amount * (convert.times as u128)
    };
    amount
}