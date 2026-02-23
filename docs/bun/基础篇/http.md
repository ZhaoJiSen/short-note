---
title: HTTP 服务器
createTime: 2026/02/14 10:26:00
permalink: /bun/sksujf84/
---

使用 `Bun.server` 即可创建一个高性能的 HTTP 服务器

:::table full-width
| 字段 | 作用 | 说明 |
| --- | --- | --- |
| `port` | 监听端口 | 默认 `3000` |
| `hostname` | 监听地址 | `127.0.0.1` / `0.0.0.0` |
| `fetch(req, server)` | 请求处理入口 | 返回 `Response` |
| `error(error)` | 全局异常 | 返回统一 500 响应 |
| `websocket` | WebSocket 事件配置 | 与 HTTP 共用同一个服务 |
:::

```ts
Bun.server({
  post: 3000,
  fetch: (request, response) => {
    return new Response('Hello world')
  }
})
```


## 路由

在 `Bun.server` 中定义路由使用静态路径、参数和通配符，并通过 `routes` 配置集中声明路由。`routes` 负责命中规则，未命中的请求交给 `fetch`。

```ts
Bun.serve({
  routes: {
    '/': () => new Response('Home'),
    '/api': () => Response.json({ success: true }),
    '/users': async () => Response.json({ users: [] })
  },
  fetch() {
    return new Response('Unmatched route')
  }
})
```

> [!NOTE]
> 路由接收一个继承于 `Request` 的 `BunRequest` 参数，并返回 `Response` 或 `Promise<Response>`


### 异步路由

异步路由直接返回 `Promise<Response>`，使用 `async` 函数即可。

:::code-tabs
@tab async/await
```ts
import { sql, serve } from 'bun'

serve({
  port: 3001,
  routes: {
    '/api/version': async () => {
      const [version] = await sql`SELECT version()`
      return Response.json(version)
    }
  }
})
```

@tab Promise
```ts
import { sql, serve } from 'bun'

serve({
  routes: {
    '/api/version': () => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const [version] = await sql`SELECT version()`
          resolve(Response.json(version))
        }, 100)
      })
    }
  }
})
```
:::

### 优先级

:::details 多条规则可能同时匹配时，按以下优先级决定命中
1. 精确路由（`/users/all`）
2. 参数路由（`/users/:id`）
3. 通配路由（`/users/*`）
4. 全局路由（`/*`）
:::

```ts
Bun.serve({
  routes: {
    // 越具体越先匹配：静态 > 参数 > 通配 > 全局兜底
    '/api/users/me': () => new Response('Current user'),
    '/api/users/:id': (req) => new Response(`User ${req.params.id}`),
    '/api/*': () => new Response('API catch-all'),
    '/*': () => new Response('Global catch-all')
  }
})
```

### 静态响应

路由可以直接映射到 `Response` 对象（无处理函数）。静态响应在初始化后不会再分配额外内存，通常可获得至少 15% 的性能提升。

```ts
Bun.serve({
  routes: {
    '/health': new Response('OK'),
    '/ready': new Response('Ready', {
      headers: { 'x-ready': '1' }
    }),
    '/blog': Response.redirect('https://bun.com/blog'),
    '/api/config': Response.json({ version: '1.0.0', env: 'production' })
  }
})
```

若需要刷新静态路由缓存，可调用 `server.reload(options)`。

### 文件响应

文件既可以缓存为静态响应，也可以按请求读取。

```ts
Bun.serve({
  routes: {
    // 静态路由：启动时读取并缓存在内存
    '/logo.png': new Response(await Bun.file('./logo.png').bytes()),
    // 文件路由：每次请求从文件系统读取
    '/download.zip': new Response(Bun.file('./download.zip'))
  }
})
```

:::table full-width
| 维度 | 静态响应（`new Response(await file.bytes())`） | 文件响应（`new Response(Bun.file(path))`） |
| --- | --- | --- |
| 读取时机 | 启动时读取并常驻内存 | 请求时读取文件 |
| 缓存协商 | ETag + `If-None-Match`，命中返回 `304` | `Last-Modified` + `If-Modified-Since`，未变更返回 `304` |
| 缺失文件 | 启动时报错 | 请求时返回 `404` |
| 内存占用 | 占用内存，适合小文件与高频内容 | 更省内存，适合大文件与频繁变更 |
| 传输能力 | 不支持 Range/流式 | 支持 Range/流式与背压 |
:::

### 文件流式响应

大文件或断点续传场景可直接使用 `Bun.file()` 的流式能力。

```ts
Bun.serve({
  fetch() {
    return new Response(Bun.file('./hello.txt'))
  }
})
```

需要发送部分内容时，可以对 `Bun.file()` 使用 `slice(start, end)`，会自动设置 `Content-Range` 与 `Content-Length`。  
底层在可用时会使用 `sendfile(2)` 实现零拷贝传输。

```ts
Bun.serve({
  fetch(req) {
    const bigFile = Bun.file('./big-video.mp4')
    const range = req.headers.get('Range')
    if (!range) return new Response(bigFile)

    const [startText, endText] = range.replace('bytes=', '').split('-')
    const start = Number(startText || 0)
    const end = endText ? Number(endText) : bigFile.size

    return new Response(bigFile.slice(start, end))
  }
})
```

### fetch

路由表无法覆盖时，使用 `fetch` 收尾

```ts
Bun.serve({
  fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === '/') return new Response('Home page!')
    if (url.pathname === '/blog') return new Response('Blog!')
    return new Response('404!')
  }
})
```

## 完整示例：可扩展 API 服务模板

包含：健康检查、用户列表、统一响应、请求追踪、404/500 兜底。

```ts
interface ApiResult<T> {
  code: number
  message: string
  data: T
}

function ok<T>(data: T, message = 'ok', headers?: HeadersInit) {
  return Response.json({ code: 0, message, data } satisfies ApiResult<T>, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers
    }
  })
}

function fail(code: number, message: string, status: number, headers?: HeadersInit) {
  return Response.json({ code, message, data: null } satisfies ApiResult<null>, {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers
    }
  })
}

const server = Bun.serve({
  port: 3000,
  hostname: '0.0.0.0',

  fetch: async (req) => {
    const url = new URL(req.url)
    const traceId = crypto.randomUUID()

    // 简单 CORS 预检
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'access-control-allow-headers': 'content-type,authorization,x-trace-id',
          'x-trace-id': traceId
        }
      })
    }

    const commonHeaders = {
      'access-control-allow-origin': '*',
      'x-trace-id': traceId
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      return ok({
        status: 'up',
        runtime: 'bun',
        uptime: process.uptime()
      }, 'ok', commonHeaders)
    }

    if (req.method === 'GET' && url.pathname === '/users') {
      return ok([
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Linus' }
      ], 'ok', commonHeaders)
    }

    return fail(4040, '路由不存在', 404, commonHeaders)
  },

  error(error) {
    console.error('[http:error]', error)
    return fail(5000, 'internal error', 500)
  }
})

console.log(`HTTP server running at http://${server.hostname}:${server.port}`)
```
