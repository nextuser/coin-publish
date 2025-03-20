replace_package_address() {
    toml="$1"
    newpkg="$2"
    #echo "$toml"
    #echo "$newpkg"
    #[addresses] 后面20行
    oldpkg=`cat $toml |  grep -A20 '\[addresses\]' |grep coin_manager | awk -F '"' '{print $2}'`
    #/echo "oldpkg=$oldpkg"
    # 打印替换信息
    echo "----  replace coin_manager package address in  $toml $oldpkg => $newpkg"
    # 使用 sed 命令进行替换
    sed -i "s/coin_manager\s*=\s*\"$oldpkg\"/coin_manager = \"$newpkg\"/" $toml
    # 打印修改后的 toml 文件中包含 coin_manager 的行
    cat $toml | grep -A20 '\[addresses\]' | grep coin_manager
}




# 1. 调用函数
replace_package_address "./Move.toml"  "0x0"
# 2.publish
echo "---- build and publish"
sui client publish |tee ./pub-testnet.out
export NEW_PKG=`cat pub-testnet.out |grep -A5 'Published Objects' |grep PackageID | awk -F ' ' '{print $4}'`

# 3. Move.toml
replace_package_address "./Move.toml"  $NEW_PKG

# 4.
replace_package_address "../coin_simple/Move.toml"  $NEW_PKG