---
title: LRU Cache
createTime: 2026/04/20 22:35:29
permalink: /blog/cwnfiqsl/
tags:
  - 手写题
---

:::details 面试题

实现一个 LRU Cache，支持 `get(key)` 和 `put(key, value)`，时间复杂度要求 `O(1)`

:::

## 面试官视角

这题看起来是缓存题，本质考两个点：

1. 如何快速查找：哈希表
2. 如何快速维护最近使用顺序：双向链表，或者利用 `Map` 的插入顺序

如果面试要求严格 `O(1)` 并让你讲原理，推荐回答"哈希表 + 双向链表"。如果只是 JS 手写，可以先写 `Map` 版本，再补充底层思路

## LRU 是什么

LRU 是 Least Recently Used，最近最少使用。缓存满了以后，淘汰最久没有被访问的数据

规则：

- `get(key)` 命中后，这个 key 变成最近使用
- `put(key, value)` 新增或更新后，这个 key 也变成最近使用
- 超过容量时，删除最久未使用的 key

## JS Map 简洁版

`Map` 会维护插入顺序，所以可以把最近使用的元素放到最后，最久未使用的元素就在第一个

::::steps

1. 用 `Map` 存储缓存
2. `get` 命中时，先删除旧 key，再重新插入，让它移动到最后
3. `put` 更新时同样先删除旧 key，再插入
4. 如果容量超限，删除 `map.keys().next().value`，也就是最早插入的 key

::::

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1
    }

    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    this.cache.set(key, value)

    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }
}
```

## 双向链表版本

如果面试官要求讲清楚真正的 `O(1)` 结构，就用：

- `Map<key, node>`：通过 key 快速定位节点
- 双向链表：快速删除节点、移动节点
- 头部是最近使用，尾部是最久未使用
- 使用虚拟头尾节点，减少空链表判断

### 节点结构

```js
class Node {
  constructor(key = 0, value = 0) {
    this.key = key
    this.value = value
    this.prev = null
    this.next = null
  }
}
```

### 完整实现

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map()

    this.head = new Node()
    this.tail = new Node()
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  get(key) {
    if (!this.map.has(key)) {
      return -1
    }

    const node = this.map.get(key)
    this.moveToHead(node)

    return node.value
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key)
      node.value = value
      this.moveToHead(node)
      return
    }

    const node = new Node(key, value)
    this.map.set(key, node)
    this.addToHead(node)

    if (this.map.size > this.capacity) {
      const removed = this.removeTail()
      this.map.delete(removed.key)
    }
  }

  addToHead(node) {
    node.prev = this.head
    node.next = this.head.next
    this.head.next.prev = node
    this.head.next = node
  }

  removeNode(node) {
    node.prev.next = node.next
    node.next.prev = node.prev
  }

  moveToHead(node) {
    this.removeNode(node)
    this.addToHead(node)
  }

  removeTail() {
    const node = this.tail.prev
    this.removeNode(node)
    return node
  }
}
```

## 验证用例

```js
const lru = new LRUCache(2)

lru.put(1, 1)
lru.put(2, 2)
console.log(lru.get(1)) // 1，1 变成最近使用
lru.put(3, 3) // 淘汰 2
console.log(lru.get(2)) // -1
lru.put(4, 4) // 淘汰 1
console.log(lru.get(1)) // -1
console.log(lru.get(3)) // 3
console.log(lru.get(4)) // 4
```

## 面试回答模板

LRU 的关键是同时满足快速查找和快速更新顺序。查找用哈希表，顺序维护用双向链表。每次 `get` 或 `put` 命中，都把节点移动到链表头部；容量超过限制时，删除链表尾部节点，并同步从哈希表里删除。这样查找、插入、删除、移动都可以做到 `O(1)`

## 易错点

1. `get` 命中后必须更新最近使用顺序
2. `put` 更新已有 key 时也要移动到头部
3. 删除尾部节点后，要同时删除 `Map` 中的 key
4. 双向链表推荐使用虚拟头尾节点，避免大量边界判断
5. 如果用 `Map` 简洁版，要说明它依赖 JS `Map` 的插入顺序
