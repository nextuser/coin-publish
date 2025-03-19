import {publishCoin } from '../publishCoin'
import {getLocalSigner} from '../sui/local_key';
//https://suiscan.xyz/testnet/coin/0x747a057e094034753faac5b7a6402f6482a5cb34d05d3fcb629c519da55c5c7b::ydt::YDT/txs
async function test_publish(){
    const keypair = getLocalSigner();
    const OPERATOR = "0x16781b5507cafe0150fe3265357cccd96ff0e9e22e8ef9373edd5e3b4a808884"
    let publishResult = await publishCoin( {
        module_name:"ydt",
        coin_name : "袁大头",
        symbol : "YDT",
        decimal: 7,
        desc: "袁大头是一个有趣的代币",
	minter : '0xafe36044ef56d22494bfe6231e78dd128f097693f2d974761ee4d649e61f5fa2',
        imageUrl : "https://img.alicdn.com/bao/uploaded/i4/2211353769366/O1CN01LfIYel2J3gPxGbQws_!!0-item_pic.jpg" 
    },OPERATOR,keypair);

    console.log("publish result:",publishResult);
}
test_publish();
