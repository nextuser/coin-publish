import {initSync} from '@guahuzi/next-fibonacci';
//import fibonacci   from '@guahuzi/next-fibonacci';
//import url from '@guahuzi/next-fibonacci/wasm_ex_bg.wasm'
async function run() {
  let fb = initSync(""); // 初始化 Wasm 模块
  const result = fb.get_fibonacci(10); // 调用 Wasm 函数
  console.log('Fibonacci result:', result);
}

run();
