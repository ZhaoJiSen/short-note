---
title: Bun 与 Express
createTime: 2026/02/14 10:27:00
permalink: /bun/bun/crud/fh1j1r45/
---

## 基础篇

### 为什么要在 Bun 中用 Express

很多团队已有大量 Express 中间件和路由代码。Bun 兼容 Node API，可直接复用这类存量资产。

:::table title="Bun + Express 适用场景" full-width
| 场景 | 是否推荐 | 说明 |
| --- | --- | --- |
| 存量 Node/Express 项目迁移 | 推荐 | 成本最低 |
| 全新高性能 API 项目 | 视情况 | 可比较原生 `Bun.serve` 或 Elysia |
| 强依赖 Node 原生扩展 | 需验证 | 先做兼容性测试 |
:::

### 安装与启动

```bash
bun add express
bun run src/server.ts
```

## 进阶篇

:::details 迁移时建议优先验证
- 自定义中间件行为
- 请求体解析（JSON/表单）
- 错误处理中间件
- 关键三方库（鉴权、日志、ORM）
:::

## 完整代码示例

```ts
import express, { type Request, type Response, type NextFunction } from 'express';

const app = express();

// 解析 JSON 请求体
app.use(express.json());

// 简单请求日志中间件
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ code: 0, message: 'ok', data: { runtime: 'bun + express' } });
});

app.post('/users', (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };

  // 参数校验
  if (!name || name.trim() === '') {
    res.status(400).json({ code: 4001, message: 'name 不能为空', data: null });
    return;
  }

  // 模拟创建用户
  res.status(201).json({
    code: 0,
    message: 'created',
    data: { id: Date.now(), name: name.trim() },
  });
});

// 404 处理
app.use((_req: Request, res: Response) => {
  res.status(404).json({ code: 4040, message: 'not found', data: null });
});

// 错误处理中间件必须 4 个参数
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ code: 5000, message: 'internal error', data: null });
});

app.listen(3000, () => {
  console.log('Express server running at http://localhost:3000');
});
```

## 最佳实践

- 迁移初期保持“接口行为不变”，先求稳再优化。
- 中间件顺序固定化（日志 -> 解析 -> 路由 -> 404 -> 错误）。
- 对核心路径做压测，确认 Bun 迁移收益。
- 把跨项目通用中间件抽成独立包。

## 常见错误

- 误把错误处理中间件写成 3 参数，导致错误无法兜底。
- JSON 解析失败未统一处理，返回体格式混乱。
- 迁移后只跑单元测试，不做端到端回归。

