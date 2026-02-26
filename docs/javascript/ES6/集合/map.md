---
title: Map
createTime: 2026/02/04 23:24:03
permalink: /javascript/1sffq7mh/
---

`Map` 是 ES6 提供的 =="键值对集合"==，但和普通对象不同：它的 key 不会被强制转成字符串，可以是任意类型。并且能够记住键的原始插入顺序

:::note 为什么需要 Map

普通对象做字典时，键名本质上是字符串这会导致两个常见问题：

1. 对象键会被转成同一个字符串（例如 `[object Object]`）
2. 需要维护 "插入顺序 + 精确键类型" 时，Object 的语义不够稳定

`Map` 专门为 "一对一映射" 设计，键和值都按原始语义存储，通常用于缓存、去重、构建依赖关系等

:::

::::details 如下案例可以直观查看在对象中健名的隐式处理
:::code-tabs
@tab object.js

```js
const obj = {}
const x = { id: 1 }
const y = { id: 2 }


// 因为普通对象 obj 的键只能是 string 或 symbol
// 此时由于健名是一个 Object 因此被隐式的转换为了 [object Object]
obj[x] = 'foo'
obj[y] = 'bar'

console.log(obj[x]) // bar
console.log(obj[y]) // bar
```

@tab map.js

```js
const map = new Map()

// x 和 y 会被当作两个独立键
const x = { id: 1 }
const y = { id: 2 }

map.set(x, 'foo')
map.set(y, 'bar')

console.log(map.get(x)) // foo
console.log(map.get(y)) // bar
```

:::
::::

## 基本使用

`Map` 构造函数接收 "可迭代的二元数组"

```js
const m = new Map([
  ['name', 'foo'],
  ['role', 'admin']
])

console.log(m.size) // 2
console.log(m)  // Map(2) { 'name' => 'foo', 'role' => 'admin' }
```

> [!IMPORTANT]
> `Map` 中的一个键只能出现一次

:::table full-width

| API | 作用 | 返回值 |
| --- | --- | --- |
| `set(key, value)` | 设置键值对 | `Map` 实例本身 |
| `get(key)` | 读取键对应的值 | 对应值 / `undefined` |
| `has(key)` | 判断 key 是否存在 | `boolean` |
| `delete(key)` | 删除键值对 | `boolean` |
| `clear()` | 清空所有键值对 | `undefined` |
| `size` | 当前键值对数量 | `number` |

:::

### 迭代能力

`Map` 默认迭代器就是 `entries()`，因此可以直接 `for...of` 循环

:::code-tabs

@tab keys / values / entries

```js
const m = new Map([
  ['name', 'zs'],
  ['age', 18]
])

console.log([...m.keys()]) // ['name', 'age']
console.log([...m.values()]) // ['zs', 18]
console.log([...m.entries()]) // [['name', 'zs'], ['age', 18]]
```

@tab for...of / forEach

```js
const m = new Map([
  ['name', 'zs'],
  ['age', 18]
])

for (const [key, value] of m) {
  console.log(key, value)
}

m.forEach((value, key) => {
  console.log('forEach =>', key, value)
})
```

:::

### Map 与 Object 的转换

Object 与 Map 的转换非常简单，Object -> Map 只需调用 `Object.entries` 方法，而反过来也只需调用 `Object.fromEntries` 方法

```js
const obj = { name: 'zs', age: 18 }
const map = new Map(Object.entries(obj))
const back = Object.fromEntries(map)

console.log(map) // Map(2) { 'name' => 'zs', 'age' => 18 }
console.log(back) // { name: 'zs', age: 18 }
```
