---
title: Fetch
createTime: 2026/03/31 18:30:52
permalink: /javascript/43422541/
---

Fetch API 是一个现代化的接口，用于在浏览器中进行网络请求。它基于 Promise，且提供了比 `XMLHttpRequest`  更简洁和强大的方式来进行异步操作

直接使用 `fetch()` 方法即可发起一个网络请求，它接受一个 URL 以及一个可选的配置对象作为参数，返回一个 Promise 对象，表示请求的结果

:::table full-width

| 配置项 | 描述 |
| --- | --- |
| method | 请求方法，默认为 GET |
| headers | 请求头，可以是一个对象或 Headers 实例 |
| body | 请求体，适用于 POST、PUT 等方法，可以是字符串、FormData、Blob 等类型 |
| mode | 请求模式，如 cors、no-cors、same-origin，默认为 cors |
| credentials | 是否携带凭证，如 cookies，默认为 same-origin |
| cache | 缓存模式，默认为 default |

:::

:::details 缓存模式的选项

1. `default`：浏览器默认的缓存行为，通常会根据 HTTP 头部的 `Cache-Control` 来决定是否使用缓存
2. `no-store`：完全不使用缓存，每次请求都会直接向服务器发送
3. `reload`：强制从服务器获取资源，忽略缓存
4. `no-cache`：允许使用缓存，但必须先向服务器验证资源是否已修改
5. `force-cache`：优先使用缓存，如果缓存不存在则从服务器获取

:::

## Request 对象

## Response 对象

## Header 对象
