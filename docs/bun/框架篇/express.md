---
title: Bun 与 Express
createTime: 2026/02/14 10:27:00
permalink: /bun/fh1j1r45/
---

> [!IMPORTANT]
> Bun 兼容大量 Node API，所以 Express 的价值不是“更快写新项目”，而是“低成本迁移与复用既有中间件生态”。

## 1. 什么时候选 Bun + Express

:::table title="选型建议" full-width
| 场景 | 建议 |
| --- | --- |
| 老项目已深度依赖 Express 中间件 | 优先 Bun + Express，迁移成本最低 |
| 新项目、追求极简和性能 | 优先 `Bun.serve()` 或 Elysia |
| 使用大量 Node 原生扩展包 | 先做兼容性验证，再决定迁移 |
:::

## 2. 最小迁移步骤

:::code-tabs
@tab 安装依赖
```bash
bun add express
bun add -d @types/express
```

@tab 启动命令
```bash
bun run src/server.ts
```
:::

迁移顺序建议：
1. 先在 Bun 下跑通现有路由与中间件。
2. 再补兼容性回归（鉴权、文件上传、日志、数据库）。
3. 最后再做性能优化与结构重构。

## 3. 完整示例：可迁移的 Express 服务骨架

这个示例包含：请求追踪、路由拆分、统一错误处理、404 兜底。

:::code-tabs
@tab src/routes/user.ts
```ts
import { Router } from 'express'

export const userRouter = Router()

userRouter.get('/', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: [{ id: 1, name: 'Aki' }] })
})

userRouter.post('/', (req, res) => {
  const body = req.body as { name?: string }
  const name = body.name?.trim()

  if (!name) {
    res.status(400).json({ code: 4001, message: 'name 不能为空', data: null })
    return
  }

  res.status(201).json({
    code: 0,
    message: 'created',
    data: { id: Date.now(), name }
  })
})
```

@tab src/app.ts
```ts
import express, { type NextFunction, type Request, type Response } from 'express'
import { userRouter } from './routes/user'

export const app = express()

app.use(express.json())

// 请求追踪：把 traceId 放进响应头和日志上下文
app.use((req, res, next) => {
  const traceId = req.header('x-trace-id') || crypto.randomUUID()
  res.setHeader('x-trace-id', traceId)
  res.locals.traceId = traceId
  next()
})

app.get('/health', (_req, res) => {
  res.json({
    code: 0,
    message: 'ok',
    data: { runtime: 'bun + express', uptime: process.uptime() }
  })
})

app.use('/users', userRouter)

// 404 兜底
app.use((_req, res) => {
  res.status(404).json({ code: 4040, message: 'not found', data: null })
})

// 统一错误处理中间件（必须 4 参数）
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[express:error]', err)
  res.status(500).json({ code: 5000, message: 'internal error', data: null })
})
```

@tab src/server.ts
```ts
import { app } from './app'

const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`)
})
```
:::

## 4. 迁移后怎么验证收益

```bash
# 压测健康检查接口（示例）
bunx autocannon http://localhost:3000/health -c 50 -d 20
```

:::details 迁移验证清单
- 响应结构是否与旧系统一致。
- 错误中间件是否能接住所有异常。
- 核心依赖（鉴权、ORM、上传）是否行为一致。
- 压测指标是否满足目标（p95、吞吐、错误率）。
:::

## 5. 最佳实践

- 第一阶段“行为不变优先”，不要迁移时顺手大改业务。
- 中间件顺序固定：日志/追踪 -> 解析 -> 路由 -> 404 -> error。
- 把跨项目可复用中间件单独抽包，避免耦合业务代码。
- 用集成测试覆盖关键路由，确保迁移后协议不漂移。
