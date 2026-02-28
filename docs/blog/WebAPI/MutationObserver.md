---
title: MutationObserver
createTime: 2026/02/09 22:13:27
permalink: /blog/ovxkmrkm/
tags:
  - WebAPI
---

`MutationObserver` 用来监听 DOM 变化。它是对早期 `DOMSubtreeModified` 这类 Mutation Events 的替代方案，性能更稳定、控制粒度更细。

当你要做这些事情时，基本都会用到它：

- 动态内容注入后自动初始化（广告位、评论区、第三方脚本）
- 监听属性变化做 UI 同步（主题切换、`aria-*` 更新）
- 监听节点增删做埋点或资源释放

## 核心 API

:::table title="MutationObserver API 速览" full-width
| API | 作用 | 常见用法 |
| --- | --- | --- |
| `new MutationObserver(callback)` | 创建监听器 | 在 `callback` 里处理 `MutationRecord[]` |
| `observer.observe(target, options)` | 开始监听目标节点 | 配置 `childList/attributes/characterData/subtree` |
| `observer.disconnect()` | 停止监听 | 组件卸载时必须调用 |
| `observer.takeRecords()` | 立即取出尚未分发的记录 | 批处理或销毁前补偿处理 |
:::

:::details `observe` 常用配置

- `childList: true`：监听子节点增删
- `attributes: true`：监听属性变化
- `attributeFilter: ['class', 'style']`：只监听指定属性
- `characterData: true`：监听文本节点内容变化
- `subtree: true`：监听整个后代树（很常用）
- `attributeOldValue: true` / `characterDataOldValue: true`：需要旧值时开启

:::

## 标准使用流程

::::steps

1. 选定监听目标

   通常是某个容器节点，而不是 `document.body` 全量监听。目标越小，开销越可控。

2. 创建观察器

   在回调中接收 `records`，每个 record 代表一次变更记录。

3. 调用 `observe`

   按你的业务开启最少必要配置，比如只监听子节点增删就不要开 `attributes`。

4. 在回调中按类型分发

   `record.type` 只会是 `childList`、`attributes`、`characterData` 三种之一。

5. 结束时 `disconnect`

   单页应用里如果不释放，会导致重复监听和内存泄漏。

::::

## 用法示例

下面三个例子覆盖了最常见的监听场景。

:::code-tabs

@tab 监听子节点增删

```html
<ul id="list"></ul>
<button id="append">新增一项</button>

<script>
  const list = document.getElementById('list')

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'childList') {
        console.log('新增节点数:', record.addedNodes.length)
        console.log('删除节点数:', record.removedNodes.length)
      }
    }
  })

  observer.observe(list, {
    childList: true,
  })

  document.getElementById('append').addEventListener('click', () => {
    const li = document.createElement('li')
    li.textContent = `item-${Date.now()}`
    list.appendChild(li)
  })
</script>
```

@tab 监听属性变化

```html
<div id="box" class="box">内容</div>
<button id="toggle">切换 class</button>

<script>
  const box = document.getElementById('box')

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') {
        console.log('变更属性:', record.attributeName)
        console.log('旧值:', record.oldValue)
        console.log('新值:', box.getAttribute(record.attributeName))
      }
    }
  })

  observer.observe(box, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class'],
  })

  document.getElementById('toggle').addEventListener('click', () => {
    box.classList.toggle('active')
  })
</script>
```

@tab 监听文本变化

```html
<p id="text">初始内容</p>
<button id="change">修改文本</button>

<script>
  const textNode = document.getElementById('text').firstChild

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') {
        console.log('旧文本:', record.oldValue)
        console.log('新文本:', record.target.data)
      }
    }
  })

  observer.observe(textNode, {
    characterData: true,
    characterDataOldValue: true,
  })

  document.getElementById('change').addEventListener('click', () => {
    textNode.data = `更新时间：${new Date().toLocaleTimeString()}`
  })
</script>
```

:::

## 工程里常见的写法

### 1. 动态 DOM 自动初始化

当你依赖第三方脚本动态插入节点（如评论组件、弹窗容器），可以监听容器新增节点，然后只初始化新增部分，避免全量扫描。

### 2. 组件销毁时统一清理

在 Vue/React 组件中，把观察器实例挂到局部变量，并在卸载阶段调用 `disconnect()`。

### 3. 大批量变更时做批处理

如果回调里要做重计算，可以先累积 `records`，用 `requestAnimationFrame` 或节流函数统一处理一次，避免抖动。

## 执行时机补充

`MutationObserver` 的回调属于微任务时机：当前同步任务结束后、下一个宏任务开始前执行。
这也是它常被用来实现“异步但尽快”的 DOM 变更响应逻辑的原因。
