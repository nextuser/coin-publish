 PKG=`cat Move.toml |grep ^coin_manager |awk -F '"'  '{print $2}' `
 sed -i "s/coin_manager\s*=\s*\"$PKG\"/coin_manager = \"0x0\"/" Move.toml
 cat Move.toml | grep coin_manager
 sui client publish |tee ./pub-testnet.out