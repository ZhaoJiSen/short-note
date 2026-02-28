---
title: 手写 Promise
createTime: 2026/02/26 21:56:55
permalink: /javascript/v6d16zmc/
---

:::::steps

1. 实现状态的变化

   :::table full-width

   | 要点 | 说明 |
   | --- | --- |
   | Promise 构造器的创建 | `Promise` 是构造器，通过 `new` 创建；接受一个任务执行器函数，该函数**立即执行** |
   | 任务执行器 | 接收 `resolve` 和 `reject` 两个回调，分别标记任务完成/失败并传递数据 |
   | 状态管理 | 三种状态 `pending` → `fulfilled` / `rejected`；每个实例维护 `state` 和 `value` |
   | 改变状态 | `changeState(newState, value)` 迁移状态并更新数据 |
   | 状态不可逆 | 只有 `pending` 才能改状态，确保一旦确定便不再改变 |
   | 错误处理 | `executor` 同步抛错时 `try-catch` 捕获，自动调用 `reject` |

   :::

   ::::details 逐步解析

   **Promise 构造器的创建**

   1. `Promise` 是一个构造器，通过 `new` 关键字和构造器函数来创建
   2. 构造器函数接受一个参数，该参数是一个表示任务执行过程的函数
   3. 该函数立即执行，描述任务的执行过程

   **任务执行器的立即执行**

   1. 任务执行器函数接受两个参数：`resolve` 和 `reject`
   2. `resolve` 函数用于标记任务完成，并可选地传递任务完成的相关数据
   3. `reject` 函数用于标记任务失败，并可选地传递任务失败的相关数据

   **Promise 的状态管理**

   1. Promise 有三种状态：`pending`（等待中）、`fulfilled`（已完成）、`rejected`（已拒绝）
   2. 每个 Promise 对象包含状态（`state`）和数据（`value`）属性
   3. 状态改变时，数据也会相应地更新

   **改变状态的方法**

   1. `changeState` 方法接受新状态和新数据作为参数
   2. 新状态可以是 `fulfilled` 或 `rejected`
   3. 新数据可以是任务完成的结果或失败的原因

   **状态改变的判断**

   1. 在改变状态之前，需要判断当前状态是否为 `pending`
   2. 如果当前状态不是 `pending`，则不进行状态改变
   3. 这确保了 Promise 的状态一旦确定，就不会再改变

   **错误处理**

   1. 在任务执行过程中，如果发生错误，Promise 的状态将自动变为 `rejected`
   2. 通过 `try-catch` 语句捕获错误，并调用 `reject` 函数传递错误对象
   3. 这确保了错误能够被正确处理，并更新了 Promise 的状态

   ::::

   :::info 为什么 `executor(this._resolve.bind(this), this._reject.bind(this))` 要 `bind(this)`？

   `executor` 会把 `resolve/reject` 当普通函数调用，默认丢失实例上下文。因此如果不显示进行 `bind` 会导致，`_resolve/_reject` 内部的 `this._state`、`this._changeState` 访问会出错。

   :::

   ```js
   class MyPromise {
     /**
      * 任务状态
      */
     static PENDING = 'pending'
     static FULFILLED = 'fulfilled'
     static REJECTED = 'rejected'

     /**
      * 创建 Promise
      * @param {Function} executor 任务执行器（立即执行）
      */
     constructor(executor) {
       // 每个 Promise 维护自己的状态和值
       this._state = MyPromise.PENDING
       this._value = null

       try {
         // 这里必须绑定 this，避免 resolve/reject 调用时丢失上下文
         executor(this._resolve.bind(this), this._reject.bind(this))
       }
       catch (error) {
         // executor 同步抛错，直接把任务变成 rejected
         this._reject(error)
       }
     }

     /**
      * 标记任务完成
      * @param {any} value
      */
     _resolve(value) {
       // 只有 pending 才允许状态迁移
       if (this._state !== MyPromise.PENDING)
         return

       this._changeState(MyPromise.FULFILLED, value)
     }

     /**
      * 标记任务失败
      * @param {any} reason
      */
     _reject(reason) {
       if (this._state !== MyPromise.PENDING)
         return

       this._changeState(MyPromise.REJECTED, reason)
     }

     /**
      * 执行状态迁移
      * @param {'fulfilled' | 'rejected'} newState
      * @param {any} value
      */
     _changeState(newState, value) {
       this._state = newState
       this._value = value
     }
   }

   // 验证：状态变化为 fulfilled
   const p1 = new MyPromise((resolve) => {
     resolve(123)
   })
   console.log(p1) // { _state: 'fulfilled', _value: 123 }

   // 验证：状态固化，后续修改无效
   const p2 = new MyPromise((resolve, reject) => {
     resolve('ok')
     reject('no')
   })
   console.log(p2) // { _state: 'fulfilled', _value: 'ok' }

   // 验证：executor 抛错 => rejected
   const p3 = new MyPromise(() => {
     throw new Error('executor error')
   })
   console.log(p3) // { _state: 'rejected', _value: Error(...) }
   ```

2. 创建 then 函数

   这一步先把 `then` 的骨架搭好，满足 Promise A+ 的几个核心要求：

   :::table full-width

   | 目标 | 实现方式 |
   | --- | --- |
   | `then` 接收成功/失败回调 | 参数：`onFulfilled`、`onRejected` |
   | `then` 一定返回新 Promise | `return new MyPromise(...)` |
   | 回调不立刻执行 | 用微任务调度 `runMicrotask` |
   | `pending` 时先注册回调 | 先压入执行队列，下一步统一触发 |

   :::

   :::details 实现思路

   1. 先“归一化”回调参数，避免用户没传函数时链路断掉
   2. `then` 返回一个新的 `MyPromise`，让链式调用成立
   3. 回调执行必须异步化（微任务），不能同步直跑
   4. 如果当前状态还是 `pending`，先把任务函数放进队列

   :::

   :::code-tabs

   @tab utils.js

   ```js
   /**
    * 把回调放入微任务队列
    * Node：process.nextTick
    * Browser：MutationObserver
    * Fallback：setTimeout
    * @param {Function} callback
    */
   export function runMicrotask(callback) {
     if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
       process.nextTick(callback) // [!code focus]
       return
     }

     if (typeof MutationObserver === 'function' && typeof document !== 'undefined') {
       const textNode = document.createTextNode('0')
       const observer = new MutationObserver(() => {
         observer.disconnect()
         callback()
       })
       observer.observe(textNode, { characterData: true })
       textNode.data = '1' // 触发微任务 // [!code focus]
       return
     }

     setTimeout(callback, 0)
   }
   ```

   @tab MyPromise.js

   ```js
   import { runMicrotask } from './utils.js'

   class MyPromise {
     static PENDING = 'pending'
     static FULFILLED = 'fulfilled'
     static REJECTED = 'rejected'

     constructor(executor) {
       this._state = MyPromise.PENDING
       this._value = null

       // 用于保存 pending 阶段注册的回调（第 3 步会触发它们）
       this._fulfilledQueue = []
       this._rejectedQueue = []

       try {
         executor(this._resolve.bind(this), this._reject.bind(this))
       }
       catch (error) {
         this._reject(error)
       }
     }

     /**
      * Promise A+ then
      * @param {Function} onFulfilled
      * @param {Function} onRejected
      * @returns {MyPromise}
      */
     then(onFulfilled, onRejected) {
       const realOnFulfilled = typeof onFulfilled === 'function'
         ? onFulfilled
         : value => value // 值透传 // [!code focus]

       const realOnRejected = typeof onRejected === 'function'
         ? onRejected
         : (reason) => { throw reason } // 错误透传 // [!code focus]

       return new MyPromise((resolve, reject) => { // [!code focus]
         const runFulfilled = () => {
           runMicrotask(() => { // [!code focus]
             try {
               const x = realOnFulfilled(this._value)
               resolve(x)
             }
             catch (err) {
               reject(err)
             }
           })
         }

         const runRejected = () => {
           runMicrotask(() => {
             try {
               const x = realOnRejected(this._value)
               resolve(x)
             }
             catch (err) {
               reject(err)
             }
           })
         }

         if (this._state === MyPromise.FULFILLED) {
           runFulfilled()
         } else if (this._state === MyPromise.REJECTED) {
           runRejected()
         } else {
           // pending 时先入队，等待状态确定后再统一调度
           this._fulfilledQueue.push(runFulfilled) // [!code focus]
           this._rejectedQueue.push(runRejected) // [!code focus]
         }
       })
     }

     _resolve(value) {
       if (this._state !== MyPromise.PENDING) return
       this._changeState(MyPromise.FULFILLED, value)
     }

     _reject(reason) {
       if (this._state !== MyPromise.PENDING) return
       this._changeState(MyPromise.REJECTED, reason)
     }

     _changeState(newState, value) {
       this._state = newState
       this._value = value
     }
   }
   ```

   :::

   :::info
   目前 `then` 已经完成“注册 + 返回新 Promise + 微任务调度”。
   但 `pending` 情况下队列还没被触发，下一步“执行队列”会把 `_fulfilledQueue/_rejectedQueue` 跑起来。
   :::

3. 执行队列
4. 遍历执行队列
5. 完成核心代码
6. catch 和 finally
7. resolve 和 reject
8. Promise-all
9. Promise-allSettled
10. Promise-race

:::::
