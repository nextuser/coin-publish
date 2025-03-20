import suiConfig from '@/lib/suiConfig.json'
import { Transaction } from '@mysten/sui/transactions';
export function getPrecreateTx(operator :string) : Transaction{
    const tx = new Transaction();
    const pkg = suiConfig.coin_manager_pkg;
    //entry public(package) fun  waitToCreate(coin : Coin<SUI> ,operator : address, manager :&mut Manager, ctx : & TxContext){
    let new_coin = tx.splitCoins(tx.gas,[15_000_000])
    const target = `${pkg}::coin_manager::waitToCreate`;
    console.log("getPrecreateTx target:",target);
    tx.moveCall({target, 
            arguments:[new_coin, tx.pure.address(operator),tx.object(suiConfig.coin_manager)]})
    tx.setGasBudget(1e8)
    return tx;
}
