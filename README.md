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
Created Objects:                                                                                         │
│  ┌──                                                                                                     │
│  │ ObjectID: 0x19dba2646a91fb72191dcefb6d5d1ec5068cef3546f17ac566888f2531140eb0                          │
│  │ Sender: 0xf7ec2215e565b7a18d7b00e70fccda74b30c3ecceffb5857b1b3d2249e28e94f                            │
│  │ Owner: Shared( 374432851 )                                                                            │
│  │ ObjectType: 0xb59f793456c489da23bcd42b4d6c5f033cc81205a34d1cc08affbfc704e3e57::coin_manager::Manager  │
│  │ Version: 374432851                                                                                    │
│  │ Digest: HqXZJhCLtaB99CChGCEg5y43dbEpxE5eTAXXCrgH4qKs                                                  │
│  └──                                                                                                     │
│  ┌──                                                                                                     │
│  │ ObjectID: 0xaea185d8a47cdc7b27a5425056389eea89f7d9d12e59a885a7da8d2df20dc4eb                          │
│  │ Sender: 0xf7ec2215e565b7a18d7b00e70fccda74b30c3ecceffb5857b1b3d2249e28e94f                            │
│  │ Owner: Account Address ( 0xf7ec2215e565b7a18d7b00e70fccda74b30c3ecceffb5857b1b3d2249e28e94f )         │
│  │ ObjectType: 0x2::package::UpgradeCap                                                                  │
│  │ Version: 374432851                                                                                    │
│  │ Digest: 8KRLpDLqHWb4SzSMCvjvyfqAvuejX3BBBtaMvh6wEBEj                                                  │
│  └──                                                          
```


##  coin_simpole
修改 contracts/coin_manager/Move.toml
```toml
coin_manager = "0x0b59f793456c489da23bcd42b4d6c5f033cc81205a34d1cc08affbfc704e3e57"
```

修改 contracts/coin_simple/Move.toml
```toml
coin_manager = "0x0b59f793456c489da23bcd42b4d6c5f033cc81205a34d1cc08affbfc704e3e57"
```

### 单元测试
```bash
cd contracts/coin_simple
sui move build
sui move test
# 将发币模版bytecode拷贝到 ../web/lib/out.json
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
export COIN_MANAGER_PACKAGE=`cat ../../../contracts/coin_manager/Move.toml |grep -v '#' |grep "^coin_manager" | awk -F '"' '{print($2)}'`
echo $COIN_MANAGER_PACKAGE
./1.pub.sh
source ./2.parse_out.sh 
```

## 定义operator和 blockvision apikey
```bash
export OPERATOR=...
export BV_API_KEY='...'

```
## 测试buy and sell
```bash
npx tsx 3.coin_buy_sell.t.ts
```

## 查询events
```bash
npx tsx  4.query-coin.ts 
```

##  测试一个币的前20 个拥有者
```bash
npx tsx coin_owner.t.ts
```

# 网页使用
## 安装和构建
```bash
cd web
pnpm install
pnpm build
```
## 环境变量
```
cd web
cp env.sample .env

```

### 编译使用本地库