'use server'
import dotenv from 'dotenv';
dotenv.config();

export type SuiConfig = {
    coin_type :string,
    vault : string,
    coin_manager_pkg: string,
    operator : string,
    bv_api_key :string,
}

function getValidEnv(name :string){
    let value = process.env[name]
    if(value == null || value.length == 0){
        console.log(`export ${name}= ....`);
        process.exit(-1);
    }
    return value;
}
export async function getSuiConfig()  : Promise<SuiConfig>{
    const coin_type = getValidEnv('COIN_TYPE')
    const coin_manager_pkg =  getValidEnv('COIN_MANAGER_PACKAGE');
    const vault = getValidEnv('VAULT');
    const operator = getValidEnv('OPERATOR');
    const bv_api_key = getValidEnv('BV_API_KEY');


    return {
        coin_type,
        coin_manager_pkg,
        vault,
        operator,
        bv_api_key
    }   
}