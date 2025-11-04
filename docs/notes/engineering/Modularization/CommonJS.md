---
title: CommonJS
createTime: 2025/11/04 22:18:12
permalink: /engineering/8hn64fr6/
---



## CommonJS

CommonJS 属于 Node 模块化规范，在 Node 中，每个文件就是一个模块，模块之间通过 `require` 和 `module.exports` 进行导入和导出。每个文件之间都是相互隔离的，因此不会产生全局变量污染的问题


需要注意的是，在 CommonJS 中，导入模块时，路径名称必须使用相对路径


::: code-tabs
@tab index.js
```js
const { isOdd, sum} = require("./math")

// 启动文件
console.log(isOdd(2));
console.log(sum(12, 1))
 
```

@tab math.js
```js
const isOdd = (num) => {
  return num % 2 === 0;
}


const sum = (a, b) => {
  return a + b;
}

module.exports = {
  isOdd,
  sum
}

```
:::


当运行 `require` 函数时，将会找到目标模块，然后目标模块会自上而下执行，直到遇到 `module.exports` 或 `exports` 导出模块内容为止，然后将导出的内容返回给导入者。


需要注意的是，`require` 函数会缓存导入的模块，之后再使用该模块直接使用缓存结果

`exports` 函数相当于是 `module.exports` 的语法糖，可以等价于：`const exports = modules.exports`

```js
exports.a = 123;
```
