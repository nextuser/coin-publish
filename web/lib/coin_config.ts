type CoinConfig ={
    coin_manager_pkg : string,
    coin_manager : string,
    operator : string,

}

export function getCoinConfig() : CoinConfig {
    return {
        coin_manager_pkg : '0xc650be7a023c5fd463f352ecf9d5cbfb8c17fe94c55a4d6a3d5c76aff40ddcd8',
        coin_manager : '0xbbb6b1115584e51e1f378b59a15aac9993c562a7f9fc613415c0d7d0fafed920',
        operator : '0xf7ec2215e565b7a18d7b00e70fccda74b30c3ecceffb5857b1b3d2249e28e94f'
    }
}