---
title: SSE
createTime: 2026/02/25 23:45:53
permalink: /blog/kscbtlde/
tags:
  - 应用开发
---

SSE (Server-Sent Events) 可以理解为一种 "服务端 -> 客户端" 的单向实时通道。它基于 HTTP/HTTPS，适合消息推送、任务进度、日志流、通知流等场景

> [!NOTE]
> 不支持 IE

## 协议格式与服务端约束

==SSE 响应必须是流式文本，并且每条消息以空行结束==

:::table full-width

| 字段 | 含义 |
| --- | --- |
| `event` | 自定义事件名；前端通过 `addEventListener(eventName)` 监听 |
| `data` | 消息体，可多行，前端会按行拼接 |
| `id` | 消息游标，用于断线恢复 |
| `retry` | 建议重连间隔（毫秒） |

:::

> [!IMPORTANT]
>
> 1. 服务端响应头必须为 `Content-Type: text/event-stream`
> 2. 每条消息必须遵循 `data: xxx\n\n`（或包含 `event/id/retry`）的格式
> 3. 若主动调用 `eventSource.close()`，该实例不会再重连

## 使用方式

前端只需创建 `EventSource` 并订阅事件即可，后端也只需定义一个类似接口的内容且返回符合 SSE 协议的响应即可

:::table full-width

| 名称 | 触发时机 | 常见处理 |
| --- | --- | --- |
| `onopen` | 连接建立成功 | 初始化状态、更新 UI |
| `onmessage` | 收到默认 `message` 事件 | 解析 `event.data` 更新视图 |
| `onerror` | 连接异常、断连、跨域失败等 | 记录错误、提示用户、兜底轮询 |
| `close()`（方法） | 主动关闭连接 | ==关闭后当前实例不再重连== |

:::

:::code-tabs

@tab index.ts

```ts
const eventSource = new EventSource('/api/sse')

eventSource.onopen = () => {
  console.log('SSE 连接已建立')
}

eventSource.onmessage = (event) => {
  console.log('默认 message 事件:', event.data)
}

eventSource.onerror = (event) => {
  console.error('SSE 连接异常:', event)
}
```

@tab server.ts

```ts
import { Elysia, sse } from 'elysia'

const app = new Elysia()
  .get('/api/sse', async function* ({ set }) {
    set.headers['Cache-Control'] = 'no-cache'
    set.headers['Content-Type'] = 'text/event-stream;charset=utf-8'

    let counter = 0

    while (true) {
      if (counter === 10)
        break

      yield sse({
        event: 'tick',
        data: JSON.stringify({
          counter,
          time: new Date().toISOString(),
        }),
      })

      await new Promise((r) => setTimeout(r, 1000))
      counter += 1
    }
  })
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
```

:::

### 鉴权与跨域

原生 `EventSource` 不支持自定义请求头，因此不能直接设置 `Authorization`

:::note 可选方案

1. **同站优先 Cookie**：服务端下发 `HttpOnly + Secure` Cookie，前端通过 `withCredentials` 建立跨域凭证连接
2. **URL 携带短期 token**：仅在临时签名/一次性 token 场景使用，避免长期凭证暴露在 URL  
3. **改用 Fetch 流式读取**：可以自定义 headers / method
:::

### 封装：`useSSE`

基于 Fetch + ReadableStream 封装一个 `useSSE` 函数，支持 `POST` 请求，支持自定义请求头，可复用统一的消息解析逻辑

> [!NOTE]
> 这不是原生 `EventSource`，而是 "按 SSE 协议解析的流式 Fetch"

:::code-tabs
@tab index.d.ts

```ts
export interface SSEMessage<T = unknown> {
  event?: string
  data: T | string
  raw: string
}

export interface SSEPostOptions<T> {
  body?: any
  onMessage?: (message: SSEMessage<T>) => void
  method?: 'GET' | 'POST'
}

```

@tab useSSE.ts

```ts
export function useSSE<T = unknown>(options: SSEPostOptions<T> = {}) {
  const { body, onMessage } = options

  const data = ref<T | string | null>(null)
  const message = ref<SSEMessage<T> | null>(null)
  const readyState = ref<'connecting' | 'open' | 'closed'>('closed')

  let controller: AbortController | null = null

  const parseChunk = (chunk: string) => {
    let event: string | undefined
    const dataLines: string[] = []
    const lines = chunk.split(/\r?\n/)

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.replace(/^event:\s*/, '')
      }
      else if (line.startsWith('data:')) {
        dataLines.push(line.replace(/^data:\s*/, ''))
      }
    }

    if (!dataLines.length) {
      return null;
    }
      

    const raw = dataLines.join('\n')
    let parsed: T | string = raw

    try {
      parsed = JSON.parse(raw)
    }
    catch {}

    return { event, data: parsed, raw } satisfies SSEMessage<T>
  }

  const connect = async (url: string) => {
    controller?.abort()
    controller = new AbortController()
    readyState.value = 'connecting'

    const method = options.method ?? 'GET'
    const headers: HeadersInit = {
      Accept: 'text/event-stream',
    }

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json'
    }
      
    const res = await fetch(url, {
      method,
      headers,
      body: method === 'POST' && body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!res.body) {
      readyState.value = 'closed'
      return
    }

    readyState.value = 'open'

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''

    // eslint-disable-next-line no-unmodified-loop-condition
    while (reader) {
      const { value, done } = await reader.read()
      
      if (done) {
        break;
      }
        
      buffer += decoder.decode(value, { stream: true })

      const chunks = buffer.split(/\r?\n\r?\n/)
      buffer = chunks.pop() || ''

      for (const chunk of chunks) {
        const parsed = parseChunk(chunk)

        if (!parsed) {
          continue;
        }
          
        data.value = parsed.data
        message.value = parsed
        onMessage?.(parsed)
      }
    }

    readyState.value = 'closed'
  }

  onBeforeUnmount(() => controller?.abort())

  return { connect, data, message, readyState }
}
```

:::
