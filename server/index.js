const fibonacci = import("./node_modules/@guahuzi/next-fibonacci/wasm_ex.js");

fibonacci.then(fibonacci => {
  const a = fibonacci.get_fibonacci(10)
  console.log(a)
});

