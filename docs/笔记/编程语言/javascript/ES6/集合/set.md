---
title: Set
createTime: 2026/02/04 23:24:09
permalink: /javascript/kgro7enj/
---

`Set` 是 ES6 提供的 =="唯一值集合"==。和数组不同，它天然保证成员不重复，适合表达 "我只关心是否存在" 这一类语义

:::note 为什么需要 Set

数组当然也能存数据，但在 "去重 + 成员判断" 场景里会暴露两个问题：

1. 成员可重复，去重要额外写逻辑
2. 成员查询通常依赖线性扫描，语义上不如集合清晰

`Set` 把 "成员唯一" 做成了数据结构本身的规则，通常用于需要按索引读写、排序、切片，优先数组

:::

::::details 如下案例可以直观看到 Set 和数组在去重场景下的差异
:::code-tabs
@tab array.js

```js
const arr = [1, 2, 2, 3, 3, 3]

// 数组去重需要额外处理
const deduped = arr.filter((item, index) => arr.indexOf(item) === index)

console.log(deduped) // [1, 2, 3]
```

@tab set.js

```js
const set = new Set([1, 2, 2, 3, 3, 3])

// Set 天然去重
console.log(set) // Set(3) { 1, 2, 3 }
console.log([...set]) // [1, 2, 3]
```

:::
::::

## 基本使用

`Set` 构造函数接收可迭代对象（如数组、字符串、Map 的 keys 等）

```js
const s = new Set([1, 2, 2, 3])
console.log(s) // Set(3) { 1, 2, 3 }
```

:::table full-width

| API | 作用 | 返回值 |
| --- | --- | --- |
| `add(value)` | 添加成员 | `Set` 实例本身（可链式调用） |
| `has(value)` | 判断成员是否存在 | `boolean` |
| `delete(value)` | 删除成员 | `boolean` |
| `clear()` | 清空所有成员 | `undefined` |
| `size` | 当前成员数量 | `number` |

:::

### 判等规则

`Set` 判断是否重复使用 `SameValueZero` 语义，有三个边界点需要知道

> [!IMPORTANT]
>
> 1. `NaN` 与 `NaN` 在 `Set` 中视为同一个值
> 2. `+0` 与 `-0` 在 `Set` 中视为同一个值
> 3. 对象按引用地址判断，不同对象字面量永远不是同一个值

:::code-tabs
@tab 边界值

```js
const s = new Set([NaN, NaN, +0, -0])
console.log(s.size) // 2
console.log([...s]) // [NaN, 0]
```

@tab 对象引用

```js
const s = new Set()

const x = { id: 1 }
const y = { id: 1 }

s.add(x)
s.add(y)

console.log(s.size) // 2（x 和 y 不是同一个引用）
console.log(s.has(x)) // true
```

:::

## 迭代能力

`Set` 默认迭代器是 `values()`，因此可以直接使用 `for...of`

:::code-tabs
@tab keys / values / entries

```js
const set = new Set(['js', 'ts', 'vue'])

console.log([...set.keys()]) // ['js', 'ts', 'vue']
console.log([...set.values()]) // ['js', 'ts', 'vue']
console.log([...set.entries()]) // [['js', 'js'], ['ts', 'ts'], ['vue', 'vue']]
```

@tab for...of / forEach

```js
const set = new Set(['js', 'ts', 'vue'])

for (const item of set) {
  console.log(item)
}

set.forEach((value) => {
  console.log('forEach =>', value)
})
```

:::

## Set 与数组的转换

数组和 `Set` 可以非常自然地互转：

```js
const arr = [3, 3, 1, 2, 2]
const set = new Set(arr)
const back = [...set]

console.log(set) // Set(3) { 3, 1, 2 }
console.log(back) // [3, 1, 2]
```
