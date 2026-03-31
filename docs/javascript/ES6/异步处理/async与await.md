---
title: async 与 await
createTime: 2026/02/26 18:59:27
permalink: /javascript/jzo2jqhe/
---

`async/await` 是基于 `Promise` 的语法糖，它没有改变异步的本质，只是把链式调用写成了更接近同步流程的形式。

## 为什么有 async / await

`Promise.then(...).then(...).catch(...)` 能解决回调地狱，但链路一长，阅读成本依然不低。

:::table full-width

| 维度 | Promise 链式 | async / await |
| --- | --- | --- |
| 可读性 | 偏函数式，链路长时阅读压力大 | 更接近同步代码结构 |
| 错误处理 | 依赖 `.catch` 或每层处理 | `try/catch` 语义更直观 |
| 并发控制 | 依赖 `all/race/allSettled` 组合 | 仍然依赖 Promise 组合（本质不变） |

:::

## async 的语义

### 1. `async` 函数一定返回 Promise

```js
async function foo() {
  return 123
}

console.log(foo()) // Promise { 123 }
```

### 2. `return` 会变成成功态值

```js
async function getUserId() {
  return 1001
}

getUserId().then((id) => {
  console.log(id) // 1001
})
```

### 3. `throw` 会变成失败态

```js
async function getData() {
  throw new Error('request failed')
}

getData().catch((err) => {
  console.log(err.message) // request failed
})
```

## await 的语义

`await` 的作用是“等待一个 Promise 敲定，然后拿到结果”。

```js
function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

async function run() {
  const v = await delay(500, 'ok')
  console.log(v) // ok
}

run()
```

### `await` 后面如果不是 Promise

会被自动包装为 `Promise.resolve(value)`。

```js
async function demo() {
  const v = await 10
  console.log(v) // 10
}

demo()
```

### 使用范围

- 可以在 `async function` 内部使用
- 在 ESM 环境支持顶层 `await`（Top-level Await）

## 执行顺序（核心理解）

`await` 会把后续代码挂起，等 Promise 敲定后把后续逻辑放入微任务继续执行。

```js
async function demo() {
  console.log('A')
  await Promise.resolve()
  console.log('B')
}

console.log('start')
demo()
console.log('end')
```

```text
start
A
end
B
```

## 错误处理

### 1. 用 `try/catch` 捕获 `await` 抛出的错误

```js
async function requestUser() {
  return Promise.reject(new Error('network error'))
}

async function main() {
  try {
    const user = await requestUser()
    console.log(user)
  }
  catch (err) {
    console.log('捕获失败:', err.message)
  }
}

main()
```

### 2. 多个 `await`，希望“失败不中断”

:::code-tabs

@tab 分开 try/catch

```js
async function readAll() {
  let a
  let b

  try {
    a = await Promise.resolve('A')
  }
  catch (err) {
    console.error('a failed', err)
  }

  try {
    b = await Promise.reject(new Error('B failed'))
  }
  catch (err) {
    console.error('b failed', err.message)
  }

  return { a, b }
}
```

@tab allSettled

```js
async function readAll() {
  const [a, b] = await Promise.allSettled([
    Promise.resolve('A'),
    Promise.reject(new Error('B failed')),
  ])

  return { a, b }
}
```

:::

## 串行与并行

这部分是 `async/await` 最容易写错的点：`await` 写法看起来简单，但可能无意中把并发写成串行。

### 串行（一个接一个）

```js
async function serial() {
  const a = await fetch('/api/a').then(r => r.json())
  const b = await fetch('/api/b').then(r => r.json())
  return { a, b }
}
```

### 并行（同时发起）

```js
async function parallel() {
  const [a, b] = await Promise.all([
    fetch('/api/a').then(r => r.json()),
    fetch('/api/b').then(r => r.json()),
  ])

  return { a, b }
}
```

> [!IMPORTANT]
> `forEach` 不能等待 `await`，遍历异步任务时优先使用 `for...of` 或 `Promise.all(arr.map(...))`。

## 与 Promise 的关系

`async/await` 并不是替代 Promise，而是 Promise 的“更易读写法”：

1. 底层依然是 Promise 状态流转
2. 并发、竞速、容错仍然依赖 `Promise.all/race/allSettled/any`
3. `await` 只是把 `.then` 的结果提取写法改得更像同步

## 章节小结

- `async`：保证函数返回 Promise
- `await`：等待 Promise 结果，后续逻辑进入微任务
- 错误处理优先 `try/catch`
- 需要并发时记得使用 `Promise.all`，避免误写成串行
