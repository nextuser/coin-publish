import fs from 'fs';
import path from 'path';
import { bcs } from '@mysten/bcs';

//import bytecode_template from '@mysten/move-bytecode-template/move_bytecode_template/move_bytecode_template';
import * as template from  '../pkg';
import { fromBase64 } from '@mysten/bcs';
import { fromHex } from '@mysten/bcs';
import { toHex } from '@mysten/bcs';
import { assert } from 'console';
import { Transaction } from '@mysten/sui/transactions';
import {getSigner,getLocalSigner} from './sui/local_key';
import { SuiClient,getFullnodeUrl } from '@mysten/sui/client';
import { test_env as env } from "./sui/config";



type DumpFormat ={
    modules : string[],
    dependencies:string[],
    digest : Uint8Array[]
}


type PublishCoinParams =  {
    module_name:string,
    coin_name : string,
    symbol :string ,
    decimal:number,
    desc:string ,initialSupply : string, imageUrl? : string
}

function coinTemplateBytes2() : [ Uint8Array,string[]]{
    let file = path.resolve(__dirname, '../../contracts/coin_simple/out.json');
    let json = JSON.parse(String(fs.readFileSync(file))) as DumpFormat;
    let bytecode : Uint8Array =  fromBase64(json.modules[0]);
    console.log("coinTemplateBytes2 hex:",toHex(bytecode));
    return [bytecode,json.dependencies];
}


async function publishCoin(params : PublishCoinParams){
    //let version = template.version();
    //console.log(version);
    console.log("publish coin");

    let [bytecode,deps] = coinTemplateBytes2();
    console.log("bytecode length :",bytecode.length);

    
    let jsonRet = template.deserialize(bytecode);
    let bytes = template.serialize(jsonRet);
    assert(bytes.length == bytecode.length);
    // console.log("jsonRet",jsonRet);
    // console.log("bytes ",bytes);
    // console.log("bytecodes ",json.modules[0]);

    
    // please, manually scan the existing values, this operation is very sensitive
    console.log("constants:",template.get_constants(bytecode));

    let updated = template.update_identifiers(bytecode, {
        "TEMPLATE": params.module_name.toUpperCase(),
        "template": params.module_name
    });


    // Update DECIMALS
    updated = template.update_constants(
        updated,
        bcs.u8().serialize(params.decimal).toBytes(), // new value
        bcs.u8().serialize(6).toBytes(), // current value
        'U8', // type of the constant
    );

    // Update SYMBOL
    updated = template.update_constants(
        updated,
        bcs.string().serialize(params.symbol).toBytes(), // new value
        bcs.string().serialize('SYMBOL_TEMPLATE').toBytes(), // current value
        'Vector(U8)', // type of the constant
    );

    // Update NAME
    updated = template.update_constants(
        updated,
        bcs.string().serialize(params.coin_name).toBytes(), // new value
        bcs.string().serialize('COIN_NAME_TEMPLATE').toBytes(), // current value
        'Vector(U8)', // type of the constant
    );


    // Update desc
    updated = template.update_constants(
        updated,
        bcs.string().serialize(params.desc).toBytes(), // new value
        bcs.string().serialize('COIN_DESCRIPTION_TEMPLATE').toBytes(), // current value
        'Vector(U8)', // type of the constant
    );


    // Update URL
    if(params.imageUrl){
        updated = template.update_constants(
            updated,
            bcs.string().serialize(params.imageUrl).toBytes(), // new value
            bcs.string().serialize('IMAGE_URL_TEMPLATE').toBytes(), // current value
            'Vector(U8)', // type of the constant
        );
    }


       // Update URL
    updated = template.update_constants(
        updated,
        bcs.u64().serialize(params.initialSupply).toBytes(), // new value
        bcs.u64().serialize('1000000').toBytes(), // current value
        'U64', // type of the constant
    );
    let signer = getLocalSigner();
    let tx = new Transaction();
    let arr = updated as unknown as number[];
    let modules :number [][] = [];
    modules.push(arr)
    const [upgradeCap] = tx.publish({ modules, dependencies:deps });
    tx.transferObjects([upgradeCap], signer.getPublicKey().toSuiAddress());
    tx.setGasBudget(1e8);
    
    let config = env.config();
    

    const suiClient = new SuiClient({ url: getFullnodeUrl(config.env) });
    const result = await suiClient.signAndExecuteTransaction({
        signer: signer,
        transaction: tx,
        options: {
            showEffects: true,
            showObjectChanges:true,

        },
        requestType: 'WaitForLocalExecution',
    });

    await suiClient.waitForTransaction({ digest: result.digest });

    console.log('Result: ', JSON.stringify(result, null, 2));

    if (result.effects?.status?.status !== 'success') {
        console.log('\n\nPublishing failed');
        return;
    }



    const createdObjectIds = result.effects.created!.map(
        (item) => {
            
            console.log("created:",item)
            return item.reference.objectId
        }
    );
    const createdObjects = await suiClient.multiGetObjects({
        ids: createdObjectIds,
        options: { showContent: true, showType: true, showOwner: true },
    });

    // let new_package = "";
    // if(createdObjects.error){
    //     console.log("error:",createdObjects.er);
    // }

    // createdObjects.for
    // )
    // createdObjects.data.forEach((item) => {
    //     if(item.type == "published"){
    //         new_package = item.packageId
    //     }
    // })
    if(result.objectChanges){
        result.objectChanges.forEach((item) =>{
            if(item.type == 'published'){
                console.log('package id:',item.packageId);
            } else if (item.type == "created"){
                console.log("id, type,owner",item.objectId, item.objectType,item.owner)
            }
        })

    }
}




function test_pokemon(){
    let bytes = pokemonBytes();
    let de = template.deserialize(bytes);
    let ser = template.serialize(de);
    if(ser.length == bytes.length ){
        console.log("pokemon length match");
    } else{
        console.log("pokemon error");
    }
    //console.log("ser", ser)
    //console.log("bytes",bytes)
}


function pokemonBytes() {
	return fromHex(
		'a11ceb0b060000000a01000202020403064b055139078a019b0108a5022006c5021e0ae302140cf702f7030dee0610000a000007000009000100000d00010000020201000008030400000b050100000506010000010607000004060700000c060700000e060700000f06070000060607000010060800000309050000070a050004060800060800020201030603030303030308020202020202020a0201080000010608000102010a02020708000301070800010104030303030553746174730661747461636b0664616d6167650b64656372656173655f687007646566656e7365026870056c6576656c086c6576656c5f7570036e65770f706879736963616c5f64616d6167650a706f6b656d6f6e5f7631077363616c696e670e7370656369616c5f61747461636b0e7370656369616c5f64616d6167650f7370656369616c5f646566656e73650573706565640574797065730000000000000000000000000000000000000000000000000000000000000000030800ca9a3b0000000003080000000000000000030801000000000000000002080503010204020c020e020f020602100a02000100000b320a0331d92604090a0331ff250c04050b090c040b04040e05140b01010b00010701270a023100240419051f0b01010b00010702270a00100014340b00100114340b01100214340b02340b03340700110202010100000b320a0331d92604090a0331ff250c04050b090c040b04040e05140b01010b00010701270a023100240419051f0b01010b00010702270a00100014340b00100314340b01100414340b02340b03340700110202020000000c2a0602000000000000000b0018060100000000000000180605000000000000001a060200000000000000160c070a050b01180b021a0c060b070b03180b06180632000000000000001a0602000000000000000a0518160c080a050b041806ff000000000000001a0c090b080b0918060100000000000000180b051a0203010000050d0b00340700180b010b020b030b040b050b060b071200020401000005020700020501000005040b00100514020601000005040b00100114020701000005040b00100214020801000005040b00100314020901000005040b00100414020a01000005040b00100614020b01000005040b00100014020c01000005040b00100714020d01000005140a010a0010051424040b0600000000000000000b000f051505130a001005140b01170b000f0515020e01000005090a001000143101160b000f0015020006000100020003000400000005000700',
	);
}

function coinTemplateBytes() : [ Uint8Array,string[]] {
	let bytecode = fromHex(
		'a11ceb0b060000000a01000c020c1e032a1c044608054e46079401a10108b50260069503390ace03050cd30329000e010b0206020f021002110002020001010701000002000c01000102030c01000104040200050507000009000100010a01040100020706070102030c0b01010c040d08090001030205030a030202080007080400010b02010800010805010b01010900010800070900020a020a020a020b01010805070804020b030109000b02010900010608040105010b03010800020900050c436f696e4d65746164617461064f7074696f6e0854454d504c4154450b5472656173757279436170095478436f6e746578740355726c04636f696e0f6372656174655f63757272656e63790b64756d6d795f6669656c6404696e6974046e6f6e65066f7074696f6e0f7075626c69635f7472616e736665720673656e6465720874656d706c617465087472616e736665720a74785f636f6e746578740375726c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020201060a020504544d504c0a020e0d54656d706c61746520436f696e0a021a1954656d706c61746520436f696e204465736372697074696f6e00020108010000000002130b00070007010702070338000a0138010c020a012e110438020b020b012e110438030200',
	);
    return [bytecode,["0x1","0x2"]];
}

test_pokemon();


publishCoin( {
    module_name:"ydt",
    coin_name : "袁大头",
    symbol : "YDT",
    decimal: 9,
    desc: "袁大头是一个有趣的代币",
    initialSupply : "1000000000000000000",
    imageUrl : "https://cn.bing.com/images/search?view=detailV2&ccid=ZSG1USvo&id=906A0830030A3230B4910BE6378FF5FE474AB984&thid=OIP.ZSG1USvoX1xJic56ANjUOAHaFj&mediaurl=https%3a%2f%2fts1.cn.mm.bing.net%2fth%2fid%2fR-C.6521b5512be85f5c4989ce7a00d8d438%3frik%3dhLlKR%252f71jzfmCw%26riu%3dhttp%253a%252f%252fcos3.solepic.com%252f20210220%252fb_4076303202102201332146058.jpg%26ehk%3d2bBypWhhMnHwhyFr5uQvj%252b7rik7Ya9gtM2JBmXb96UY%253d%26risl%3d%26pid%3dImgRaw%26r%3d0&exph=1080&expw=1440&q=%e8%a2%81%e5%a4%a7%e5%a4%b4+%e5%9b%be%e6%a0%87&simid=607999668809908750&FORM=IRPRST&ck=A7C7ACAB0B72067FE85DBB9C12F4DE71&selectedIndex=14&itb=0"
});