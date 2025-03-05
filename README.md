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
│  │ PackageID: 0xbe68a49f044066855d79bc09cd9a355f8f5c4da35a698e13ed306d05076ed386                          │
│  │ Version: 1                                                                                             │
│  │ Digest: 7fEvDcr1eUfBu2y8VFJ4wU1hxMF3npqjL199NPbnhYrh                                                   │
│  │ Modules: coin_manager, inflat_supply, limit_supply, lock    
```


##  coin_simpole
修改 contracts/coin_manager/Move.toml
```toml
coin_manager = "0xbe68a49f044066855d79bc09cd9a355f8f5c4da35a698e13ed306d05076ed386"
```

修改 contracts/coin_simple/Move.toml
```toml
coin_manager = "0xbe68a49f044066855d79bc09cd9a355f8f5c4da35a698e13ed306d05076ed386"
```

### 单元测试
```bash
cd contracts/coin_simple
sui move build
sui move test

./dump.sh

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
...
    vault_address: '0xa2c5403b08db947544ca2b525218209725f20db785a5760bda178c00b619d640'
  },
```


### typescript 测试buy 和test, 
```bash
cd web/lib/test
export COIN_MANAGER_PACKAGE=`cat ../../../contracts/coin_manager/Move.toml |grep -v '#' |grep '^coin_manager' | awk -F '"' '{print($2)}'`

export COIN_MANAGER_PACKAGE=0xbe68a49f044066855d79bc09cd9a355f8f5c4da35a698e13ed306d05076ed386
export VAULT=0xa2c5403b08db947544ca2b525218209725f20db785a5760bda178c00b619d640
npx tsx coin_info.t.ts

```


### 编译使用本地库