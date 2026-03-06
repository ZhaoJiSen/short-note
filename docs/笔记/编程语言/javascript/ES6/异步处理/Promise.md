---
title: Promise
createTime: 2026/02/28 10:47:51
permalink: /javascript/32x2g3bg/
---

Promise 是 ES6 提供的异步编排方案，核心目标是解决回调地狱，让异步流程具备更好的可读性、可维护性和错误传播能力

## 为什么需要 Promise

当异步任务出现嵌套时，代码会快速失控：

```js
setTimeout(() => {
  console.log(1)
  setTimeout(() => {
    console.log(2)
    setTimeout(() => {
      console.log(3)
    }, 1000)
  }, 1000)
}, 1000)
```

Promise 的价值是把“异步结果”抽象成一个对象，再通过链式调用来组织流程。

## 基本使用

一个 Promise 只有两个阶段，三种状态。状态一旦从 `pending` 变成 `fulfilled/rejected`，便不再可逆

::::details 两个阶段，三种状态

:::table full-width

| 阶段 | 状态 | 含义 | 是否终态 |
| --- | --- | --- | --- |
| 未决（unsettled） | `pending` | 进行中 | 否 |
| 已决（settled） | `fulfilled` | 已成功 | 是 |
| 已决（settled） | `rejected` | 已失败 | 是 |

:::

::::

通过 `new Promise` 可以建一个 Promise，该构造函数接收一个执行器函数 `executor`，该函数会立即执行

```js
new Promise(() => {
  console.log('executor 立即执行')
})

console.log('外部代码')
```

执行器函数接收两个参数：`resolve` 和 `reject`，分别用于把状态变为 `fulfilled` 和 `rejected`

```js
new Promise((resolve, reject) => {
  resolve('ok')
  reject('no')
})
```

### 状态固化

一旦状态固化，后续再调用 `resolve/reject` 都无效；但函数后续代码仍然会继续执行

```js
new Promise((resolve, reject) => {
  resolve('ok')
  reject('no') // 无效
  console.log('这行仍会执行')
}).then((v) => {
  console.log(v) // ok
})
```

> [!NOTE]
> 且如果在 `resolve/reject` 之后再抛异常，这个异常通常不会再改变当前 Promise 的最终状态

### then

调用 `then` 每次都会返回一个新的 Promise，因此可以链式调用。该函数接收两个参数：`onFulfilled` 和 `onRejected`，分别用于处理 `fulfilled` 和 `rejected` 状态

:::table full-width

| `then` 回调返回值 | 下一个 Promise 状态 |
| --- | --- |
| 普通值 | `fulfilled(该值)` |
| 抛异常 | `rejected(异常)` |
| Promise | 跟随该 Promise 的最终状态 |

:::

```js
const promise = new Promise((resolve, reject) => {
  console.log('executor 立即执行')
  const duration = Math.random() * 1000
  
  setTimeout(() => {
    if (Math.random() < 0.5) {
      resolve('success')
    } else {
      reject(new Error('fail'))
    }
  }, duration)
})

promise.then(
  (data) => {
    console.log('success:', data)
  }, (error) => {
    console.log('fail:', error.message)
  })
```

:::details 执行链式调用的原因

`then` 方法是在 `Promise.prototype` 上定义的。由于 `.then()` 会返回一个新的任务对象所以自然可以继续调用

```js
let promise = new Promise((resolve, reject) => {
    resolve(1);
});

const promise1 = promise
    .then((res) => {
        console.log(res);
        return new Promise((resolve, reject) => {
            resolve('newPromise ok');
        });
    })
    .catch((err) => {
        console.log(reason);
        return '出错了';
    });

// 第二次链式调用无法像第一次调用时直接拿到值，而是需要在上面手动添加 return
const promise2 = promise1
    .then((res) => {
        console.log('ok then2:' + res);
    })
    .catch((err) => {
        console.log('no then2:' + err);
    });
```

:::

### 错误传播

`catch` 本质是 `then(undefined, onRejected)`，错误会沿链路冒泡直到被捕获

```js
Promise.resolve()
  .then(() => {
    throw new Error('boom')
  })
  .then(() => {
    console.log('不会执行')
  })
  .catch((err) => {
    console.log('捕获到错误:', err.message)
  })
```

### 参数缺省透传

当 `then()` 不传处理函数时，该层会被 "忽略"，值或错误会继续向后传递

```js
Promise.resolve('hello')
  .then()
  .then((v) => {
    console.log(v) // hello
  })

Promise.reject(new Error('x'))
  .then()
  .catch((err) => {
    console.log(err.message) // x
  })
```

## 状态依赖

如果 `resolve` 的是另一个 Promise，当前 Promise 会 "等待并跟随" 它的状态

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error('fail')), 1000)
})

const p2 = new Promise((resolve) => {
  setTimeout(() => resolve(p1), 500)
})

p2.catch((err) => {
  console.log('p2 最终失败原因:', err.message)
})
```
