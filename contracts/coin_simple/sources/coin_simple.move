// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions
module coin_simple::template {
    use sui::coin::{Self};
    use coin_manager::coin_manager;

    /// The OTW for the Coin
    public struct TEMPLATE has drop {}

    const DECIMALS: u8 = 6;
    const SYMBOL: vector<u8> = b"SYMBOL_TEMPLATE";
    const NAME: vector<u8> = b"COIN_NAME_TEMPLATE";
    const DESCRIPTION: vector<u8> = b"COIN_DESCRIPTION_TEMPLATE";
    const INIT_SUPPLY: u64 = 1000_000;
    

    /// Init the Coin
    fun init(witness: TEMPLATE, ctx: &mut TxContext) {
        let (mut treasury, metadata) = coin::create_currency(
            witness, DECIMALS, SYMBOL, NAME, DESCRIPTION, option::none(), ctx
        );
        
        coin_manager::register_coin(&treasury,&metadata);
        coin::mint_and_transfer(&mut treasury,INIT_SUPPLY, ctx.sender(),ctx);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
        transfer::public_transfer(metadata, tx_context::sender(ctx));
    }
}