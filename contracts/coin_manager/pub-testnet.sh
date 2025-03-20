 # 1. replace 

 PKG=`cat $TOML |grep coin_manager |grep -v '{' |awk -F '"'  '{print $2}' `
 echo "---- 1. before upblished, replace coin_manager  ${PKG}=>0x0 "
 sed -i "s/coin_manager\s*=\s*\"$PKG\"/coin_manager = \"0x0\"/" Move.toml
 cat Move.toml | grep coin_manager

# 2. publish
 echo "---- 2. build and publish"
 sui client publish |tee ./pub-testnet.out
export NEW_PKG=`cat pub-testnet.out |grep -A5 'Published Objects' |grep PackageID | awk -F ' ' '{print $4}'`
 
# 3. assign coin_manage package name 

echo "---- 3. replace coin_manager package address in coin_manager/Move.toml  0x0 => ${NEW_PKG}"
sed -i "s/coin_manager\s*=\s*\"0x0\"/coin_manager = \"$NEW_PKG\"/" Move.toml
cat Move.toml | grep coin_manager


#4. assign coin manager package name in coin_simple
TOML=../coin_simple/Move.toml
PKG=`cat $TOML |grep coin_manager |grep -v '{' |awk -F '"'  '{print $2}' `
echo "---- 4. replace coin_manager package address in  $TOML $PKG => $NEW_PKG"
sed -i "s/coin_manager\s*=\s*\"$PKG\"/coin_manager = \"$NEW_PKG\"/" $TOML
cat $TOML | grep coin_manager