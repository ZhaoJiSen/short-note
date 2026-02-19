---
title: HTTP 服务器
createTime: 2026/02/14 10:26:00
permalink: /bun/sksujf84/
---

> [!IMPORTANT]
> `Bun.serve()` 的核心优势是“Web 标准心智一致”：请求是 `Request`，响应是 `Response`，写法接近浏览器 `fetch`。

## 1. `Bun.serve` 核心配置

:::table title="常用字段" full-width
| 字段 | 作用 | 说明 |
| --- | --- | --- |
| `port` | 监听端口 | 默认 `3000` |
| `hostname` | 监听地址 | `127.0.0.1` / `0.0.0.0` |
| `fetch(req, server)` | 请求处理入口 | 返回 `Response` |
| `error(error)` | 全局异常兜底 | 返回统一 500 响应 |
| `websocket` | WebSocket 事件配置 | 与 HTTP 共用同一个服务 |
:::

## 2. 路由组织方式

小服务可直接 `if/switch`；中型服务建议抽出“匹配 + 处理”结构。

:::code-tabs
@tab 极简路由
```ts
Bun.serve({
  port: 3000,
  fetch(req) {
    const { pathname } = new URL(req.url)

    if (req.method === 'GET' && pathname === '/health') {
      return Response.json({ ok: true })
    }

    return new Response('Not Found', { status: 404 })
  }
})
```

@tab 带工具函数的路由
```ts
function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init?.headers
    },
    status: init?.status
  })
}

function notFound() {
  return json({ code: 4040, message: 'not found', data: null }, { status: 404 })
}
```
:::

## 3. 请求体处理与错误边界

`await req.json()` 在请求体非法时会抛错，必须显式 `try/catch`。  
否则会直接进入全局 `error`，你就失去“可控的 400 响应语义”。

```ts
async function parseJSON(req: Request): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await req.json() }
  } catch {
    return { ok: false }
  }
}
```

## 4. 完整示例：可扩展 API 服务模板

示例能力：健康检查、用户创建、统一响应、请求追踪、404/500 兜底。

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

async function parseJSON(req: Request) {
  try {
    return { ok: true as const, value: await req.json() }
  } catch {
    return { ok: false as const }
  }
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

    if (req.method === 'POST' && url.pathname === '/users') {
      const parsed = await parseJSON(req)
      if (!parsed.ok) {
        return fail(4001, '请求体不是合法 JSON', 400, commonHeaders)
      }

      const body = parsed.value as { name?: string }
      const name = body.name?.trim()

      if (!name) {
        return fail(4002, 'name 不能为空', 400, commonHeaders)
      }

      return ok({ id: Date.now(), name }, 'created', commonHeaders)
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

## 5. 浏览器调用演示

:::demo
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bun HTTP Demo</title>
    <style>
      body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 20px; }
      button { padding: 8px 12px; border: 0; border-radius: 8px; background: #1f2937; color: #fff; }
      pre { background: #f3f4f6; border-radius: 8px; padding: 12px; }
    </style>
  </head>
  <body>
    <button id="btn">请求 /health</button>
    <pre id="out">点击按钮查看结果</pre>

    <script>
      const btn = document.getElementById('btn')
      const out = document.getElementById('out')

      btn.addEventListener('click', async () => {
        const res = await fetch('http://localhost:3000/health')
        const data = await res.json()
        out.textContent = JSON.stringify(data, null, 2)
      })
    </script>
  </body>
</html>
```
:::

## 6. 最佳实践

- 响应结构统一（`code/message/data`），减少前后端协作成本。
- JSON 解析统一封装，不要在每个路由重复 `try/catch`。
- 给每个请求加 `traceId`，出问题时能串联日志。
- 生产环境把 TLS、限流、压缩放到网关层，应用层聚焦业务。

::::collapse
- :+ 性能排查顺序

  1. 看慢路由是否是数据库或外部 I/O 导致。
  2. 看序列化与日志量是否过大。
  3. 再考虑并发参数与机器资源。
::::
