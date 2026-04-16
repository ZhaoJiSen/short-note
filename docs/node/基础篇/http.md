---
title: http 模块
createTime: 2026/01/14 17:14:05
permalink: /node/zyzfztfm/
---

# http 模块

## http 模块是做什么的

`http` 是 Node.js 内置的应用层模块，基于 TCP 协议构建，提供了创建 HTTP 服务器和发起 HTTP 请求的能力。它是 Node.js 开发 Web 服务的基础，几乎所有 Web 框架（Express、Koa、Nest 等）都底层依赖 `http` 模块。

`http` 模块处理了 HTTP 协议的解析工作——解析请求行、请求头、请求体，并生成对应的响应。相比 `net` 模块，`http` 让开发者无需关心协议细节，直接操作请求和响应对象。

::: tip
实际开发中更常用 Express、Koa 等框架，但理解 `http` 模块有助于理解这些框架的工作原理。
:::

---

## 核心能力概览

`http` 模块的核心能力分为两类：

**服务端**：`http.createServer()` 创建 HTTP 服务器，`http.IncomingMessage` 表示请求，`http.ServerResponse` 表示响应

**客户端**：`http.request()` 发起请求，`http.ClientRequest` 表示客户端请求，`http.IncomingMessage` 也用于接收服务端响应

---

## 创建一个 HTTP 服务

```javascript
import http from 'node:http'

const server = http.createServer((req, res) => {
  // req 是 IncomingMessage
  // res 是 ServerResponse

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello Node.js')
})

server.listen(3000, () => {
  console.log('HTTP 服务启动在 http://localhost:3000')
})
```

请求对象 `req` 包含：

- `req.url`：请求路径和查询参数
- `req.method`：请求方法（GET、POST 等）
- `req.headers`：请求头对象
- `req.on('data', ...)`：接收请求体

响应对象 `res` 包含：

- `res.writeHead(statusCode, headers)`：设置响应状态和头
- `res.write(content)`：写入响应体
- `res.end()`：结束响应

---

## 发起 HTTP 请求

### 发起 GET 请求

```javascript
import http from 'node:http'

const req = http.request('http://example.com', { method: 'GET' }, (res) => {
  console.log('状态码:', res.statusCode)
  console.log('响应头:', res.headers)

  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('响应体:', data)
  })
})

req.on('error', (err) => {
  console.error('请求错误:', err)
})

req.end()
```

### 发起 POST 请求

```javascript
import http from 'node:http'

const data = JSON.stringify({ name: 'test' })

const req = http.request('http://example.com/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  // 处理响应
})

req.write(data)
req.end()
```

也可以使用 `http.get()` 简化 GET 请求：

```javascript
http.get('http://example.com', (res) => {
  // 处理响应
})
```

---

## 常见开发场景

### 简单的 REST API 服务器

```javascript
import http from 'node:http'

const server = http.createServer((req, res) => {
  const { method, url } = req

  if (method === 'GET' && url === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]))
  } else if (method === 'POST' && url === '/api/users') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'created' }))
    })
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

server.listen(8080)
```

### 代理转发请求

```javascript
import http from 'node:http'

http.createServer((req, res) => {
  const options = {
    hostname: 'target-server.com',
    port: 80,
    path: req.url,
    method: req.method,
    headers: req.headers
  }

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
  })

  req.pipe(proxy)
}).listen(3000)
```

### 获取第三方 API

```javascript
import http from 'node:http'

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}
```

---

## http 与 net 模块的关系

| 维度 | net | http |
|------|-----|------|
| 协议层级 | 传输层 | 应用层 |
| 处理内容 | 原始字节流 | HTTP 协议（请求行、头部、正文） |
| 使用场景 | 自定义协议、长连接 | Web 服务、API 调用 |
| 开发难度 | 需要处理协议解析 | API 封装，使用简单 |

`http` 底层基于 `net`。当需要处理自定义协议或需要更高性能时，可以直接使用 `net`；大多数 Web 开发场景直接使用 `http` 或基于它的框架即可。

---

## 易错点与注意事项

::: warning

1. **响应必须结束**：每个请求必须调用 `res.end()` 或 `res.write()` 后自动结束，否则客户端会一直等待。

2. **请求体读取**：POST、PUT 请求的请求体需要通过 `req.on('data', ...)` 和 `req.on('end', ...)` 手动读取。

3. **响应头顺序**：`res.writeHead()` 必须在 `res.write()` 之前调用。

4. **编码问题**：接收响应数据时需要手动处理编码，默认是 Buffer。

5. **keep-alive**：`http` 模块默认启用 keep-alive，如果需要关闭可以在请求选项中设置 `agent: false`。

6. **路径处理**：`http.request` 的 `path` 应包含路径和查询字符串，如 `/api/users?id=1`。

7. **中文乱码**：响应中文内容时确保设置正确的 `Content-Type: text/html; charset=utf-8`。

:::

---

## 总结

`http` 模块是 Node.js Web 开发的基础。核心要点：

- `http.createServer()` 创建服务端，`http.request()` 发起客户端请求
- 请求体需要手动读取，响应必须显式结束
- 实际项目推荐使用框架（Express、Koa），但理解 `http` 有助于 Debug 和性能优化
- `http` 底层基于 `net`，理解两者关系有助于理解 Node.js 网络通信全貌

掌握 `http` 模块是深入 Node.js 后端开发的必经之路。