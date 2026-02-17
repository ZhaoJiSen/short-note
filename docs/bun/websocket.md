---
title: Bun 与 WebSocket
createTime: 2026/02/14 10:31:00
permalink: /bun/bun/crud/gn2p8vzm/
---

## 基础篇

### WebSocket 在 Bun 里的模型

Bun 通过 `Bun.serve` 同时支持 HTTP 与 WebSocket：

- 在 `fetch` 中调用 `server.upgrade(req, { data })`
- 在 `websocket` 对象中处理 `open/message/close`

:::table title="WebSocket 生命周期" full-width
| 阶段 | 回调 | 典型动作 |
| --- | --- | --- |
| 握手升级 | `server.upgrade` | 校验 token、注入连接上下文 |
| 连接建立 | `open` | 加入房间、广播上线 |
| 消息处理 | `message` | 解析协议、转发消息 |
| 连接关闭 | `close` | 清理连接资源 |
:::

### 连接上下文

`server.upgrade` 的 `data` 字段可以存储连接上下文（如用户 id、房间号），后续在回调中直接读取。

## 进阶篇

::: card title="实时系统的核心" icon="material-icon-theme:console"
实时系统最怕“连接泄漏”和“协议失控”，要把连接管理和消息协议作为一等公民设计。
:::

:::collapse
- :+ 消息协议建议

  每条消息包含 `type` 与 `payload`，服务端先校验再执行。

- 广播策略

  区分“全局广播”和“房间广播”，不要默认发给所有人。

- 错误处理

  协议非法时返回错误事件，不要直接断开连接。
:::

## 完整代码示例

```ts
type ClientData = {
  clientId: string;
};

type ChatMessage = {
  type: 'chat';
  payload: {
    text: string;
  };
};

const clients = new Set<ServerWebSocket<ClientData>>();

const server = Bun.serve<ClientData>({
  port: 3001,

  fetch(req, server) {
    const { pathname, searchParams } = new URL(req.url);

    if (pathname !== '/ws') {
      return new Response('Not Found', { status: 404 });
    }

    // 从查询参数读取 clientId
    const clientId = searchParams.get('clientId') ?? `guest-${Date.now()}`;

    // 升级到 WebSocket，并注入连接上下文
    if (server.upgrade(req, { data: { clientId } })) {
      return; // upgrade 成功时返回 undefined
    }

    return new Response('Upgrade failed', { status: 400 });
  },

  websocket: {
    open(ws) {
      clients.add(ws);
      ws.send(JSON.stringify({ type: 'system', payload: `${ws.data.clientId} joined` }));
    },

    message(ws, message) {
      const text = typeof message === 'string' ? message : Buffer.from(message).toString('utf8');

      let parsed: ChatMessage | null = null;
      try {
        parsed = JSON.parse(text) as ChatMessage;
      } catch {
        ws.send(JSON.stringify({ type: 'error', payload: '消息必须是合法 JSON' }));
        return;
      }

      if (parsed.type !== 'chat' || !parsed.payload?.text?.trim()) {
        ws.send(JSON.stringify({ type: 'error', payload: '非法消息格式' }));
        return;
      }

      // 广播给所有客户端
      const outgoing = JSON.stringify({
        type: 'chat',
        payload: {
          from: ws.data.clientId,
          text: parsed.payload.text.trim(),
          time: new Date().toISOString(),
        },
      });

      for (const client of clients) {
        client.send(outgoing);
      }
    },

    close(ws) {
      clients.delete(ws);
    },
  },
});

console.log(`WebSocket server running at ws://localhost:${server.port}/ws`);
```

## 代码演示

::: demo
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bun WebSocket Demo</title>
    <style>
      body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 20px; }
      input, button { padding: 8px; }
      #log { margin-top: 12px; background: #f3f4f6; border-radius: 8px; padding: 12px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <input id="msg" placeholder="输入消息" />
    <button id="send">发送</button>
    <div id="log">连接中...</div>

    <script>
      const log = document.getElementById("log");
      const msg = document.getElementById("msg");
      const send = document.getElementById("send");

      const ws = new WebSocket("ws://localhost:3001/ws?clientId=browser-demo");

      ws.onopen = () => {
        log.textContent += "\n[open] connected";
      };

      ws.onmessage = (event) => {
        log.textContent += `\n[message] ${event.data}`;
      };

      send.addEventListener("click", () => {
        const text = msg.value.trim();
        if (!text) return;

        ws.send(JSON.stringify({ type: "chat", payload: { text } }));
        msg.value = "";
      });
    </script>
  </body>
</html>
```
:::

## 最佳实践

- 为每条消息定义 schema，先校验再处理。
- 连接集合变化（open/close）要确保成对维护。
- 对广播逻辑做限流和消息大小限制。
- 记录连接数、发送失败数、平均消息延迟等指标。

## 常见错误

- 忘记在 `close` 清理连接，长期运行后内存增长。
- 消息体无校验，导致服务端异常或注入风险。
- 大广播无节制，拖垮单机吞吐。

