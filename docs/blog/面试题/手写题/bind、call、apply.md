---
title: bind、call、apply
createTime: 2026/04/20 22:36:09
permalink: /blog/5zygaips/
tags:
  - 手写题
---

:::note `call`、`apply` 和 `bind` 的函数调用规则

1. `call` 和 `apply` 会立即执行函数，`bind` 不会立即执行，而是返回一个新函数
2. `call` 接收参数列表，`apply` 接收参数数组
3. `bind` 要支持参数预置
4. `bind` 返回的函数如果被 `new` 调用，绑定的 `this` 会失效，`this` 应该指向新实例

:::

## 实现

### call

:::details 核心思路
把当前函数临时挂到目标对象上，通过 "对象.方法()" 的形式调用它，调用完成后删除临时属性

1. 获取要绑定的 `context`
2. `null` 或 `undefined` 默认指向 `globalThis`
3. 基本类型要用 `Object(context)` 包装
4. 用 `Symbol` 创建唯一 key，避免覆盖对象原有属性
5. 执行 `context[key](...args)`
6. 删除临时属性并返回执行结果
:::

```js
/**
 * contex 就是要绑定到的那个对象
 */
Function.prototype.myCall = function (context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('myCall must be called on a function')
  }

  const target = context == null ? globalThis : Object(context)
  const fnKey = Symbol('fn')

  target[fnKey] = this
  const result = target[fnKey](...args)
  delete target[fnKey]

  return result
}
```

### apply

:::details 核心思路
`apply` 和 `call` 的区别只有传参形式不同，`apply` 第二个参数是数组或类数组
:::

```js
Function.prototype.myApply = function (context, args) {
  if (typeof this !== 'function') {
    throw new TypeError('myApply must be called on a function')
  }

  const target = context == null ? globalThis : Object(context)
  const fnKey = Symbol('fn')

  target[fnKey] = this
  const result = args == null
    ? target[fnKey]()
    : target[fnKey](...args)

  delete target[fnKey]

  return result
}
```

### bind

:::details 核心思路
`bind` 返回一个新函数，新函数执行时再调用原函数。难点是处理构造调用：

- 普通调用：`this` 指向绑定的 `context`
- `new` 调用：`this` 指向新实例，绑定的 `context` 失效
:::

```js
Function.prototype.myBind = function (context, ...presetArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('myBind must be called on a function')
  }

  const originalFn = this

  function boundFn(...laterArgs) {
    // 如果是 new 调用，this 就是新实例；否则就是绑定的 context
    const isNewCall = this instanceof boundFn

    // new 调用时，this 是新实例
    // 普通调用时，this 是 context
    const finalThis = isNewCall
      ? this
      : context == null
        ? globalThis
        : Object(context)

    // 调用原函数
    return originalFn.apply(finalThis, [...presetArgs, ...laterArgs])
  }

  // 维护原函数的 prototype 关系，保证 new 调用时能正确继承
  if (originalFn.prototype) {
    boundFn.prototype = Object.create(originalFn.prototype)
    boundFn.prototype.constructor = boundFn
  }

  return boundFn
}
```

## 验证用例

```js
function say(age, city) {
  return `${this.name}-${age}-${city}`
}

const user = { name: 'byte' }

console.log(say.myCall(user, 18, 'beijing')) // byte-18-beijing
console.log(say.myApply(user, [18, 'beijing'])) // byte-18-beijing

const boundSay = say.myBind(user, 18)
console.log(boundSay('beijing')) // byte-18-beijing

function Person(name) {
  this.name = name
}

Person.prototype.getName = function () {
  return this.name
}

const BoundPerson = Person.myBind({ name: 'ignored' })
const p = new BoundPerson('real')

console.log(p.name) // real
console.log(p instanceof Person) // true
```
