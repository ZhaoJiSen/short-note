---
title: WebSocket
createTime: 2026/02/27 00:28:20
permalink: /browser/150p4d3o/
---

[+回压]: 发送速度 > 接收速度时产生的数据堆积问题。

WebSocket 是建立在 TCP 之上的应用层协议。通过 HTTP `Upgrade` 握手后，连接会从 "请求-响应" 转为长期双向通道。因此 WebSocket 特别适用于聊天、协同编辑、行情推送等场景

:::info
WebSocket 是全双工通信， 客户端与服务端都可以主动发送消息，通信方向是双向的
:::

## 连接状态

`WebSocket` 在浏览器里有 4 种连接状态

:::table full-width

| 常量 | 数值 | 含义 | 常见时机 |
| --- | --- | --- | --- |
| `WebSocket.CONNECTING` | `0` | 正在连接 | 刚 `new WebSocket(url)` |
| `WebSocket.OPEN` | `1` | 连接已建立，可收发消息 | `onopen` 之后 |
| `WebSocket.CLOSING` | `2` | 正在关闭 | 调用 `close()` 后到真正关闭前 |
| `WebSocket.CLOSED` | `3` | 连接已关闭 | `onclose` 之后 |

:::

正常状态下，状态流转通常是：`CONNECTING(0) -> OPEN(1) -> CLOSING(2) -> CLOSED(3)`。如果握手失败或网络出现问题也可能出现：`CONNECTING(0) -> CLOSED(3)`

在实际开发中，最好总是先判断是否处于 `OPEN` 状态，避免在握手中或断开后发送导致异常

```ts
function safeSend(ws, data) {
  if (ws.readyState !== WebSocket.OPEN) {
    return false
  }
  ws.send(JSON.stringify(data))
  return true
}
```

## API

### 构造函数

浏览器端通过 `new WebSocket(...)` 发起握手

```js
const ws = new WebSocket('wss://example.com/socket?token=xxx')
// 可选：传子协议数组
// const ws = new WebSocket('wss://example.com/socket', ['json.v1'])
```

### 常用属性

连接建立后，通常使用如下属性来获取连接状态、协商结果、发送队列等核心信息

:::table full-width

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `ws.readyState` | `number` | 当前连接状态（`0/1/2/3`） |
| `ws.url` | `string` | 当前连接 URL |
| `ws.protocol` | `string` | 与服务端协商后的子协议 |
| `ws.extensions` | `string` | 与服务端协商后的扩展 |
| `ws.binaryType` | `'blob' \| 'arraybuffer'` | 二进制消息的接收类型 |
| `ws.bufferedAmount` | `number` | 已调用 `send` 但尚未发出的字节数 |

:::

### 方法

方法层面非常集中，核心就是 `send` 和 `close`

:::table full-width

| 方法 | 作用 | 使用建议 |
| --- | --- | --- |
| `ws.send(data)` | 发送文本或二进制数据 | 先判断 `readyState === WebSocket.OPEN` |
| `ws.close(code?, reason?)` | 主动关闭连接 | 正常关闭建议 `1000` |

:::

```js
if (ws.readyState === WebSocket.OPEN) {
  ws.send(JSON.stringify({ type: 'chat', payload: { text: 'hello' } }))
}

ws.close(1000, 'normal close')
```

### 事件

:::table full-width

| 事件 | 触发时机 | 常见用途 |
| --- | --- | --- |
| `open` | 握手成功后 | 初始化会话、重置重连计数 |
| `message` | 收到服务端消息 | 协议分发、更新 UI |
| `error` | 连接或传输异常 | 记录日志，交给 `close` 做收口 |
| `close` | 连接关闭 | 清理资源、触发重连 |

:::

```js
ws.addEventListener('open', () => {
  console.log('connected')
})

ws.addEventListener('message', (event) => {
  console.log('message:', event.data)
})

ws.addEventListener('error', (event) => {
  console.error('ws error', event)
})

ws.addEventListener('close', (event) => {
  console.log('closed', event.code, event.reason)
})
```

## 心跳机制

心跳机制的核心目的是保持长连接稳定，避免连接被意外断开，最常见的实现是通过客户端定时发送 `ping`，服务端回复 `pong` 来实现

:::::steps

1. 定义心跳参数和定时器状态

   目的：把 "发送频率" 和 "超时阈值" 配置化，避免硬编码散落在代码里

   ```ts
   const HEARTBEAT_INTERVAL = 15000
   const HEARTBEAT_TIMEOUT = 10000

   let heartbeatTimer: ReturnType<typeof setInterval> | null = null
   let pongTimeoutTimer: ReturnType<typeof setTimeout> | null = null
   ```

2. 封装 `sendPing`，发送探测并开启超时检测

   目的：每次发 `ping` 后都开启一次 "等待 `pong`" 倒计时；如果超时，主动关闭连接触发重连流程

   ```ts
   function sendPing(ws: WebSocket) {
     ws.send(JSON.stringify({ type: 'ping', at: Date.now() }))

     // 如果存在 pongTimeoutTimer 则清除并重新设置超时时间
     if (pongTimeoutTimer) clearTimeout(pongTimeoutTimer)

     pongTimeoutTimer = setTimeout(() => {
       // 如果超时，主动关闭连接触发重连流程
       ws.close(4000, 'heartbeat timeout')
     }, HEARTBEAT_TIMEOUT)
   }
   ```

3. 封装 `startHeartbeat` / `stopHeartbeat`

   目的：统一管理定时器生命周期，避免重复启动导致多个心跳并发，或断开后定时器泄漏

   ```ts
   function startHeartbeat(ws: WebSocket) {
     stopHeartbeat()

     // 不间断发送心跳
     heartbeatTimer = setInterval(() => {
       if (ws.readyState === WebSocket.OPEN) {
         sendPing(ws)
       }
     }, HEARTBEAT_INTERVAL)
   }

   function stopHeartbeat() {
     if (heartbeatTimer) clearInterval(heartbeatTimer)
     if (pongTimeoutTimer) clearTimeout(pongTimeoutTimer)

     heartbeatTimer = null
     pongTimeoutTimer = null
   }
   ```

4. 在消息处理里消费 `pong`

   目的：收到 `pong` 即表示连接当前可用，应立即取消超时关闭任务

   ```ts
   function handleHeartbeatMessage(raw: string) {
     const msg = JSON.parse(raw)
     if (msg.type === 'pong') {
       if (pongTimeoutTimer) clearTimeout(pongTimeoutTimer)
       pongTimeoutTimer = null
       return true
     }
     return false
   }
   ```

5. 接入连接生命周期

   目的：只在连接可用期间保活；断开时立即清理，避免无意义任务占用资源

   ```ts
   ws.onopen = () => {
     startHeartbeat(ws)
   }

   ws.onclose = () => {
     stopHeartbeat()
   }

   ws.onmessage = (e) => {
     if (handleHeartbeatMessage(String(e.data))) return
     // 其他业务消息
   }
   ```

:::::

## 重连与断线恢复

[+指数退避重连]: "退避" 是指失败后先 "后退一步，等更久再试"，而 "指数" 是指它的等待时间按 "指数" 增长，而不是线性增长

重连的核心是 "让连接可持续可恢复"，断线恢复的核心是 "让业务状态不中断"。需要处理重新建立连接，还要处理消息补发、鉴权恢复和订阅恢复

:::::steps

1. 明确机制边界

   目标分两层：

   - 链路层：断线自动重连（指数退避 + 抖动 + 上限）
   - 业务层：重连后恢复会话（鉴权消息、订阅消息、待发送队列）

2. 类型与配置

   :::code-tabs
   @tab reliable-ws.d.ts

   ```ts
   type ReliableStatus =
    | 'idle'
    | 'connecting'
    | 'open'
    | 'reconnecting'
    | 'closed';

   interface ReliableWSOptions<TOutgoing = unknown, TIncoming = unknown> {
      // 连接 URL
      url: string;

      // 子协议
      protocols?: string | string[];

      // 最大重连次数
      maxRetries?: number;

      // 第一次重连的基础等待时间
      baseDelay?: number;

      // 最大重连等待时间
      maxDelay?: number;

      // 随机抖动，避免大量客户端同一时刻重连
      jitter?: number;

      // 离线队列
      queueLimit?: number;

      // 发送间隔
      heartbeatInterval?: number;

      // 等待 pong 超时
      heartbeatTimeout?: number;

      // 重连后重新鉴权
      getAuthPayload?: () => TOutgoing | null;

      // 重连后重新订阅
      getResubscribePayloads?: () => TOutgoing[];

      // 事件回调
      onMessage?: (message: TIncoming, event: MessageEvent) => void;
      onStatusChange?: (status: ReliableStatus) => void;
    }
   ```

   :::

3. 连接与事件绑定

   :::details 核心流程
   1. `connect()` 创建原生 WebSocket 并绑定四个事件
   2. `onopen` 连接成功后 → 重置重试计数 → 启动心跳 → 恢复会话（鉴权+重订阅） → 刷出离线队列
   3. `onmessage` 先检查是否是心跳 pong 回应，如果不是则解析 JSON 后交给用户回调
   4. `onerror` 不单独处理，直接关闭连接，统一由 onclose 触发重连，避免重复处理
   5. `onclose` 如果是手动关闭则标记 closed；否则进入重连调度
   :::

   ```ts
   connect() {
      this.manualClose = false;
      this.clearReconnectTimer();
      this.updateStatus(this.retryCount > 0 ? 'reconnecting' : 'connecting');

      this.ws = new WebSocket(this.opts.url, this.opts.protocols);

      this.ws.onopen = () => {
        this.retryCount = 0;
        this.updateStatus('open');
        this.startHeartbeat();
        this.restoreSession();
        this.flushQueue();
      };

      this.ws.onmessage = (event) => {
        if (this.consumePong(event)) return;
        const parsed = this.parseMessage(event.data);
        if (parsed.ok) {
          this.opts.onMessage?.(parsed.value as TIncoming, event);
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        if (this.manualClose) {
          this.updateStatus('closed');
          return;
        }
        this.scheduleReconnect();
      };
   }
   ```

4. 发送与离线队列

   ```ts
    send(data: TOutgoing) {
      const text = JSON.stringify(data);

      // 连接可用时直接发送
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(text);
        return true;
      }

      // 超出限制自动移除最早的消息
      if (this.queue.length >= (this.opts.queueLimit ?? 100)) {
        this.queue.shift();
      }

      // 连接不可用时放入离线队列，等待重连后补发
      this.queue.push(text);
      return false;
   }
   ```

5. 指数退避重连[+指数退避重连]

   延迟公式: `min(baseDelay × 2^attempt, maxDelay) + random(0, jitter)`

   默认值下的重连间隔大约为：1s → 2s → 4s → 8s → 16s → 30s → 30s → 30s（最多 8 次）

   ```ts
   private scheduleReconnect() {
      const maxRetries = this.opts.maxRetries ?? 8;

      // 超过最大重连次数，标记为 closed 并返回
      if (this.retryCount >= maxRetries) {
        this.updateStatus('closed');
        return;
      }

      // 计算重连延迟，并更新重试计数和状态
      const delay = this.calcDelay(this.retryCount);
      this.retryCount += 1;
      this.updateStatus('reconnecting');
      this.reconnectTimer = setTimeout(() => this.connect(), delay);
    }

    private calcDelay(attempt: number) {
      const baseDelay = this.opts.baseDelay ?? 1000;
      const maxDelay = this.opts.maxDelay ?? 30000;
      const jitter = this.opts.jitter ?? 300;

      const exp = Math.min(baseDelay * 2 ** attempt, maxDelay);
      return exp + Math.floor(Math.random() * jitter);
    }
   ```

6. 心跳

   ```ts
   private startHeartbeat() {
      this.stopHeartbeat();
      const interval = this.opts.heartbeatInterval ?? 15000;

      this.heartbeatTimer = setInterval(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify({ type: 'ping', at: Date.now() }));
        this.armPongDeadline();
      }, interval);
    }

   private armPongDeadline() {
      if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer);
      const timeout = this.opts.heartbeatTimeout ?? 8000;
      this.pongTimeoutTimer = setTimeout(() => {
        this.ws?.close(4000, 'heartbeat timeout');
      }, timeout);
   }

   private consumePong(event: MessageEvent) {
      const parsed = this.parseMessage(event.data);
      if (!parsed.ok) return false;

      const payload = parsed.value as { type?: string };
      if (payload?.type !== 'pong') return false;

      if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer);
      this.pongTimeoutTimer = null;
      return true;
   }
   ```

7. 其余代码

   ```ts
   close(code = 1000, reason = 'manual close') {
      this.manualClose = true;
      this.clearReconnectTimer();
      this.stopHeartbeat();
      this.ws?.close(code, reason);
      this.ws = null;
      this.updateStatus('closed');
   }

   private restoreSession() {
      const authMsg = this.opts.getAuthPayload?.();
      if (authMsg) this.send(authMsg);

      const subscriptions = this.opts.getResubscribePayloads?.() ?? [];
      for (const msg of subscriptions) {
        this.send(msg);
      }
   }

   // 使用 while + 条件检查，保证一旦连接断了就停止发送，剩余消息继续留在队列里，等下次重连成功后再发
   // 使用 queue.shift() 可以保证发一条删一条
   private flushQueue() {
      while (this.queue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(this.queue.shift()!);
      }
   }

   private parseMessage(raw: unknown): { ok: true; value: unknown } | { ok: false } {
      if (typeof raw !== 'string') return { ok: false };
      try {
        return { ok: true, value: JSON.parse(raw) };
      } catch {
        return { ok: false };
      }
   }

   private stopHeartbeat() {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer);
      this.heartbeatTimer = null;
      this.pongTimeoutTimer = null;
   }

   private clearReconnectTimer() {
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
   }

   private updateStatus(status: ReliableStatus) {
      this.opts.onStatusChange?.(status);
   }
   ```

8. 完整代码

   :::code-tabs
   @tab reliable-ws.ts

   ```ts
   type ReliableStatus =
     | 'idle'
     | 'connecting'
     | 'open'
     | 'reconnecting'
     | 'closed'

   interface ReliableWSOptions<TOutgoing = unknown, TIncoming = unknown> {
     url: string
     protocols?: string | string[]
     maxRetries?: number
     baseDelay?: number
     maxDelay?: number
     jitter?: number
     queueLimit?: number
     heartbeatInterval?: number
     heartbeatTimeout?: number
     getAuthPayload?: () => TOutgoing | null
     getResubscribePayloads?: () => TOutgoing[]
     onMessage?: (message: TIncoming, event: MessageEvent) => void
     onStatusChange?: (status: ReliableStatus) => void
   }

   export class ReliableWS<TOutgoing = unknown, TIncoming = unknown> {
     private ws: WebSocket | null = null
     private reconnectTimer: ReturnType<typeof setTimeout> | null = null
     private heartbeatTimer: ReturnType<typeof setInterval> | null = null
     private pongTimeoutTimer: ReturnType<typeof setTimeout> | null = null
     private retryCount = 0
     private manualClose = false
     private readonly queue: string[] = []

     constructor(private readonly opts: ReliableWSOptions<TOutgoing, TIncoming>) {}

     connect() {
       this.manualClose = false
       this.clearReconnectTimer()
       this.updateStatus(this.retryCount > 0 ? 'reconnecting' : 'connecting')

       this.ws = new WebSocket(this.opts.url, this.opts.protocols)

       this.ws.onopen = () => {
         this.retryCount = 0
         this.updateStatus('open')
         this.startHeartbeat()
         this.restoreSession()
         this.flushQueue()
       }

       this.ws.onmessage = (event) => {
         if (this.consumePong(event)) return
         const parsed = this.parseMessage(event.data)
         if (parsed.ok) {
           this.opts.onMessage?.(parsed.value as TIncoming, event)
         }
       }

       this.ws.onerror = () => {
         // 统一交给 close 事件触发重连，避免错误和关闭双重处理
         this.ws?.close()
       }

       this.ws.onclose = () => {
         this.stopHeartbeat()
         if (this.manualClose) {
           this.updateStatus('closed')
           return
         }
         this.scheduleReconnect()
       }
     }

     send(data: TOutgoing) {
       const text = JSON.stringify(data)
       if (this.ws?.readyState === WebSocket.OPEN) {
         this.ws.send(text)
         return true
       }

       if (this.queue.length >= (this.opts.queueLimit ?? 100)) {
         this.queue.shift()
       }
       this.queue.push(text)
       return false
     }

     close(code = 1000, reason = 'manual close') {
       this.manualClose = true
       this.clearReconnectTimer()
       this.stopHeartbeat()
       this.ws?.close(code, reason)
       this.ws = null
       this.updateStatus('closed')
     }

     private scheduleReconnect() {
       const maxRetries = this.opts.maxRetries ?? 8
       if (this.retryCount >= maxRetries) {
         this.updateStatus('closed')
         return
       }

       const delay = this.calcDelay(this.retryCount)
       this.retryCount += 1
       this.updateStatus('reconnecting')
       this.reconnectTimer = setTimeout(() => this.connect(), delay)
     }

     private calcDelay(attempt: number) {
       const baseDelay = this.opts.baseDelay ?? 1000
       const maxDelay = this.opts.maxDelay ?? 30000
       const jitter = this.opts.jitter ?? 300
       const exp = Math.min(baseDelay * 2 ** attempt, maxDelay)
       return exp + Math.floor(Math.random() * jitter)
     }

     private restoreSession() {
       const authMsg = this.opts.getAuthPayload?.()
       if (authMsg) this.send(authMsg)

       const subscriptions = this.opts.getResubscribePayloads?.() ?? []
       for (const msg of subscriptions) {
         this.send(msg)
       }
     }

     private flushQueue() {
       while (this.queue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
         this.ws.send(this.queue.shift()!)
       }
     }

     private startHeartbeat() {
       this.stopHeartbeat()
       const interval = this.opts.heartbeatInterval ?? 15000

       this.heartbeatTimer = setInterval(() => {
         if (this.ws?.readyState !== WebSocket.OPEN) return
         this.ws.send(JSON.stringify({ type: 'ping', at: Date.now() }))
         this.armPongDeadline()
       }, interval)
     }

     private armPongDeadline() {
       if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer)
       const timeout = this.opts.heartbeatTimeout ?? 8000
       this.pongTimeoutTimer = setTimeout(() => {
         this.ws?.close(4000, 'heartbeat timeout')
       }, timeout)
     }

     private consumePong(event: MessageEvent) {
       const parsed = this.parseMessage(event.data)
       if (!parsed.ok) return false

       const payload = parsed.value as { type?: string }
       if (payload?.type !== 'pong') return false

       if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer)
       this.pongTimeoutTimer = null
       return true
     }

     private parseMessage(raw: unknown): { ok: true; value: unknown } | { ok: false } {
       if (typeof raw !== 'string') return { ok: false }
       try {
         return { ok: true, value: JSON.parse(raw) }
       } catch {
         return { ok: false }
       }
     }

     private stopHeartbeat() {
       if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
       if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer)
       this.heartbeatTimer = null
       this.pongTimeoutTimer = null
     }

     private clearReconnectTimer() {
       if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
       this.reconnectTimer = null
     }

     private updateStatus(status: ReliableStatus) {
       this.opts.onStatusChange?.(status)
     }
   }
   ```

   :::

9. 使用

   :::code-tabs
   @tab app.ts

   ```ts
   import { ReliableWS } from './reliable-ws'

   type Outgoing =
     | { type: 'auth'; payload: { token: string } }
     | { type: 'subscribe'; payload: { roomId: string } }
     | { type: 'chat.send'; payload: { text: string } }

   type Incoming =
     | { type: 'pong' }
     | { type: 'chat.message'; payload: { text: string; from: string } }

   const client = new ReliableWS<Outgoing, Incoming>({
     url: 'wss://api.example.com/ws',
     getAuthPayload: () => ({
       type: 'auth',
       payload: { token: localStorage.getItem('token') || '' },
     }),
     getResubscribePayloads: () => [
       { type: 'subscribe', payload: { roomId: 'room-1001' } },
     ],
     onStatusChange: (status) => {
       console.log('ws status =>', status)
     },
     onMessage: (msg) => {
       if (msg.type === 'chat.message') {
         console.log('收到消息:', msg.payload.text)
       }
     },
   })

   // 建立连接
   client.connect()

   // 正常发送（断线时会自动排队，重连后补发）
   client.send({ type: 'chat.send', payload: { text: 'hello' } })

   // 页面离开时释放连接
   window.addEventListener('beforeunload', () => {
     client.close()
   })

   ```

   :::

:::::
