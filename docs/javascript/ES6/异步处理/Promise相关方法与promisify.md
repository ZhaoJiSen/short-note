---
title: Promise 相关方法与 promisify
createTime: 2026/02/28 13:59:00
permalink: /javascript/p2u6b7qk/
---

## Promise 静态方法

:::table full-width

| 方法 | 行为 |
| --- | --- |
| `Promise.resolve(value)` | 返回成功 Promise；若 `value` 是 Promise/thenable，会做同化 |
| `Promise.reject(reason)` | 返回失败 Promise |
| `Promise.all(iterable)` | 全部成功才成功；任一失败立刻失败 |
| `Promise.race(iterable)` | 谁先敲定（成功或失败）就跟谁 |
| `Promise.any(iterable)` | 任一成功即成功；全部失败才失败 |
| `Promise.allSettled(iterable)` | 全部敲定后成功，返回每项状态结果 |

:::

### Promise.all

```js
Promise.all([
  Promise.resolve('A'),
  Promise.resolve('B'),
  Promise.resolve('C'),
]).then((res) => {
  console.log(res) // ['A', 'B', 'C']
})
```

### Promise.race

```js
const p1 = new Promise(resolve => setTimeout(() => resolve('slow'), 2000))
const p2 = new Promise(resolve => setTimeout(() => resolve('fast'), 500))

Promise.race([p1, p2]).then((res) => {
  console.log(res) // fast
})
```

### Promise.any

```js
Promise.any([
  Promise.reject('e1'),
  Promise.resolve('ok'),
  Promise.reject('e2'),
]).then((res) => {
  console.log(res) // ok
})
```

### Promise.allSettled

```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('x'),
]).then((res) => {
  console.log(res)
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'x' }
  // ]
})
```

## Promise.resolve 与 thenable

`Promise.resolve` 会把带有 `then` 方法的对象当作 thenable 处理。

```js
const thenable = {
  then(resolve) {
    resolve(42)
  },
}

Promise.resolve(thenable).then((v) => {
  console.log(v) // 42
})
```

## 自定义 promisify

在 Node 中，经常把“错误优先回调”函数转换为 Promise 风格。

:::code-tabs

@tab 自定义 promisify

```js
function promisify(fn) {
  return (...args) => new Promise((resolve, reject) => {
    fn(...args, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}
```

@tab 使用示例（fs.readFile）

```js
const fs = require('node:fs')
const readFileAsync = promisify(fs.readFile)

readFileAsync('./name.txt', 'utf-8')
  .then(data => readFileAsync(data, 'utf-8'))
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

@tab Node 内置 util.promisify

```js
const fs = require('node:fs')
const { promisify } = require('node:util')

const readFileAsync = promisify(fs.readFile)
```

:::

## 自定义 promisifyAll

```js
function promisify(fn) {
  return (...args) => new Promise((resolve, reject) => {
    fn(...args, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

function promisifyAll(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'function') {
      obj[`${key}Async`] = promisify(value)
    }
  })
  return obj
}
```
