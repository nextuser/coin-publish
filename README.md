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
│  │ PackageID: 0x97341e2e846213ceff1ca278364a2eea6af6b55d4215e730354eff31696ceecc                          │
│  │ Version: 1                                                                                             │
│  │ Digest: 7fEvDcr1eUfBu2y8VFJ4wU1hxMF3npqjL199NPbnhYrh                                                   │
│  │ Modules: coin_manager, inflat_supply, limit_supply, lock    
```


##  coin_simpole
修改 contracts/coin_manager/Move.toml
```toml
coin_manager = "0x97341e2e846213ceff1ca278364a2eea6af6b55d4215e730354eff31696ceecc"
```

修改 contracts/coin_simple/Move.toml
```toml
coin_manager = "0x97341e2e846213ceff1ca278364a2eea6af6b55d4215e730354eff31696ceecc"
```

## 本地测试发币
```
export TEST=1
npx tsx server/src/publishCoin.ts
```


### 测试新发布coin
```
export TEST=1
npx tsx ./publishCoin.ts
```

### 客户端访问 coin 的相关购买数, 
```bash
 export COIN_MANAGER_PACKAGE_ID=0x97341e2e846213ceff1ca278364a2eea6af6b55d4215e730354eff31696ceecc
```