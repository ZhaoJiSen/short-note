---
title: Symbol
createTime: 2026/02/26 10:46:32
permalink: /javascript/t3nmduvx/
---

`Symbol` 是 ES6 新增的原始类型，最常见用途是“创建不会冲突的属性键”。

## 为什么需要 `Symbol`

在 ES5 中，对象键名基本都是字符串。
多人协作或第三方扩展场景里，很容易发生同名覆盖：

```js
const obj = {}
obj.id = 'module-a'
obj.id = 'module-b' // 覆盖
```

`Symbol` 的值天生唯一，即使描述文本相同也不相等。

```js
const a = Symbol('id')
const b = Symbol('id')

console.log(a === b) // false
```

## 创建与基本特性

1. `Symbol()` 不能用 `new`。
2. 可传入描述字符串用于调试。
3. 不能与字符串直接拼接。

```js
const key = Symbol('token')
console.log(typeof key) // 'symbol'
console.log(String(key)) // 'Symbol(token)'
```

## 作为对象属性名

`Symbol` 作为键时，必须使用中括号语法。

```js
const k = Symbol('secret')
const user = {
  name: 'zhangsan',
  [k]: 'only-internal'
}

console.log(user.name) // zhangsan
console.log(user[k]) // only-internal
```

## 遍历行为

Symbol 键不会出现在 `Object.keys()`、`for...in`、`JSON.stringify()` 中。
如果要读取 Symbol 键，需要专门 API。

:::code-tabs
@tab 读取 Symbol 键

```js
const s1 = Symbol('a')
const s2 = Symbol('b')
const obj = {
  [s1]: 1,
  [s2]: 2,
  visible: 3
}

console.log(Object.getOwnPropertySymbols(obj)) // [Symbol(a), Symbol(b)]
console.log(Reflect.ownKeys(obj)) // ['visible', Symbol(a), Symbol(b)]
```

@tab 全局注册表

```js
const x1 = Symbol.for('app.cache')
const x2 = Symbol.for('app.cache')

console.log(x1 === x2) // true
console.log(Symbol.keyFor(x1)) // 'app.cache'
console.log(Symbol.keyFor(Symbol('app.cache'))) // undefined
```
:::

## 演示：字符串键与 Symbol 键互不干扰

:::demo
```html
<!doctype html>
<html lang="zh-CN">
  <body>
    <pre id="out"></pre>

    <script>
      const out = []

      const roleKey = Symbol('role')
      const user = {
        role: 'visitor',
        [roleKey]: 'admin-internal'
      }

      out.push('obj.role => ' + user.role)
      out.push('obj[roleKey] => ' + user[roleKey])
      out.push('Object.keys => ' + JSON.stringify(Object.keys(user)))
      out.push(
        'Reflect.ownKeys => ' +
          Reflect.ownKeys(user)
            .map((k) => (typeof k === 'symbol' ? k.toString() : k))
            .join(', ')
      )

      document.getElementById('out').textContent = out.join('\n')
    </script>
  </body>
</html>
```
:::
