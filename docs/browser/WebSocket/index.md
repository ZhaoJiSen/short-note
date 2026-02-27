---
title: WebSocket
createTime: 2026/02/27 00:28:20
permalink: /browser/150p4d3o/
---

[+全双工]: 客户端与服务端都可以主动发送消息，通信方向是双向的。
[+心跳]: 应用层保活机制，常见做法是定期 `ping/pong`。
[+回压]: 发送速度 > 接收速度时产生的数据堆积问题。

::: card title="WebSocket 章节导读" icon="material-icon-theme:console"
WebSocket 适合==低延迟、频繁交互、服务端主动推送==场景。学习重点不是 API 本身，而是连接生命周期、协议设计、鉴权、心跳与重连。
:::

## 1. WebSocket 是什么

WebSocket 是建立在 TCP 之上的应用层协议。通过 HTTP `Upgrade` 握手后，连接会从“请求-响应”转为长期双向通道。

- 特点：全双工[+全双工]、低额外头开销、服务端可主动推送。
- 适用：聊天、协同编辑、行情推送、在线状态。
- 不适用：低频请求、强缓存 REST 接口。

:::table full-width

| 方案 | 通信方向 | 实时性 | 复杂度 | 典型场景 |
| --- | --- | --- | --- | --- |
| 轮询（Polling） | 客户端单向拉取 | 低 | 低 | 低频状态查询 |
| SSE | 服务端 -> 客户端 | 中高 | 中 | 通知流、日志流 |
| WebSocket | 双向 | 高 | 中高 | 聊天、协同、实时控制 |

:::

## 2. 握手与生命周期

```mermaid
sequenceDiagram
  participant C as Client
  participant S as Server

  C->>S: HTTP GET + Upgrade: websocket
  S-->>C: 101 Switching Protocols
  C<->>S: 双向消息帧（Text/Binary/Ping/Pong/Close）
  C-->>S: Close
  S-->>C: Close
```

:::table title="连接生命周期" full-width
| 阶段 | 浏览器侧 | 服务端侧 | 关注点 |
| --- | --- | --- | --- |
| 建连前 | new WebSocket(url) | 校验 Origin / Token | 鉴权与来源控制 |
| 连接建立 | `onopen` | `connection/open` | 会话初始化、订阅房间 |
| 消息传输 | `onmessage` / `send` | `message` / `send` | 协议校验、限流、回压 |
| 保活检测 | 业务心跳 | ping/pong | 断线探测、资源清理 |
| 连接关闭 | `onclose` | `close` | 重连策略、状态恢复 |
:::

## 3. 完整案例：最小可运行聊天

### 3.1 服务端（Node + ws）

```js
// server.js
// 运行：npm i ws && node server.js
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 3001 })

// 简单房间结构：room -> Set<socket>
const rooms = new Map()

function joinRoom(room, socket) {
  if (!rooms.has(room)) rooms.set(room, new Set())
  rooms.get(room).add(socket)
}

function leaveRoom(room, socket) {
  const set = rooms.get(room)
  if (!set) return
  set.delete(socket)
  if (set.size === 0) rooms.delete(room)
}

function broadcast(room, payload) {
  const set = rooms.get(room)
  if (!set) return
  const text = JSON.stringify(payload)
  for (const client of set) {
    // 1 代表 OPEN
    if (client.readyState === 1) client.send(text)
  }
}

wss.on('connection', (socket, req) => {
  const url = new URL(req.url, 'ws://localhost:3001')

  // 1) 鉴权（示例）：必须带 token
  const token = url.searchParams.get('token')
  if (token !== 'demo-token') {
    socket.close(1008, 'unauthorized')
    return
  }

  // 2) 房间和用户
  const room = url.searchParams.get('room') || 'lobby'
  const user = url.searchParams.get('user') || `guest-${Date.now()}`

  joinRoom(room, socket)

  broadcast(room, {
    type: 'system',
    payload: `${user} joined ${room}`,
    time: Date.now(),
  })

  socket.on('message', (raw) => {
    let parsed = null
    try {
      parsed = JSON.parse(String(raw))
    } catch {
      socket.send(JSON.stringify({ type: 'error', payload: 'invalid json' }))
      return
    }

    // 3) 协议校验
    if (parsed.type === 'chat') {
      const text = String(parsed.payload?.text || '').trim()
      if (!text) return

      broadcast(room, {
        type: 'chat',
        payload: { from: user, text },
        time: Date.now(),
      })
      return
    }

    if (parsed.type === 'ping') {
      socket.send(JSON.stringify({ type: 'pong', time: Date.now() }))
    }
  })

  socket.on('close', () => {
    leaveRoom(room, socket)
    broadcast(room, {
      type: 'system',
      payload: `${user} left ${room}`,
      time: Date.now(),
    })
  })
})

console.log('ws://localhost:3001')
```

### 3.2 浏览器客户端

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>WebSocket Chat</title>
  </head>
  <body>
    <input id="text" placeholder="输入消息" />
    <button id="send">发送</button>
    <button id="ping">Ping</button>
    <pre id="log"></pre>

    <script>
      const logEl = document.getElementById('log')
      const textEl = document.getElementById('text')

      function log(line) {
        logEl.textContent += `\n${line}`
      }

      const ws = new WebSocket(
        'ws://localhost:3001?room=lobby&user=zhaojisen&token=demo-token',
      )

      ws.onopen = () => log('[open] connected')
      ws.onclose = (e) => log(`[close] code=${e.code} reason=${e.reason}`)
      ws.onerror = () => log('[error] connection error')

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.type === 'chat') {
          log(`[chat] ${msg.payload.from}: ${msg.payload.text}`)
        } else {
          log(`[${msg.type}] ${JSON.stringify(msg.payload ?? msg)}`)
        }
      }

      document.getElementById('send').onclick = () => {
        const text = textEl.value.trim()
        if (!text) return

        ws.send(JSON.stringify({
          type: 'chat',
          payload: { text },
        }))

        textEl.value = ''
      }

      document.getElementById('ping').onclick = () => {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    </script>
  </body>
</html>
```

## 4. 协议设计建议

:::table full-width

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `type` | 消息类型 | 必填，决定分支处理 |
| `payload` | 业务数据 | 按 `type` 校验结构 |
| `traceId` | 链路追踪 id | 排障时很关键 |
| `time` | 服务端时间戳 | 便于排序和延迟统计 |

:::

:::tip
不要直接把“任意对象”发给客户端，建议固定协议结构，并对长度、字段类型做白名单校验。
:::

## 5. 心跳、重连与断线恢复

### 5.1 客户端重连封装（含注释）

```js
class ReconnectWS {
  constructor(url, options = {}) {
    this.url = url
    this.maxRetries = options.maxRetries ?? 8
    this.retry = 0
    this.heartbeatMs = options.heartbeatMs ?? 15000
    this.ws = null
    this.heartbeatTimer = null
    this.reconnectTimer = null
    this.onMessage = options.onMessage ?? (() => {})
  }

  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.retry = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (e) => {
      // 收到 pong 也会经过这里
      this.onMessage(e)
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this.reconnect()
    }

    this.ws.onerror = () => {
      // 交给 onclose 统一重连
      this.ws?.close()
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.heartbeatMs)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  reconnect() {
    if (this.retry >= this.maxRetries) return

    // 指数退避，避免雪崩重连
    const delay = Math.min(1000 * 2 ** this.retry, 15000)
    this.retry += 1

    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  send(data) {
    if (this.ws?.readyState !== WebSocket.OPEN) return false
    this.ws.send(JSON.stringify(data))
    return true
  }
}
```

### 5.2 服务端心跳（Node ws）

```js
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 3002 })

wss.on('connection', (ws) => {
  ws.isAlive = true

  ws.on('pong', () => {
    // 收到 pong 说明连接还活着
    ws.isAlive = true
  })
})

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      ws.terminate() // 长时间无响应，主动清理僵尸连接
      return
    }

    ws.isAlive = false
    ws.ping()
  })
}, 30000)
```

## 6. WebSocket 安全与稳定性基线

:::table full-width

| 维度 | 基线策略 |
| --- | --- |
| 鉴权 | 连接时校验 Token，失效立即断开 |
| 来源控制 | 校验 `Origin`，拒绝非白名单来源 |
| 消息校验 | 校验 `type/payload` 结构和字段长度 |
| 频率限制 | 单连接限流，防止刷消息 |
| 回压控制 | 监控发送队列，超过阈值降级或断开 |
| 观测性 | 打点连接数、失败率、重连率、消息延迟 |

:::

::::details 关闭码（Close Code）常见含义

- `1000`：正常关闭
- `1001`：服务端下线或页面离开
- `1006`：异常断开（浏览器侧常见）
- `1008`：策略违规（如鉴权失败）
- `1011`：服务端内部错误

::::

:::::collapse
- :+ 线上排查顺序

  1. 先看连接状态：建连成功率、断线原因、重连频率。
  2. 再看消息链路：消息积压、延迟、丢失、重复消费。
  3. 最后看资源与安全：CPU、内存、连接数上限、异常来源 IP。
::::

## 7. 浏览器侧可运行 Demo

:::demo
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>WebSocket Demo</title>
    <style>
      body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; }
      input, button { margin-right: 8px; }
      #log { margin-top: 10px; background: #f3f4f6; padding: 10px; border-radius: 8px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <input id="msg" placeholder="输入消息" />
    <button id="send">发送</button>
    <div id="log">准备连接...</div>

    <script>
      const log = document.getElementById('log')
      const msg = document.getElementById('msg')
      const send = document.getElementById('send')

      // 需要本地先启动 ws://localhost:3001
      const ws = new WebSocket('ws://localhost:3001?room=lobby&user=demo&token=demo-token')

      ws.onopen = () => {
        log.textContent += '\n[open] connected'
      }

      ws.onmessage = (event) => {
        log.textContent += `\n[message] ${event.data}`
      }

      ws.onclose = () => {
        log.textContent += '\n[close] disconnected'
      }

      send.onclick = () => {
        const text = msg.value.trim()
        if (!text) return

        ws.send(JSON.stringify({ type: 'chat', payload: { text } }))
        msg.value = ''
      }
    </script>
  </body>
</html>
```
:::
