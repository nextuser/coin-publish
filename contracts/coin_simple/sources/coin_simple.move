// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions
module coin_simple::template {
    use sui::coin::{Self};
    use sui::url::{Self,Url};
    use std::ascii;
    use coin_manager::coin_manager;

    /// The OTW for the Coin
    public struct TEMPLATE has drop {}

    const DECIMALS: u8 = 9;
    const SYMBOL: vector<u8> = b"SYMBOL_TEMPLATE";
    const NAME: vector<u8> = b"COIN_NAME_TEMPLATE";
    const DESCRIPTION: vector<u8> = b"COIN_DESCRIPTION_TEMPLATE";
    const URL: vector<u8> = b"IMAGE_URL_TEMPLATE";

    /// Init the Coin
    fun init(witness: TEMPLATE, ctx: &mut TxContext) {
        let urlStr = ascii::string(URL);// 这个模版代码是未来会替换常量的,为了避免编译器优化,定义变量来获取内容
        let image_url:Option<Url> =  if (urlStr.length() > 0 ){  option::some(url::new_unsafe(urlStr))  } else{ option::none()};
        let (treasury, metadata) = coin::create_currency(
            witness, DECIMALS, SYMBOL, NAME, DESCRIPTION,image_url, ctx
        );
       //这是为了未来管理coin,提供一个管理模块
        coin_manager::register_coin(treasury,metadata,ctx);
    }

    #[test_only]
    public fun init_for_test( ctx: &mut TxContext) {
        let witness = TEMPLATE{};
        init(witness, ctx);
    }

}