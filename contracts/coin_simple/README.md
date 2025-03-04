# 依赖
注意以来 coin_manager 发布的package
发布coin_manager 后，需要修改coin_simple的Move.toml
```toml
#TOML
coin_manager = "0x4d1a0f1a85bd04d61afc7435c7461a916a57bc85c4cbae0909769d5e55e2d722"
```
# 编译bytecode ,输出到out.json, 生成发布代币的模版 
```bash
cd contracts/coin_simple
sui move build
./dump.sh
```
# todo 
```
npx tsx web/src/coin_publish/coin_publish.ts
```