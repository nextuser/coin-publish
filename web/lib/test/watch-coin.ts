import { JsonRpcProvider, Connection, SuiEventFilter } from '@mysten/sui.js';

// 配置Sui主网或测试网的WebSocket连接
const connection = new Connection({
  fullnode: 'https://fullnode.mainnet.sui.io', // HTTP RPC（仅用于初始化）
  websocket: 'wss://rpc.mainnet.sui.io/websocket', // WebSocket端点
});

const provider = new JsonRpcProvider(connection);

// 假设我们要监听的CoinType是 "0x...::c1::C1"，需要替换为实际的类型
const TARGET_COIN_TYPE = '0x...::c1::C1'; // 请替换为真实的CoinType

// 定义事件过滤器，监听CoinBalanceChange事件
const eventFilter: SuiEventFilter = {
  MoveEventType: '0x2::coin::CoinBalanceChange', // Sui标准代币余额变化事件
};

// 订阅事件并处理
async function subscribeToCoinTransfers() {
  try {
    console.log(`开始监听CoinType为 ${TARGET_COIN_TYPE} 的转账事件...`);

    const unsubscribe = await provider.subscribeEvent({
      filter: eventFilter,
      onMessage(event) {
        // 检查事件类型并提取数据
        if (event.type === '0x2::coin::CoinBalanceChange') {
          const coinType = event.parsedJson?.coin_type;
          const amount = event.parsedJson?.amount;
          const owner = event.parsedJson?.owner?.AddressOwner || event.parsedJson?.owner;
          const txDigest = event.transactionDigest;

          // 过滤出目标CoinType的事件
          if (coinType === TARGET_COIN_TYPE) {
            console.log(`检测到 ${TARGET_COIN_TYPE} 转账事件:`);
            console.log(`- 交易Digest: ${txDigest}`);
            console.log(`- 金额: ${amount}`);
            console.log(`- 接收者: ${owner}`);
            console.log('-------------------');
          }
        }
      },
    });

    // 当WebSocket连接打开时打印日志
    provider.connection.websocketClient.on('open', () => {
      console.log('WebSocket连接已建立');
    });

    // 处理错误
    provider.connection.websocketClient.on('error', (error) => {
      console.error('WebSocket错误:', error);
    });

    // 可选：取消订阅
    // setTimeout(() => unsubscribe(), 60000); // 60秒后取消订阅
  } catch (error) {
    console.error('订阅事件失败:', error);
  }
}

// 运行监听
subscribeToCoinTransfers();