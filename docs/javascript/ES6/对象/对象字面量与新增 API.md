---
title: 对象字面量与新增 API
createTime: 2026/02/26 11:32:00
permalink: /javascript/9ila0ak7/
---

ES6 在对象能力上有两条主线：
1. 对象字面量语法更紧凑。  
2. `Object.*` 新 API 补齐常见数据操作场景。

## 对象字面量增强

### 属性简写

```js
function createUser(loginId, nickname) {
  return {
    loginId,
    nickname
  }
}
```

### 方法简写

```js
const user = {
  name: '张三',
  sayHello() {
    return `hello ${this.name}`
  }
}
```

### 计算属性名

```js
const key = 'level'
const profile = {
  [key]: 5
}
```

## `Object.is`

`Object.is` 与 `===` 的差异主要在两个边界：
1. `Object.is(+0, -0) === false`  
2. `Object.is(NaN, NaN) === true`

```js
console.log(Object.is(+0, -0)) // false
console.log(Object.is(NaN, NaN)) // true
```

## `Object.keys / values / entries`

它们都只返回“对象自身的可枚举属性”。

:::code-tabs
@tab keys

```js
const obj = { a: 1, b: 2 }
console.log(Object.keys(obj)) // ['a', 'b']
```

@tab values

```js
const obj = { a: 1, b: 2 }
console.log(Object.values(obj)) // [1, 2]
```

@tab entries

```js
const obj = { a: 1, b: 2 }
console.log(Object.entries(obj)) // [['a', 1], ['b', 2]]
```
:::

## `Object.fromEntries`

`Object.fromEntries` 是 `Object.entries` 的逆过程，常用于 `Map -> Object`。

```js
const map = new Map([
  ['name', 'zs'],
  ['age', 18]
])

const obj = Object.fromEntries(map)
console.log(obj) // { name: 'zs', age: 18 }
```

## 演示：对象与 Map 的双向转换

::: demo
```html
<!doctype html>
<html lang="zh-CN">
  <body>
    <pre id="out"></pre>
    <script>
      const user = { name: 'zhangsan', score: 100 }
      const asMap = new Map(Object.entries(user))
      asMap.set('score', 120)

      const back = Object.fromEntries(asMap)

      document.getElementById('out').textContent = JSON.stringify(back, null, 2)
    </script>
  </body>
</html>
```
:::
