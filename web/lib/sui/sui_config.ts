import dotenv from 'dotenv';
dotenv.config();

export type SuiConfig = {
    coin_manager_pkg: string,
    coin_manager:string,
    operator : string,
    site : string
}

function getValidEnv(name :string){
    let value = process.env[name]
    if(value == null || value.length == 0){
        console.log(`export ${name}= ....`);
        process.exit(-1);
    }
    return value;
}
export  function getSuiConfig()  : SuiConfig{
    const coin_manager_pkg =  getValidEnv('COIN_MANAGER_PACKAGE');
    const operator = getValidEnv('OPERATOR');
    const coin_manager = getValidEnv('COIN_MANAGER')
    const site = process.env['SITE'] || 'https://coinspub.vercel.app';

    return {
        coin_manager_pkg,
	    coin_manager,
        operator,
        site,
    }   
}