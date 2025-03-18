export OBJECT_LINE=` cat ./pub-testnet.out |grep -B 4 "ObjectType: 0x2::package::UpgradeCap" |grep ObjectID`
export UPGRADE_CAP=`echo $OBJECT_LINE |awk -F ' ' '{ print $4}' `
echo "UPGRADE_CAP=$UPGRADE_CAP"
export PKG=`cat ./pub-testnet.out |grep 'coin_manager::Manager' | awk -F '::' '{print $1}' | awk -F ' ' '{print $4} '`
echo "PKG=$PKG"
sed -i "s/coin_manager\s*=\s*\"$PKG\"/coin_manager = \"0x0\"/" Move.toml

sui client upgrade  --upgrade-capability $UPGRADE_CAP  |tee upgrade-testnet.out

