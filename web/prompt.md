提供界面实现三个界面
# 界面一. 列出平台发布的sui链上的coin.
1.通过查询消息pkg::coin_manager::CoinCreatedEvent ,获得对象
2.根据对象id,查询到coin对应的meta data:, 显示创建者 
3. 界面平铺分页显示 coin ,包括coin的图标 , 描述, 名字 ,symbol, 创建者地址的缩略显示.
4. 在sui列表查看,点击代币图标,跳转到coin信息页面



## 界面二 显示界面信息
1.coin页面中显示coin的交易k线, 可以选择周期 1分钟 5分钟 30分钟  1小时 1天 5天.
2.coin信息页面右边提供 buy和sell 两个tab page. 用户在buy page可以输入 sui数目来购买coin.输入框下面有便捷按钮 reset 0.1 SUI, 0.5SUI 1 SUI
3.coin信息页面右边的sell tab page,可以卖出coin. 输入框下面有便捷按钮 reset 25%  50% 70% 100%
4.右边列出 持有coin 数目最多的20个用户.

## 界面三 如果用户已经用sui钱包登录,提供创建coin的入口.

可以输入name, symbol ,description  , image, 点击create按钮调用合约方法创建coin



