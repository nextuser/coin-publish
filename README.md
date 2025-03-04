# coin-publish
publish coin for user who do not know programming in sui
## publish  coin_manager
最新上传采用设置
- 修改 contracts/coin_manager/Move.toml
```toml
coin_manager = "0x0"
```
- 上传

```bash
sui move build
sui client publish | tee pub-testnet.out
```

查看pub-testnet.out
```
 Published Objects:                                                                                        │
│  ┌──                                                                                                      │
│  │ PackageID: 0x772aa203264cb2fc80c2c36650cbe5790a04792c6a320eb1e5875720c48dbcd3                          │
│  │ Version: 1                                                                                             │
│  │ Digest: 7fEvDcr1eUfBu2y8VFJ4wU1hxMF3npqjL199NPbnhYrh                                                   │
│  │ Modules: coin_manager, inflat_supply, limit_supply, lock    
```


##  coin_simpole
修改 contracts/coin_manager/Move.toml
```toml
coin_manager = "0x772aa203264cb2fc80c2c36650cbe5790a04792c6a320eb1e5875720c48dbcd3"
```

修改 contracts/coin_simple/Move.toml
```toml
coin_manager = "0x772aa203264cb2fc80c2c36650cbe5790a04792c6a320eb1e5875720c48dbcd3"
```

### 单元测试
```bash
cd contracts/coin_simple
sui move build
sui move test

```

## 本地测试发币
```
cd web/lib/test

npx tsx publish.t.ts
```
能够获得vault地址

```
  created_event: {
    meta_name: '袁大头',
    minter: '0xf7ec2215e565b7a18d7b00e70fccda74b30c3ecceffb5857b1b3d2249e28e94f',
    treasury_address: 'b4f32dd58dc542ea807d75a94f00bb49e9844e5505bc999c1bbe6c575dc14215',
    type_name: 'a61b376a927d7cdd89053cd7f24347b1e0db39e70cc90a0089dfb585735652b3::ydt::YDT',
    vault_address: '0xa4e993ed3064711abb0efdee475573b90a354baf76d6bbd25eec85afc20684cb'
  },
```


### typescript 测试buy 和test, 
```bash
cd web/lib/test
export COIN_MANAGER_PACKAGE=0x772aa203264cb2fc80c2c36650cbe5790a04792c6a320eb1e5875720c48dbcd3
export VAULT=0xa4e993ed3064711abb0efdee475573b90a354baf76d6bbd25eec85afc20684cb
npx tsx coin_info.t.ts

```


### 编译使用本地库