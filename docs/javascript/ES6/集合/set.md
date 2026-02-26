---
title: Set
createTime: 2026/02/04 23:24:09
permalink: /javascript/kgro7enj/
---

`Set` 是 ES6 提供的“唯一值集合”。它最直接解决的问题是：
当你只关心“某个值是否存在”，或者要做去重时，用数组会写出很多重复判断逻辑。

## 为什么需要 `Set`

数组当然也能存数据，但它有两个天然限制：

1. 值可以重复，去重要额外写逻辑。
2. `includes` 查询是线性扫描，语义上也不如“集合成员判断”清晰。

`Set` 把“成员唯一”这件事变成了数据结构自身的规则。

## 创建方式与判等规则

`Set` 构造函数接收一个可迭代对象（数组、字符串、Map 的 keys 等）。

```js
const s = new Set([1, 2, 2, 3])
console.log(s) // Set(3) { 1, 2, 3 }
```

`Set` 判断“是否重复”采用 `SameValueZero` 语义，几个边界点需要知道：

1. `NaN` 和 `NaN` 在 `Set` 中视为同一个值。
2. `+0` 和 `-0` 在 `Set` 中视为同一个值。
3. 对象按引用地址判断，不同对象字面量永远不是同一个值。

## 常用 API

:::table
| API | 作用 | 返回值 |
| --- | --- | --- |
| `add(value)` | 添加成员 | `Set` 实例本身（可链式调用） |
| `delete(value)` | 删除成员 | `boolean` |
| `has(value)` | 判断成员是否存在 | `boolean` |
| `clear()` | 清空所有成员 | `undefined` |
| `size` | 当前成员个数 | `number` |
:::

:::code-tabs
@tab 基础操作

```js
const users = new Set()

const a = { id: 1 }
const b = { id: 2 }

users.add(a).add(b).add(a)
console.log(users.size) // 2
console.log(users.has(a)) // true

users.delete(b)
console.log(users.size) // 1

users.clear()
console.log(users.size) // 0
```

@tab 遍历

```js
const set = new Set(['js', 'ts', 'vue'])

for (const item of set) {
  console.log(item)
}

set.forEach((value) => {
  console.log('forEach:', value)
})

console.log([...set.keys()]) // ['js', 'ts', 'vue']
console.log([...set.values()]) // ['js', 'ts', 'vue']
console.log([...set.entries()]) // [['js', 'js'], ['ts', 'ts'], ['vue', 'vue']]
```
:::

## 演示：`Set` 的去重与边界行为

:::demo
```html
<!doctype html>
<html lang="zh-CN">
  <body>
    <pre id="out"></pre>

    <script>
      const data = [
        1,
        1,
        NaN,
        NaN,
        +0,
        -0,
        { x: 1 },
        { x: 1 }
      ]

      const s = new Set(data)

      const lines = []
      lines.push('原数组长度: ' + data.length)
      lines.push('Set 长度: ' + s.size)
      lines.push('Set 是否包含 NaN: ' + s.has(NaN))
      lines.push('Set 是否包含 +0: ' + s.has(+0))
      lines.push('Set 是否包含 -0: ' + s.has(-0))
      lines.push('展开后的值: ' + JSON.stringify([...s]))

      document.getElementById('out').textContent = lines.join('\n')
    </script>
  </body>
</html>
```
:::

## `Set` 与数组的关系

`Set` 不是数组替代品，而是“成员集合”语义的表达。
常见组合写法是：

```js
const deduped = [...new Set([3, 3, 1, 2, 2])]
console.log(deduped) // [3, 1, 2]
```

当你需要“按索引访问、排序、切片”时仍然优先数组；
当你需要“唯一性和成员判断”时优先 `Set`。
