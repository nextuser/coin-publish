是的，可以通过浏览器中的脚本下载 WebAssembly (WASM) 文件并执行它。以下是一个简单的示例，展示如何通过 JavaScript 下载并执行 WASM 文件。

1. 下载 WASM 文件
你可以使用 fetch API 来下载 WASM 文件。

2. 编译并实例化 WASM 模块
使用 WebAssembly.compile 和 WebAssembly.instantiate 来编译和实例化 WASM 模块。
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WASM Example</title>
</head>
<body>
    <script>
        // WASM 文件的 URL
        const wasmUrl = 'path/to/your/module.wasm';

        // 下载并执行 WASM 文件
        async function loadAndRunWasm() {
            try {
                // 下载 WASM 文件
                const response = await fetch(wasmUrl);
                const buffer = await response.arrayBuffer();

                // 编译 WASM 模块
                const module = await WebAssembly.compile(buffer);

                // 实例化 WASM 模块
                const instance = await WebAssembly.instantiate(module);

                // 调用 WASM 模块中的函数（假设 WASM 模块中有一个名为 'add' 的函数）
                if (instance.exports.add) {
                    const result = instance.exports.add(2, 3);
                    console.log('WASM add function result:', result);
                } else {
                    console.error('WASM module does not export an "add" function.');
                }
            } catch (error) {
                console.error('Error loading or running WASM:', error);
            }
        }

        // 调用函数来加载并运行 WASM
        loadAndRunWasm();
    </script>
</body>
</html>

```


注意事项
跨域问题: 如果 WASM 文件位于不同的域，确保服务器配置了正确的 CORS 头。

浏览器支持: 现代浏览器都支持 WebAssembly，但如果你需要支持非常旧的浏览器，可能需要检测 WebAssembly 的支持情况。

检测 WebAssembly 支持
你可以通过以下代码检测浏览器是否支持 WebAssembly：