---
title: Elysia
createTime: 2026/02/14 10:29:00
permalink: /bun/00lxjpog/
---

> [!IMPORTANT]
> Elysia 的核心价值是“单一 Schema 源”：同一份 schema 同时驱动运行时校验、TypeScript 推断与接口文档。

## 1. 官方学习路径（建议顺序）

:::table title="按官方文档学习更顺滑" full-width
| 阶段 | 官方章节 | 你会掌握什么 |
| --- | --- | --- |
| 1 | Quick Start | 跑通第一个 Elysia 服务 |
| 2 | Route + Handler | 路由组织与上下文使用 |
| 3 | Validation | 输入输出校验与类型联动 |
| 4 | Life Cycle | 在请求生命周期插入逻辑 |
| 5 | Plugin + Extends Context | 模块化与上下文扩展 |
| 6 | OpenAPI + Eden | 文档与端到端类型调用 |
| 7 | WebSocket | 实时通信 |
:::

## 2. 快速开始

:::code-tabs
@tab 自动创建（推荐）
```bash
bun create elysia app
cd app
bun dev
```

@tab 手动初始化
```bash
bun add elysia
```

```ts
// src/index.ts
import { Elysia } from 'elysia'

new Elysia()
  .get('/', 'Hello Elysia')
  .listen(3000)
```
:::

## 3. 路由与 Handler

### 3.1 路由类型

- 静态路由：`/health`
- 动态路由：`/users/:id`
- 通配路由：`/assets/*`
- 路由分组：`group('/api', ...)`

### 3.2 Handler Context 常用字段

:::table title="Context 高频字段" full-width
| 字段 | 用途 |
| --- | --- |
| `body` | 请求体 |
| `query` | 查询参数 |
| `params` | 路径参数 |
| `headers` | 请求头 |
| `cookie` | Cookie 读写 |
| `set` | 设置响应头、状态码 |
| `status` | 返回指定状态码并保留类型 |
| `redirect` | 返回重定向响应 |
| `store` | 全局共享状态 |
:::

```ts
import { Elysia } from 'elysia'

new Elysia()
  .group('/api', (app) =>
    app
      .get('/health', () => ({ ok: true }))
      .get('/teapot', ({ status, set }) => {
        set.headers['x-teapot'] = 'yes'
        return status(418, { message: 'I am a teapot' })
      })
      .get('/docs', ({ redirect }) => redirect('https://elysiajs.com', 302))
  )
  .listen(3000)
```

## 4. Validation（输入输出一体化）

Elysia 官方推荐把 schema 放在路由第三个参数，框架会自动完成：
1. 请求校验
2. TS 类型推断
3. 与 OpenAPI 联动

```ts
import { Elysia, t } from 'elysia'

new Elysia()
  .post(
    '/users/:id',
    ({ params, query, headers, body, status }) => {
      return status(200, {
        id: params.id,
        from: query.from,
        traceId: headers['x-trace-id'],
        user: body
      })
    },
    {
      params: t.Object({ id: t.Number() }),
      query: t.Object({ from: t.String() }),
      headers: t.Object({ 'x-trace-id': t.String() }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
        age: t.Number({ minimum: 0 })
      }),
      response: {
        200: t.Object({
          id: t.Number(),
          from: t.String(),
          traceId: t.String(),
          user: t.Object({
            name: t.String(),
            age: t.Number()
          })
        })
      }
    }
  )
  .listen(3000)
```

### 4.1 Guard：给一组路由复用约束

```ts
import { Elysia, t } from 'elysia'

new Elysia()
  .guard({
    headers: t.Object({
      authorization: t.String({ pattern: '^Bearer .+$' })
    })
  })
  .get('/me', ({ headers }) => ({ token: headers.authorization }))
  .get('/orders', () => ['order-1'])
  .listen(3000)
```

## 5. Life Cycle（生命周期）

请求生命周期（简化）可理解为：

`Request -> Parse -> Transform -> BeforeHandle -> AfterHandle -> MapResponse -> OnError -> AfterResponse`

```ts
import { Elysia } from 'elysia'

new Elysia()
  .onRequest(({ set }) => {
    set.headers['x-request-start'] = Date.now().toString()
  })
  .onBeforeHandle(({ headers, status }) => {
    if (!headers.authorization) {
      return status(401, { message: 'unauthorized' })
    }
  })
  .onAfterHandle(({ set }) => {
    set.headers['x-powered-by'] = 'elysia'
  })
  .onError(({ code, error, status }) => {
    if (code === 'VALIDATION') {
      return status(422, { message: error.message })
    }
  })
  .get('/secure', () => 'ok')
  .listen(3000)
```

:::details 生命周期使用原则
- 认证、限流、审计优先放 `onRequest/onBeforeHandle`。
- 统一响应头可放 `onAfterHandle`。
- 统一错误格式放 `onError`，避免每个路由重复写。
:::

## 6. Plugin 与 Context 扩展

官方把插件定义为“可组合 Elysia 实例”。

:::table title="四种扩展方式" full-width
| API | 作用 | 常见用途 |
| --- | --- | --- |
| `state` | 全局共享可变状态 | 计数器、缓存 |
| `decorate` | 注入全局能力 | logger、service |
| `derive` | 基于请求派生值（校验前） | 快速提取 header/query |
| `resolve` | 基于校验后数据派生值 | 当前用户、租户信息 |
:::

```ts
import { Elysia, t } from 'elysia'

const loggerPlugin = new Elysia({ name: 'logger' })
  .decorate('logger', {
    info: (msg: string) => console.log('[INFO]', msg)
  })

new Elysia()
  .use(loggerPlugin)
  .state('requestCount', 0)
  .derive(({ headers }) => ({
    bearer: headers.authorization?.startsWith('Bearer ')
      ? headers.authorization.slice(7)
      : null
  }))
  .guard({ query: t.Object({ tenant: t.String() }) })
  .resolve(({ query }) => ({ tenantId: query.tenant }))
  .get('/ctx', ({ logger, store, bearer, tenantId }) => {
    store.requestCount++
    logger.info(`tenant=${tenantId}`)
    return { bearer, tenantId, count: store.requestCount }
  })
  .listen(3000)
```

## 7. OpenAPI + Eden（完整类型闭环）

这是 Elysia 官方文档里非常强调的一条实战路线。

```bash
bun add @elysiajs/openapi @elysiajs/eden
```

:::code-tabs
@tab server.ts
```ts
import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'

export const app = new Elysia()
  .use(openapi())
  .get('/hi', () => 'Hi Elysia')
  .post('/mirror', ({ body }) => body, {
    body: t.Object({
      id: t.Number(),
      name: t.String()
    })
  })
  .listen(3000)

export type App = typeof app
```

@tab client.ts
```ts
import { treaty } from '@elysiajs/eden'
import type { App } from './server'

const api = treaty<App>('localhost:3000')

const hi = await api.hi.get()
const mirror = await api.mirror.post({ id: 1, name: 'Aki' })

console.log(hi.data)
console.log(mirror.data)
```
:::

## 8. WebSocket（Elysia 模式）

```ts
import { Elysia, t } from 'elysia'

new Elysia({
  websocket: {
    idleTimeout: 30
  }
})
  .ws('/chat/:roomId', {
    params: t.Object({ roomId: t.String() }),
    query: t.Object({ user: t.String() }),
    body: t.Object({ message: t.String() }),
    response: t.Object({ user: t.String(), message: t.String(), time: t.Number() }),

    open(ws) {
      ws.send({ user: 'system', message: 'connected', time: Date.now() })
    },

    message(ws, body) {
      ws.send({
        user: ws.data.query.user,
        message: body.message,
        time: Date.now()
      })
    }
  })
  .listen(3000)
```

## 9. 完整使用：模块化 Todo API

这个例子把“认证插件 + 路由模块 + 统一错误处理 + OpenAPI”组合到一起。

:::code-tabs
@tab src/plugins/auth.ts
```ts
import { Elysia, t } from 'elysia'

export const authPlugin = new Elysia({ name: 'auth' })
  .guard({
    headers: t.Object({
      authorization: t.String({ pattern: '^Bearer .+$' })
    })
  })
  .resolve(({ headers }) => {
    const token = headers.authorization.slice(7)

    // 示例：真实项目应在这里校验 JWT / Session
    return { userId: token || 'anonymous' }
  })
```

@tab src/modules/todo.ts
```ts
import { Elysia, t } from 'elysia'

type Todo = { id: number; title: string; done: boolean; owner: string }

const todos: Todo[] = []

export const todoModule = new Elysia({ prefix: '/todos' })
  .get('/', ({ userId }) => {
    return todos.filter((t) => t.owner === userId)
  })
  .post(
    '/',
    ({ body, userId, status }) => {
      const todo: Todo = {
        id: Date.now(),
        title: body.title,
        done: false,
        owner: userId
      }
      todos.push(todo)
      return status(201, todo)
    },
    {
      body: t.Object({ title: t.String({ minLength: 1 }) })
    }
  )
```

@tab src/app.ts
```ts
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { authPlugin } from './plugins/auth'
import { todoModule } from './modules/todo'

export const app = new Elysia()
  .use(openapi())
  .use(authPlugin)
  .use(todoModule)
  .get('/health', () => ({ ok: true }))
  .onError(({ code, error, status }) => {
    if (code === 'VALIDATION') {
      return status(422, { message: error.message })
    }
    return status(500, { message: 'internal error' })
  })
```

@tab src/index.ts
```ts
import { app } from './app'

app.listen(3000)
console.log('Elysia server running at http://localhost:3000')
```
:::

## 10. 最佳实践

- schema 先行：先定义 `params/query/body/response`，再写 handler。
- 认证和租户逻辑优先插件化，不要散落在每个路由。
- 把统一错误格式放 `onError`，避免响应结构漂移。
- 用 OpenAPI + Eden 打通服务端与客户端类型闭环。

## 官方参考

- [Quick Start](https://elysiajs.com/quick-start)
- [Route](https://elysiajs.com/essential/route)
- [Handler](https://elysiajs.com/essential/handler)
- [Validation](https://elysiajs.com/essential/validation)
- [Life Cycle](https://elysiajs.com/essential/life-cycle)
- [Plugin](https://elysiajs.com/essential/plugin)
- [Extends Context](https://elysiajs.com/patterns/extends-context)
- [WebSocket](https://elysiajs.com/patterns/websocket)
- [OpenAPI](https://elysiajs.com/patterns/openapi)
- [Eden](https://elysiajs.com/eden/overview)
