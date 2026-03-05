---
title: 手写 Promise
createTime: 2026/02/26 21:56:55
permalink: /javascript/v6d16zmc/
---

## 基本实现

:::::steps

1. 要点明确

   :::note 要点明确

   1. `Promise` 存在两个阶段、三种状态，状态只能从 `pending` 变为 `fulfilled` 或 `rejected`，且一旦变为终态便不再改变
   2. `Promise` 的构造器接收一个任务执行器函数，该函数会立即同步执行
   3. `executor` 执行过程中抛出错误，则 Promise 状态变为 `rejected`
   4. `then` 方法调用后会重新返回一个 `Promise` 从而实现链式调用
   5. `then` 回调必须进入微任务队列异步执行
   6. `then` 返回的 `Promise` 会等待 `then` 参数返回的 `Promise` 状态变为 `fulfilled` 或 `rejected` 后再执行

   :::

2. 状态变化

   在实例化 `Promise` 时，会给 `executor` 函数传递两个参数：`resolve` 和 `reject`，分别用于标记任务完成和失败

   :::code-tabs
   @tab enums.ts

   ```ts
   enum State {
     PENDING = 'pending',
     FULFILLED = 'fulfilled',
     REJECTED = 'rejected',
   }
   ```

   @tab index.ts

   ```ts
   class MyPromise {
     private _state: State = State.PENDING;
     private _value: unknown = null;

     constructor(
       executor: (
         resolve: (value: unknown) => void,
         reject: (reason: unknown) => void
        ) => void
      ) {
       // 调用 resolve 将状态变为 fulfilled 
       const resolve = (value: unknown) => {
         this.setState(State.FULFILLED, value);
       }

       // 调用 reject 将状态变为 rejected
       const reject = (reason: unknown) => {
         this.setState(State.REJECTED, reason);
       }

       try {
         executor(resolve, reject);
       } catch(error) {
         reject(error);
       }
     }

     setState(state: State, value: unknown): void {
       if (this._state !== State.PENDING) return;

       this._state = state;
       this._value = value;
     }
   }
   ```

   :::

3. 链式调用

   `then` 方法会返回一个新的 `Promise`，从而实现链式调用。该方法可接收两个参数：`onFulfilled` 和 `onRejected`

   :::code-tabs
   @tab index.ts

   ```ts
   // ...
   // 这里在全局保存一个 handler
   // 目的：在异步场景下也能拿到 value 
   private _handler: (() => void) | null = null

   setState(state: State, value: unknown): void {
     if (this._state !== State.PENDING) return;

     this._state = state;
     this._value = value;

     this._handler?.();
   }

   then(
     onFulfilled: (value: unknown) => unknown,
     onRejected?: (reason: unknown) => unknown
   ): MyPromise {
     return new MyPromise(() => {
       // 保存一个 "以后再执行的函数引用"，真正执行这个函数时，Promise 的状态已经变为 settled 了 // [!code highlight]
       this._handler = () => {
         if (this._state === State.FULFILLED) {
          onFulfilled(this._value)
         } else if (this._state === State.REJECTED) {
          onRejected?.(this._value);
         }
       }

       if (this._state !== State.PENDING) {
         this._handler?.();
       }
     })
   }
   
   // ...
   ```

   @tab case.ts

   ```ts
   const p = new MyPromise((resolve) => {
     // 同步代码中调用 setTimeout，所以并不会立即调用 resolve // [!code highlight]
     // 构造函数结束时，状态为 pending // [!code highlight]
     setTimeout(() => {
       resolve('ok')
     }, 1000)
   })
   
   // then 函数执行，由于此时状态为 pending 所以内部的 _handler 被设置 // [!code highlight]
   // 一段时间后:  // [!code highlight]
   // 1. setTimeout 回调触发，resolve 执行，触发 setState  // [!code highlight]
   // 2. 触发 then 中的 onFulfilled 或 onRejected // [!code highlight]
   p.then((value) => {
     console.log('value:', value)
   })
   ```

   :::

   现在的 `then` 实现方式存在一个弊端。`then` 是可以被实例多次掉用的，因此如果一旦多次调用 `then` 就会导致 `_handler` 被多次覆盖，从而只执行最后一次调用的回调函数

   ::::note 思路
   将 `_handler` 改为数组，每次调用 `then` 时将回调函数添加到数组中，然后每次调用 `setState` 时遍历数组并执行回调函数

   :::code-tabs
   @tab index.ts

   ```ts
   // ...
   private _handlers: (() => void)[] = [];

   setState(state: State, value: unknown): void {
    this._state = state;
    this._value = value;

    this.runTask();
   }

   runTask(): void {
     if (this._state !== State.PENDING) {
       this._handlers.forEach(handler => handler());
       this._handlers = [];
     }
   }
 
   then(
     onFulfilled: (value: unknown) => unknown,
     onRejected?: (reason: unknown) => unknown
   ): MyPromise {
     return new MyPromise(() => {
       this._handlers.push(() => {  //[!code highlight]
        if (this._state === State.FULFILLED) {  //[!code highlight]
          onFulfilled(this._value) ?? this._value;  //[!code highlight]
        } else if (this._state === State.REJECTED) {  //[!code highlight]
          onRejected?.(this._value) ?? this._value;  //[!code highlight]
        }  //[!code highlight]
       })  //[!code highlight]

       this.runTask();
     })
   }
   // ...
   ```

   @tab case.ts

   ```ts
   const p = new MyPromise((resolve) => {
     setTimeout(() => {
       resolve('ok')
     }, 1000)
   })

   p.then((value) => {
     console.log('value:', value)
   })

   p.then((value) => {
     console.log('value:', value)
   })
   ```

   :::
   ::::

   然后就是实现连续的 `then` 调用

   ::::note 思路
   在返回的 `Promise` 中显示的去执行 `resolve` 或 `reject` 从而将结果传递给下一个 `Promise`

   :::code-tabs
   @tab index.ts

   ```ts
   // ...
   then(
     onFulfilled: ((value: unknown) => unknown) | null,
     onRejected?: ((reason: unknown) => unknown) | null
   ): Promise<unknown> {
     return new Promise<unknown>(
       (
         resolve: (value: unknown) => void,
         reject: (reason: unknown) => void
       ) => {
       this._handlers.push(() => {
         try {
           const callback = 
              this._state === State.FULFILLED ? onFulfilled : onRejected;  //[!code highlight]
           const result = callback?.(this._value) ?? this._value;  //[!code highlight]

           resolve(result); //[!code highlight]
         } catch (error) {
           reject(error) //[!code highlight]
         }
       })

       this.runTask();
     })
   }
   // ...
   ```

   @tab case.ts

   ```ts
   const p = new Promise((resolve) => {
     setTimeout(() => {
       resolve(1)
     })
   })

   p.then((value) => {
     console.log('then1', value)

     return value
   }).then((value) => {
     console.log('then2', value)
   })
   ```

   :::
   ::::

4. 微任务队列

   现在的 `then` 实现方式存在一个弊端。`then` 是同步触发的

   ::::note 思路

   使用 `queueMicrotask` 将回调函数包装成微任务
   :::code-tabs
   @tab index.ts

   ```ts
   // ...
   runMicrotasks(fn: () => any) {
     if (typeof queueMicrotask === 'function') {
       queueMicrotask(fn);
     } else if (
       typeof process === 'object' &&
       typeof process.nextTick === 'function'
     ) {
       process.nextTick(fn);
     } else if (typeof MutationObserver === 'function') {
       const text = document.createTextNode('');

       new MutationObserver(fn).observe(text, {
         characterData: true,
       });

       text.data = '1';
     } else {
       setTimeout(fn, 0);
     }
   }
    
   runTask() {
     runMicrotasks(() => {
       if (this._state !== State.PENDING) {
         this.handlers.forEach((handler) => handler());
         this.handlers = [];
       }
     })
   }
   // ...
   ```

   :::
   ::::

5. 嵌套 Promise

   现在依然存在弊端，`then` 未处理 "返回 Promise" 的同化。在原生 Promise 中，如果 `then` 返回一个 Promise，则下一个 `then` 会等待该 Promise 状态变为 `fulfilled` 或 `rejected` 后再执行

   ::::note 思路

   当 `result` 是 `Promise/thenable` 时，额外判断是否为 `Promise`，如果是则等待其状态变为 `fulfilled` 或 `rejected` 后再执行

   :::code-tabs
   @tab index.ts  

   ```ts
   // ...
   isPromiseLike<T = unknown>(obj: unknown): obj is PromiseLike<T> {
     return (
       obj !== null &&
       (typeof obj === 'object' || typeof obj === 'function') &&
       typeof (obj as { then?: unknown }).then === 'function'
     )
   }

   then(
     onFulfilled: ((value: unknown) => unknown) | null,
     onRejected?: ((reason: unknown) => unknown) | null
   ) {
     return new MyPromise((resolve, reject) => {
       this.handlers.push(() => {
         try {
           const callback = this._state === State.FULFILLED ? onFulfilled : onRejected;

           const res: unknown = cb?.(this.value) ?? this.value;

           if (this.isPromiseLike(result)) {
             result.then(resolve, reject);
           } else {
             resolve(result);
           }
         } catch (error) {
           reject(error)
         }
       })
     })
   }
   // ...
   ```

   :::

   ::::

6. 实现 `catch` 与 `finally`

   `catch` 用于注册一个 Promise 处于 `rejected` 时的回调，等价于 `then(undefined, onRejected)`，返回一个 Promise

   ::::note 思路

   `catch` 接收一个 `onRejected` 回调，直接在函数中调用 `then` 并传入 `undefined` 和 `onRejected`

   :::code-tabs
   @tab index.ts

   ```ts
   catch(onRejected?: (reason: any) => void) {
     return this.then(undefined, onRejected);
   }
    ```

   :::

   `finally` 用于注册一个 Promise 处于 `fulfilled` 或 `rejected` 时的回调，不接受任何参数，不影响最终状态，等价于 `then(onFinally, onFinally)`，返回一个 Promise

   ::::note 思路

   `finally` 接收一个 `onFinally` 回调，直接在函数中调用 `then` 并传入 `onFinally` 和 `onFinally`

   :::code-tabs
   @tab index.ts

   ```ts
   finally(onFinally?: () => void) {
     return this.then((res) => {
       onFinally?.();
       return res;
     }, (err) => {
       onFinally?.();
       throw err;
     });
   }
    ```

   :::

   ::::

7. 完整代码

   :::code-tabs
   @tab index.ts

   ```ts
   enum State {
     PENDING = 'pending',
     FULFILLED = 'fulfilled',
     REJECTED = 'rejected',
   }

   function runMicrotasks(fn: () => void) {
     if (typeof queueMicrotask === 'function') {
       queueMicrotask(fn);
     } else if (typeof process === 'object' && typeof process.nextTick === 'function') {
       process.nextTick(fn);
     } else if (typeof MutationObserver === 'function') {
       const text = document.createTextNode('');
       new MutationObserver(fn).observe(text, { characterData: true });
       text.data = '1';
     } else {
       setTimeout(fn, 0);
     }
   }

   function isPromiseLike<T = unknown>(obj: unknown): obj is PromiseLike<T> {
     return (
       obj !== null &&
       (typeof obj === 'object' || typeof obj === 'function') &&
       typeof (obj as { then?: unknown }).then === 'function'
     );
   }

   class MyPromise<T = unknown> {
     private _state: State = State.PENDING;
     private _value: unknown = null;
     // 收集 then 注册的回调，状态确定后统一调度
     private _handlers: Array<() => void> = [];

     constructor(
       executor: (
         resolve: (value: T | PromiseLike<T>) => void,
         reject: (reason?: unknown) => void
       ) => void,
     ) {
       const resolve = (value: T | PromiseLike<T>) => {
         this.setState(State.FULFILLED, value);
       };

       const reject = (reason?: unknown) => {
         this.setState(State.REJECTED, reason);
       };

       try {
         executor(resolve, reject);
       } catch (error) {
         reject(error);
       }
     }

     private setState(state: State, value: unknown): void {
       // Promise 一旦从 pending 进入终态，就不能再变化
       if (this._state !== State.PENDING) return;
       this._state = state;
       this._value = value;
       this.runTask();
     }

     private runTask(): void {
       // 还在 pending 阶段，不执行回调
       if (this._state === State.PENDING) return;

       runMicrotasks(() => {
         // 取快照后再清空，避免回调执行时对原数组产生副作用
         const tasks = this._handlers.slice();
         this._handlers = [];
         tasks.forEach((handler) => handler());
       });
     }

     // oxlint-disable-next-line unicorn/no-thenable
     then<TResult1 = T, TResult2 = never>(
       onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
       onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
     ): MyPromise<TResult1 | TResult2> {
       return new MyPromise<TResult1 | TResult2>((resolve, reject) => {
         this._handlers.push(() => {
           try {
             const callback =
               this._state === State.FULFILLED
                 // fulfilled 且用户未传 onFulfilled：值透传
                 ? (onFulfilled ?? ((value: T) => value as TResult1))
                 : (onRejected ??
                     // rejected 且用户未传 onRejected：错误继续向后抛
                     ((reason: unknown) => {
                       throw reason;
                     }));

             const result = callback(this._value as T);

             if (isPromiseLike(result)) {
               // 返回 Promise/thenable 时，采用其最终状态
               result.then(resolve, reject);
             } else {
               // 返回普通值时，直接让下一个 Promise fulfilled
               resolve(result as TResult1 | TResult2);
             }
           } catch (error) {
             reject(error);
           }
         });

         this.runTask();
       });
     }

     catch<TResult = never>(
       onRejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
     ): MyPromise<T | TResult> {
       return this.then(null, onRejected);
     }

     finally(onFinally?: (() => void) | null): MyPromise<T> {
       return this.then(
         (value) => {
           onFinally?.();
           return value;
         },
         (reason) => {
           onFinally?.();
           throw reason;
         },
       );
     }
   }
   ```

   :::

:::::

## 静态方法实现

:::::steps

1. `resolve`

   `resolve` 用于创建一个 fulfilled 的 `MyPromise`。如果传入的是 Promise/thenable，则会等待其最终状态。

   ```ts
   static resolve<T>(value: T | PromiseLike<T>): MyPromise<T> {
     if (value instanceof MyPromise) {
       return value;
     }

     return new MyPromise<T>((resolve, reject) => {
       if (isPromiseLike<T>(value)) {
         value.then(resolve, reject);
       } else {
         resolve(value);
       }
     });
   }
   ```

2. `reject`

   `reject` 用于创建一个 rejected 的 `MyPromise`。

   ```ts
   static reject<T = never>(reason?: unknown): MyPromise<T> {
     return new MyPromise<T>((_resolve, reject) => {
       reject(reason);
     });
   }
   ```

3. `try`

   `try` 统一处理“同步函数抛错”和“返回 Promise”两种情况，最终都返回 `MyPromise`。

   ```ts
   static try<T>(fn: () => T | PromiseLike<T>): MyPromise<T> {
     return new MyPromise<T>((resolve, reject) => {
       try {
         const result = fn();
         MyPromise.resolve(result).then(resolve, reject);
       } catch (error) {
         reject(error);
       }
     });
   }
   ```

4. `all`

   `all` 要求全部成功才成功，结果按输入顺序返回；任意一个失败就立即失败。

   ```ts
   static all<T>(iterable: Iterable<T | PromiseLike<T>>): MyPromise<T[]> {
     return new MyPromise<T[]>((resolve, reject) => {
       const items = Array.from(iterable);
       if (items.length === 0) {
         resolve([]);
         return;
       }

       const results: T[] = new Array(items.length);
       let fulfilledCount = 0;

       items.forEach((item, index) => {
         MyPromise.resolve(item).then(
           (value) => {
             results[index] = value;
             fulfilledCount += 1;

             if (fulfilledCount === items.length) {
               resolve(results);
             }
           },
           (reason) => {
             reject(reason);
           },
         );
       });
     });
   }
   ```

5. `any`

   `any` 只要有一个成功就成功；只有全部失败才失败。

   ```ts
   static any<T>(iterable: Iterable<T | PromiseLike<T>>): MyPromise<T> {
     return new MyPromise<T>((resolve, reject) => {
       const items = Array.from(iterable);
       if (items.length === 0) {
         reject(new AggregateError([], 'All promises were rejected'));
         return;
       }

       const errors: unknown[] = new Array(items.length);
       let rejectedCount = 0;

       items.forEach((item, index) => {
         MyPromise.resolve(item).then(
           (value) => {
             resolve(value);
           },
           (reason) => {
             errors[index] = reason;
             rejectedCount += 1;

             if (rejectedCount === items.length) {
               reject(new AggregateError(errors, 'All promises were rejected'));
             }
           },
         );
       });
     });
   }
   ```

6. `race`

   `race` 返回最先 settle（fulfilled 或 rejected）的结果。

   ```ts
   static race<T>(iterable: Iterable<T | PromiseLike<T>>): MyPromise<T> {
     return new MyPromise<T>((resolve, reject) => {
       for (const item of iterable) {
         MyPromise.resolve(item).then(resolve, reject);
       }
     });
   }
   ```

7. `allSettled`

   `allSettled` 会等待全部任务结束，并返回每个任务的最终状态，不会因为某个失败而中断。

   ```ts
   type SettledResult<T> =
     | { status: 'fulfilled'; value: T }
     | { status: 'rejected'; reason: unknown };

   static allSettled<T>(
     iterable: Iterable<T | PromiseLike<T>>,
   ): MyPromise<Array<SettledResult<T>>> {
     return new MyPromise<Array<SettledResult<T>>>((resolve) => {
       const items = Array.from(iterable);
       if (items.length === 0) {
         resolve([]);
         return;
       }

       const results: Array<SettledResult<T>> = new Array(items.length);
       let settledCount = 0;

       items.forEach((item, index) => {
         MyPromise.resolve(item).then(
           (value) => {
             results[index] = { status: 'fulfilled', value };
             settledCount += 1;
             if (settledCount === items.length) resolve(results);
           },
           (reason) => {
             results[index] = { status: 'rejected', reason };
             settledCount += 1;
             if (settledCount === items.length) resolve(results);
           },
         );
       });
     });
   }
   ```

:::::
