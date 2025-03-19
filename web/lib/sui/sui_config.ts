'use server'
import dotenv from 'dotenv';
dotenv.config();

export type SuiConfig = {
    coin_manager_pkg: string,
    coin_manager:string,
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
    const coin_manager_pkg =  getValidEnv('COIN_MANAGER_PACKAGE');
    const operator = getValidEnv('OPERATOR');
    const bv_api_key = getValidEnv('BV_API_KEY');
    const coin_manager = getValidEnv('COIN_MANAGER')

    return {
        coin_manager_pkg,
	    coin_manager,
        
        operator,
        bv_api_key
    }   
}