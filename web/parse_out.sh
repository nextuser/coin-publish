export  COIN_MANAGER=`cat ../contracts/coin_manager/pub-testnet.out |grep -B5 coin_manager::Manager |grep ObjectID | awk -F ' ' '{print $4}' `
export  COIN_MANAGER_PACKAGE=`cat ../contracts/coin_manager/pub-testnet.out |grep coin_manager::Manager |awk -F ' ' '{print $4}' | awk -F ':' '{print $1}' `
export  OPERATOR=`cat ../contracts/coin_manager/pub-testnet.out |grep -B5 coin_manager::Manager |grep Sender |awk -F ' ' '{print $4}'`
npx tsx ./lib/saveEnv.ts
cat ./lib/suiConfig.json

