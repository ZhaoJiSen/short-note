---
title: CommonJS
createTime: 2026/02/27 23:53:41
permalink: /modularization/d12bafr7/
---

CommonJS 属于 Node 模块化规范，在 Node 中，每个文件就是一个模块，模块之间通过 `require` 和 `module.exports` 进行导入和导出。每个文件之间都是相互隔离的，因此不会产生全局变量污染的问题

需要注意的是，在 CommonJS 中，导入模块时，路径名称必须使用相对路径

### 模块

在 CommonJS 中，一个模块指的就是一个 JS 文件，它实现了一部分功能，并隐藏自己的内部实现，同时对外界提供了一些接口供其他模块使用

```js
// 要隐藏的内部实现
let count = 0;

// 要暴露给外部的接口
const plusOne = () => {
  return count++;
}
```

> [!IMPORTANT]
> 模块有两个核心要素：隐藏[+隐藏] 和 暴露[+暴露]。任何一个正常的模块化标准，都应该默认隐藏模块中的实现 <br/><br/>
>
> 通过语法或对外暴露 API 来暴露接口，==暴露接口的过程即模块导出==。与之对应的，==当通过某种语法或对外暴露的 API 去使用一个模块时，这个过程就叫做模块的导入==

### CommonJS 规范

CommonJS 使用 `exports` 导出模块，使用 `require` 导入模块

::: details 规范详情：

1. 如果一个 JS 文件内，存在 `exports` 或 `require` 则该文件是一个模块
2. 模块内的代码均为内部隐藏代码，这些内容均不应该对全局变量造成任何污染
3. 如果一个模块需要暴露一些 API 提供给外部使用，需要通过 `exports` 导出，`exports` 是一个空对象，可以为该对象添加任何需要导出的内容
4. 如果一个模块需要导入其他模块，通过 `require` 实现，`require` 是一个函数，传入模块==相对路径== 即可返回该模块导出的整个内容
:::

为了实现 CommonJS 规范，NodeJS 对模块作出了如下处理：

1. 为保证执行效率，NodeJS 仅加载必要的模块，只有执行到 `require` 函数时才会加载并执行模块，这也被称为：==依赖延迟声明==
2. 为保证避免污染全局变量，NodeJS 执行模块时，会将模块中的所有代码放入 IIFE
3. 为保证顺利导出模块内容，NodeJS 会在模块开始执行前，初始化 `module.exports = {}`
4. 为方便开发者便捷导出内容，初始化 `module.exports` 后会额外声明 `exports = module.exports`
5. 为避免反复加载统一个模块，NodeJS 默认开启了模块缓存

> [!IMPORTANT]
> 最终在 IIFE 中返回的是 `module.exports`

---

思考一下，最终在 `index.js` 中输出的结果是多少。答案 [+答案]

::: code-tabs
@tab utils.js

```js
let count = 0;

module.exports = {
  getNumber: () => {
    return count++
  },
  foo: 123
}

exports.bar = 456
```

@tab index.js

```js
const util = require("./util");

console.log(util.bar);
```

:::

[+隐藏]: 隐藏的是自己内部的实现
[+暴露]: 暴露的是希望外部使用的接口
[+答案]:
  在 CommonJS 中，`module.exports` 才是模块最终导出的对象，而 `exports` 只是对 `module.exports` 的一个引用。也就是说，`exports` 和 `module.exports` 在最初是指向同一个对象的。

  当我们执行 `module.exports = {...}` 时，相当于让 `module.exports` 指向了一个全新的对象。这一操作会导致 `exports` 与 `module.exports` 之间原本共享的引用关系被打断：`module.exports` 指向了新对象，而 `exports` 仍旧停留在旧对象上。

  因此，如果在重新赋值 `module.exports` 之后再通过 `exports.xxx = ...` 的方式添加属性，那么这些属性实际上被加在旧对象上，而不是最终会被导出的新对象上。最终，模块的导出结果只取决于 `module.exports` 的值，而不会包含添加到 `exports` 上的属性。

  因此在代码中，`bar` 是被添加在已经失效的 `exports` 对象上，最终导出的对象中并不包含 `bar`，导致访问 `util.bar` 时得到 `undefined`。

## 练习

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
