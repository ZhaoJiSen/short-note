---
title: WeakMap 与 WeakSet
createTime: 2026/02/26 10:46:13
permalink: /javascript/ktcbv926/
---

`WeakMap` 和 `WeakSet` 可以看作是 `Map/Set` 的 "弱引用版本"。它们引入的核心价值不是新增 API，而是更友好的内存语义

:::note 为什么需要 WeakMap / WeakSet
当我们给对象做 "附加信息" 时，如果直接把对象放进普通 `Map/Set`，这份引用会阻止对象被垃圾回收，长期运行可能造成内存积压。而 `WeakMap/WeakSet` 的成员是弱引用：如果外部已经没有对这个对象的强引用，GC 可以直接回收它

因此它通常用于:

1. 给 DOM 节点或对象实例挂载 "私有元信息"
2. 缓存对象计算结果，但不希望缓存阻止对象被释放
3. 需要 "对象是否处理过" 的标记集合（`WeakSet`）
:::

## 基本使用

在 `WeakMap` 中 key 只能是对象（值不限），而 `WeakSet` 只能存储对象。它们都没有 `size`，也不能迭代遍历。原因很直接：成员可能随时被 GC 回收，数量和遍历结果无法稳定

:::table full-width

| 结构 | API | 说明 | 返回值 |
| --- | --- | --- | --- |
| `WeakMap` | `set(key, value)` | 设置键值对，`key` 必须是对象 | `WeakMap` 实例 |
| `WeakMap` | `get(key)` | 读取键对应的值 | 对应值 / `undefined` |
| `WeakMap` | `has(key)` | 判断键是否存在 | `boolean` |
| `WeakMap` | `delete(key)` | 删除键值对 | `boolean` |

:::

:::table full-width

| 结构 | API | 说明 | 返回值 |
| --- | --- | --- | --- |
| `WeakSet` | `add(value)` | 添加成员，成员必须是对象 | `WeakSet` 实例 |
| `WeakSet` | `has(value)` | 判断成员是否存在 | `boolean` |
| `WeakSet` | `delete(value)` | 删除成员 | `boolean` |

:::

:::code-tabs
@tab WeakMap.js

```js
const wm = new WeakMap()
const node = { id: 1 }

wm.set(node, { mounted: true })
console.log(wm.has(node)) // true
console.log(wm.get(node)) // { mounted: true }

wm.delete(node)
console.log(wm.has(node)) // false
```

@tab WeakSet.js

```js
const ws = new WeakSet()
const obj = { visited: true }

ws.add(obj)
console.log(ws.has(obj)) // true

ws.delete(obj)
console.log(ws.has(obj)) // false
```

@tab error.js

```js
const out = []

const wm = new WeakMap()
const ws = new WeakSet()

const obj = { name: 'cache-target' }
wm.set(obj, 'ok')
ws.add(obj)

out.push('WeakMap has obj: ' + wm.has(obj))
out.push('WeakSet has obj: ' + ws.has(obj))

try {
  wm.set(1, 'bad')
} catch (e) {
  out.push('WeakMap.set(1, ...) 报错: ' + e.message)
}

try {
  ws.add('bad')
} catch (e) {
  out.push('WeakSet.add("bad") 报错: ' + e.message)
}
```

:::
