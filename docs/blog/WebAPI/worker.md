---
title: Web Worker
createTime: 2026/02/09 22:12:46
permalink: /blog/iqa10nnl/
tags:
  - WebAPI
---

Web Worker 是浏览器提供的多线程解决方案，可以让 JavaScript 在后台线程中执行，避免阻塞主线程

:::details 注意事项

1. Web Worker 不能使用本地文件，必须是网络上的同源文件
2. 不能使用 windows 上的 DOM 操作，也不能获取 DOM 对象
3. 方法、DOM 节点、对象中的特殊设置（ getter、setter ）等无法进行传递
:::

## 基本使用

在主线程中使用 `Worker` 构造函数创建一个 `worker` 对象，然后 通过 `onmessage` 监听 `worker` 中的消息

```ts
const worker = new Worker('work.js');

worker.onmessage = e => {
  console.log(e.data)
}
```

在 `worker` 中，存在一个全局变量 self ，通过 self 中的 `postMessage` 方法来与主线程进行通信

```ts
self.postMessage('worker' + result)
```

## 模块引入问题

在 `worker` 中如果需要引入另一个模块的内容，需要使用 `importScripts` 方法，==该方法允许跨域引入模块=={.important}

:::code-tabs

@tab worker.js

```js
importScripts('utils.js')
```

@tab utils.js

```js
export const utils = {
  add: (a, b) => a + b
}
```

@tab index.js

```js
const workder = new Worker('worker.js', {
  type: 'module'
});
```

:::

:::table full-width

| 选项 | 含义 |
| --- | --- |
| `type` | 表示使用 ES 模块语法 |
| `classic` | 表示使用 CommonJS 模块语法 |

:::
