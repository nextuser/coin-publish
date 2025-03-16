

export type Config = {
    ///template_package  : string,
    env:EnvName
}

const testnet_config : Config={

    ///template_package : '0x6e058ff7361d09aedef2dd54c6a7f1c2ea21a0e7f392ec5ec47f37ce14873ddc',
    env:'testnet'
}


const mainnet_config : Config={

    //template_package : 'todo',
    env:'mainnet'
}

const devnet_config : Config={

    //template_package : 'todo',
    env:'devnet'
}

export type EnvName =     'testnet'|'mainnet'|'devnet'



export  const Envs ={
    testnet : testnet_config,
    mainnet : mainnet_config,
    devnet  : devnet_config,
}

export class EnvConfig  {
    private active_env : EnvName;

    constructor(env : EnvName){
        this.active_env = env
    }
    config() :Config  {
        return Envs[this.active_env] 
    }

    env() : EnvName{
       return  this.active_env
    }
}

export const test_env : EnvConfig = new EnvConfig('testnet')
export const main_env : EnvConfig = new EnvConfig('mainnet')
export const dev_env  : EnvConfig = new EnvConfig('devnet')  
export  default test_env




