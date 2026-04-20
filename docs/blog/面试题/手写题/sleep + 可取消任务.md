---
title: sleep + 可取消任务
createTime: 2026/04/20 22:35:47
permalink: /blog/lsjskga0/
tags:
  - 手写题
---

:::details 面试题

实现 `sleep(ms)`，并进一步实现一个可取消的异步任务

:::

## 面试官视角

这题会从简单 Promise 追问到任务控制：

1. `sleep` 是否返回 Promise
2. 定时器结束后是否正确 `resolve`
3. 取消时是否清理定时器
4. 取消后 Promise 应该进入什么状态
5. 能否结合 `AbortController` 设计更通用的取消机制

## sleep 基础实现

```js
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
```

使用：

```js
async function run() {
  console.log('start')
  await sleep(1000)
  console.log('after 1s')
}
```

## 可取消 sleep

### 核心思路

普通 Promise 本身不能被取消，所以"取消"通常是我们自己设计的协议：

- 暴露一个 `cancel` 方法
- `cancel` 时清理定时器
- 让 Promise 进入 rejected 状态，告诉调用方任务被取消

::::steps

1. 在闭包中保存 `timer`
2. Promise 内部开启定时器
3. 定时器到期时 `resolve`
4. `cancel` 时 `clearTimeout(timer)`
5. `cancel` 后调用 `reject`，让调用方可以捕获取消错误

::::

```js
function cancelableSleep(ms) {
  let timer = null
  let rejectFn = null
  let settled = false

  const promise = new Promise((resolve, reject) => {
    rejectFn = reject

    timer = setTimeout(() => {
      settled = true
      timer = null
      resolve()
    }, ms)
  })

  function cancel(reason = 'Task canceled') {
    if (settled) {
      return
    }

    settled = true

    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    rejectFn(new Error(reason))
  }

  return {
    promise,
    cancel
  }
}
```

使用：

```js
const task = cancelableSleep(3000)

task.promise
  .then(() => console.log('done'))
  .catch((error) => console.log(error.message))

setTimeout(() => {
  task.cancel()
}, 1000)
```

## AbortController 版本

浏览器和 Node 现代 API 更推荐 `AbortController`，因为它是通用取消协议，`fetch` 也支持

```js
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Task canceled'))
      return
    }

    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    function onAbort() {
      clearTimeout(timer)
      cleanup()
      reject(new Error('Task canceled'))
    }

    function cleanup() {
      signal?.removeEventListener('abort', onAbort)
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
```

使用：

```js
const controller = new AbortController()

sleep(3000, controller.signal)
  .then(() => console.log('done'))
  .catch((error) => console.log(error.message))

setTimeout(() => {
  controller.abort()
}, 1000)
```

## 封装可取消任务

如果任务不是单纯的定时器，而是任意异步函数，可以统一传入 `signal`

```js
function createCancelableTask(task) {
  const controller = new AbortController()

  return {
    run() {
      return task(controller.signal)
    },
    cancel() {
      controller.abort()
    }
  }
}
```

示例：

```js
const task = createCancelableTask(async (signal) => {
  await sleep(1000, signal)
  console.log('step 1')

  await sleep(1000, signal)
  console.log('step 2')

  return 'done'
})

task.run().catch((error) => {
  console.log(error.message)
})

setTimeout(() => {
  task.cancel()
}, 1500)
```

## 面试回答模板

`sleep` 本质是返回一个 Promise，并在 `setTimeout` 到期后 resolve。Promise 本身没有标准取消能力，所以可取消任务一般要额外设计取消协议：要么返回 `{ promise, cancel }`，取消时清理定时器并 reject；要么使用标准的 `AbortController`，通过 `signal` 把取消信号传给任务内部，每一步异步操作都监听这个信号

## 易错点

1. 取消时必须 `clearTimeout`，否则定时器仍然会执行
2. Promise 一旦 fulfilled 或 rejected，状态不能再改变，所以要用 `settled` 防止重复取消
3. 可取消任务不是强行中断 JS 执行，而是在异步边界主动检查或监听取消信号
4. `AbortController` 更通用，能和 `fetch` 等 Web API 配合
