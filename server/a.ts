import {initSync} from '@guahuzi/next-fibonacci/wasm_ex';
//import {initSync} from '@mysten/move-bytecode-template'
//import fibonacci   from '@guahuzi/next-fibonacci';
//import url from '@guahuzi/next-fibonacci/wasm_ex_bg.wasm'
async function run() {
  let tp = initSync(""); // 初始化 Wasm 模块
  const result = tp.deserialize();
  console.log('Fibonacci result:', result);
}

run();
