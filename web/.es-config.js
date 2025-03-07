module.exports = {
    rules: {
        // 强制使用 === 和!==，而不是 == 和!=
        'eqeqeq': 'error',
        // 禁止使用 console 语句，用于生产环境代码检查
        'no-console': process.env.NODE_ENV === 'production'? 'error' : 'off',
        // 要求或禁止使用分号而不是 ASI（自动分号插入）
       'semi': ['error','always'],
        // 强制使用骆驼拼写法命名约定
        'camelcase': 'error'
    }
};