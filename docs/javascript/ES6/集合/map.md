---
title: Map
createTime: 2026/02/04 23:24:03
permalink: /javascript/1sffq7mh/
---

`Map` 是 ES6 提供的“键值对集合”，但和普通对象不同，
它的 key 不会被强制转成字符串，可以是任意类型。

## 为什么需要 `Map`

普通对象做字典时，键名本质上是字符串。
这会导致两个常见问题：

1. 对象键会被转成同一个字符串（例如 `[object Object]`）。
2. 需要维护“插入顺序 + 精确键类型”时，Object 的语义不够稳定。

`Map` 专门为“一对一映射”设计，键和值都按原始语义存储。

## 直观看区别：对象键在 Object 中会冲突

```js
const obj = {}
const x = { id: 1 }
const y = { id: 2 }

obj[x] = 'foo'
obj[y] = 'bar'

console.log(obj[x]) // bar
console.log(obj[y]) // bar
```

改成 `Map` 后，`x` 和 `y` 会被当作两个独立键。

```js
const map = new Map()
const x = { id: 1 }
const y = { id: 2 }

map.set(x, 'foo')
map.set(y, 'bar')

console.log(map.get(x)) // foo
console.log(map.get(y)) // bar
```

## 创建方式

`Map` 构造函数接收“可迭代的二元数组”。

```js
const m = new Map([
  ['name', 'zhangsan'],
  ['role', 'admin']
])

console.log(m.size) // 2
```

## 常用 API

:::table
| API | 作用 | 返回值 |
| --- | --- | --- |
| `set(key, value)` | 设置键值对 | `Map` 实例本身 |
| `get(key)` | 读取键对应的值 | 对应值 / `undefined` |
| `has(key)` | 判断 key 是否存在 | `boolean` |
| `delete(key)` | 删除键值对 | `boolean` |
| `clear()` | 清空所有键值对 | `undefined` |
| `size` | 当前键值对数量 | `number` |
:::

## 迭代能力

`Map` 默认迭代器就是 `entries()`，因此可以直接 `for...of`。

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

## 演示：`Map` 对象键与覆盖行为

:::demo
```html
<!doctype html>
<html lang="zh-CN">
  <body>
    <pre id="out"></pre>

    <script>
      const out = []

      const x = { id: 1 }
      const y = { id: 2 }

      const map = new Map()
      map.set(x, 'foo')
      map.set(y, 'bar')
      map.set('name', 'zhangsan')
      map.set('name', 'lisi')

      out.push('x => ' + map.get(x))
      out.push('y => ' + map.get(y))
      out.push('name => ' + map.get('name'))
      out.push('size => ' + map.size)

      document.getElementById('out').textContent = out.join('\n')
    </script>
  </body>
</html>
```
:::

## `Map` 与 Object 的互转

```js
const obj = { name: 'zs', age: 18 }
const map = new Map(Object.entries(obj))
const back = Object.fromEntries(map)

console.log(map) // Map(2)
console.log(back) // { name: 'zs', age: 18 }
```

在工程里，`Map` 常用于缓存、依赖图、节点关系、请求去重等场景。
