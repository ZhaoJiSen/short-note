---
title: net 模块
createTime: 2026/04/16 22:55:30
permalink: /node/76zcct25/
---

# net 模块

## net 模块是做什么的

`net` 是 Node.js 中最底层的网络模块之一，基于 TCP 协议。HTTP、WebSocket、gRPC 等所有建立在 TCP 之上的应用层协议，其底层通信能力都源自 `net`。

从协议分层来看，TCP 位于传输层，而 HTTP 位于应用层。`net` 提供的是传输层能力，不关心业务数据是什么格式，只负责把数据可靠地从一端传到另一端。

::: tip
可以把 `net` 理解为「手写 HTTP 之前的那一层能力」。理解 `net` 有助于理解整个 Node.js 网络通信的底层逻辑。
:::

---

## TCP 通信在 Node 中的基本流程

TCP 通信涉及两个角色：服务端和客户端。基本流程如下：

1. **服务端创建 server**：调用 `net.createServer()` 创建一个 TCP 服务器
2. **监听端口**：调用 `server.listen()` 开始监听指定端口
3. **客户端建立连接**：客户端通过 `net.createConnection()` 发起 TCP 连接
4. **建立 socket**：连接建立后，服务端生成一个 `socket` 对象用于与该客户端通信
5. **数据传输**：通过 `socket.on('data', ...)` 接收数据，通过 `socket.write()` 发送数据
6. **连接关闭**：数据传输完成或一方主动断开时，触发 `end` 事件

这个流程是理解所有基于 TCP 的上层协议的基础。

---

## 核心对象

### net.createServer

`net.createServer()` 用于创建 TCP 服务器。它接收一个回调函数，每当有客户端连接时，回调函数会收到一个 `socket` 对象。

```javascript
const server = net.createServer((socket) => {
  // 处理连接
})
```

### socket

`socket` 是 TCP 连接的核心抽象。每个客户端连接对应一个 `socket` 对象，通过它可以：

- 读取数据：`socket.on('data', ...)`
- 发送数据：`socket.write(...)`
- 获取连接信息：`socket.remoteAddress`、`socket.remotePort`
- 主动关闭连接：`socket.end()`

---

## 创建一个 TCP 服务

```javascript
import net from 'node:net'

const server = net.createServer((socket) => {
  console.log('客户端连接:', socket.remoteAddress)

  socket.on('data', (data) => {
    console.log('收到数据:', data.toString())
    socket.write('服务端已收到')
  })

  socket.on('end', () => {
    console.log('连接关闭')
  })
})

server.listen(3000, () => {
  console.log('TCP 服务启动在 3000 端口')
})
```

几点说明：

- `data` 事件收到的 `data` 是 `Buffer`，需要手动调用 `toString()` 转换
- `socket.write()` 用于向客户端发送响应
- 服务端可以同时处理多个客户端连接，每个连接对应独立的 `socket`

---

## 创建一个客户端连接

```javascript
import net from 'node:net'

const client = net.createConnection({ port: 3000 }, () => {
  console.log('已连接到服务端')
  client.write('hello server')
})

client.on('data', (data) => {
  console.log('收到回复:', data.toString())
  client.end()
})

client.on('close', () => {
  console.log('连接已关闭')
})
```

客户端通过 `createConnection` 连接到服务端，连接建立后发送数据，收到服务端响应后主动关闭连接。

---

## 常见开发场景

### 自定义协议开发

当需要实现 RPC、消息队列、私有通信协议等场景时，`net` 是最合适的选择。开发者需要自己定义数据格式和解析规则。

```javascript
// 简单的换行分隔协议
socket.on('data', (data) => {
  const messages = data.toString().split('\n')
  messages.forEach(msg => {
    if (msg) handleMessage(msg)
  })
})
```

### 长连接服务

即时通讯、游戏服务器、实时推送等场景需要保持客户端与服务端的长连接。TCP 天生适合这类场景。

```javascript
// 保持连接，定期发送心跳
setInterval(() => {
  if (socket.writable) {
    socket.write('ping')
  }
}, 30000)
```

### 理解 HTTP / WebSocket 底层

学习 `net` 能帮助理解 HTTP 和 WebSocket 的工作原理。HTTP 本质上是建立在 TCP 之上的请求-响应协议，WebSocket 则是升级后的全双工通信协议。

---

## net 与 http 模块的关系

| 维度 | net | http |
|------|-----|------|
| 协议层级 | 传输层（TCP） | 应用层 |
| 协议处理 | 不处理，需要自行设计 | 自动解析请求/响应 |
| 使用难度 | 高，需要处理粘包等 | 低，API 封装完善 |
| 适用场景 | 自定义协议、长连接 | Web 服务、API 服务 |

`http` 模块底层基于 `net`，它帮开发者处理了请求行、请求头、请求体等协议解析工作。如果不需要这些，自动解析反而是负担。

---

## 易错点与注意事项

::: warning

1. **Buffer 编码**：`data` 事件收到的数据是 `Buffer`，需要根据实际编码（如 `utf8`、`gbk`）手动转换。

2. **粘包/拆包**：TCP 是流式协议，没有消息边界。一次 `data` 事件可能包含多条消息，也可能是半条消息。需要在应用层自行设计消息分隔规则（如固定长度、换行符、JSON 长度前缀）。

3. **资源泄漏**：每个 `socket` 对应一个文件描述符，连接关闭后必须正确释放。长时间运行的服务端应监控连接状态，及时清理死连接。

4. **协议设计**：`net` 不提供任何协议支持，数据格式完全由开发者定义。设计不当会导致通信双方无法正确解析。

5. **不要当 HTTP 用**：`net` 不会解析 HTTP 请求行和头部，直接写 HTTP 格式字符串也可以通信，但这不是它的设计目标。

:::

---

## 总结

`net` 是 Node.js 网络通信的底层能力，所有基于 TCP 的上层协议都建立在它之上。实际业务开发中多数直接使用 `http` 或框架，但理解 `net` 能够：

- 理解网络通信的底层逻辑
- 自定义高性能通信协议
- 更好地调试和排查网络问题
- 为学习 WebSocket、gRPC 等打下基础

掌握 `net` 是深入 Node.js 网络编程的关键入口。