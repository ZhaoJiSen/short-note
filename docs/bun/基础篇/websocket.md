---
title: Bun 与 WebSocket
createTime: 2026/02/14 10:31:00
permalink: /bun/gn2p8vzm/
---

> [!IMPORTANT]
> Bun 的 WebSocket 模型是“HTTP 握手升级 + 事件回调处理”，并且可以直接用 topic 做房间广播。

## 1. 连接模型

在 Bun 中，WebSocket 一般走这条链路：

1. `fetch` 里校验参数/鉴权。
2. `server.upgrade(req, { data })` 注入连接上下文。
3. 在 `websocket.open/message/close` 处理连接生命周期。

:::table title="WebSocket 生命周期" full-width
| 阶段 | API / 回调 | 典型动作 |
| --- | --- | --- |
| 握手升级 | `server.upgrade(req, { data })` | 鉴权、注入 `userId/roomId` |
| 建立连接 | `open(ws)` | `ws.subscribe(room)`，广播上线 |
| 收到消息 | `message(ws, msg)` | 解析协议并广播/回包 |
| 连接关闭 | `close(ws)` | 清理资源、广播离线 |
:::

## 2. 消息协议建议

实时系统里，建议每条消息都带 `type`，并且服务端先校验再执行。

:::table title="推荐消息格式" full-width
| 字段 | 含义 |
| --- | --- |
| `type` | 消息类型（如 `chat/ping`） |
| `payload` | 业务负载 |
| `time` | 服务端时间戳 |
:::

## 3. 完整示例：房间聊天服务

能力点：
- 按 `room` 分组广播（topic）
- 连接上下文注入（`userId/roomId`）
- 协议校验与错误回包

```ts
type ClientData = {
  userId: string
  roomId: string
}

type Incoming =
  | { type: 'chat'; payload: { text: string } }
  | { type: 'ping' }

function toText(message: string | Buffer | Uint8Array) {
  if (typeof message === 'string') return message
  return Buffer.from(message).toString('utf8')
}

function json(data: unknown) {
  return JSON.stringify(data)
}

const server = Bun.serve<ClientData>({
  port: 3001,

  fetch(req, server) {
    const url = new URL(req.url)

    if (url.pathname !== '/ws') {
      return new Response('Not Found', { status: 404 })
    }

    const roomId = url.searchParams.get('room')?.trim() || 'lobby'
    const userId = url.searchParams.get('user')?.trim() || `guest-${Date.now()}`

    if (server.upgrade(req, { data: { userId, roomId } })) {
      return
    }

    return new Response('Upgrade failed', { status: 400 })
  },

  websocket: {
    open(ws) {
      ws.subscribe(ws.data.roomId)

      ws.publish(
        ws.data.roomId,
        json({
          type: 'system',
          payload: { text: `${ws.data.userId} joined` },
          time: Date.now()
        })
      )
    },

    message(ws, message) {
      const raw = toText(message)

      let parsed: Incoming | null = null
      try {
        parsed = JSON.parse(raw) as Incoming
      } catch {
        ws.send(json({ type: 'error', payload: '消息必须是合法 JSON', time: Date.now() }))
        return
      }

      if (parsed.type === 'ping') {
        ws.send(json({ type: 'pong', time: Date.now() }))
        return
      }

      if (parsed.type === 'chat') {
        const text = parsed.payload?.text?.trim()
        if (!text) {
          ws.send(json({ type: 'error', payload: '文本不能为空', time: Date.now() }))
          return
        }

        if (text.length > 500) {
          ws.send(json({ type: 'error', payload: '文本不能超过 500 字符', time: Date.now() }))
          return
        }

        ws.publish(
          ws.data.roomId,
          json({
            type: 'chat',
            payload: {
              room: ws.data.roomId,
              from: ws.data.userId,
              text
            },
            time: Date.now()
          })
        )
      }
    },

    close(ws) {
      ws.publish(
        ws.data.roomId,
        json({
          type: 'system',
          payload: { text: `${ws.data.userId} left` },
          time: Date.now()
        })
      )
    }
  }
})

console.log(`WebSocket server running at ws://localhost:${server.port}/ws?room=lobby&user=alice`)
```

## 4. 浏览器演示

:::demo
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bun WebSocket Demo</title>
    <style>
      body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 20px; }
      input, button { padding: 8px; margin-right: 8px; }
      #log { margin-top: 12px; white-space: pre-wrap; background: #f3f4f6; border-radius: 8px; padding: 12px; }
    </style>
  </head>
  <body>
    <input id="msg" placeholder="输入消息" />
    <button id="send">发送</button>
    <button id="ping">Ping</button>
    <div id="log">连接中...</div>

    <script>
      const log = document.getElementById('log')
      const msg = document.getElementById('msg')
      const send = document.getElementById('send')
      const ping = document.getElementById('ping')

      const ws = new WebSocket('ws://localhost:3001/ws?room=lobby&user=browser-demo')

      ws.onopen = () => {
        log.textContent += '\n[open] connected'
      }

      ws.onmessage = (event) => {
        log.textContent += `\n[message] ${event.data}`
      }

      send.addEventListener('click', () => {
        const text = msg.value.trim()
        if (!text) return

        ws.send(JSON.stringify({ type: 'chat', payload: { text } }))
        msg.value = ''
      })

      ping.addEventListener('click', () => {
        ws.send(JSON.stringify({ type: 'ping' }))
      })
    </script>
  </body>
</html>
```
:::

## 5. 最佳实践

- 协议先设计（`type + payload`），再写业务逻辑。
- 在 `upgrade` 阶段完成鉴权和上下文注入，避免后续重复查库。
- 广播按 topic/room 分组，不要默认全量推送。
- 对消息大小、频率做限制，防止恶意连接拖垮服务。

::::collapse
- :+ 线上排查优先级

  1. 连接数是否持续增长（是否有泄漏）。
  2. 大消息与高频消息是否被限制。
  3. 广播是否误发到全局而不是房间。
::::
