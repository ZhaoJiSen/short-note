---
title: Elysia
createTime: 2026/02/14 10:29:00
permalink: /node/bun/elysia/
---

## 基础篇

### Elysia 是什么

Elysia 是面向 Bun 生态的 TypeScript 友好框架，强调类型推断、简洁路由和插件化。

:::table title="Elysia 与原生 Bun.serve 对比" full-width
| 维度 | Elysia | Bun.serve |
| --- | --- | --- |
| 路由组织 | 内置链式 API | 需手写分发 |
| 类型体验 | 较强（请求/响应推断） | 需要手动定义 |
| 生态插件 | 丰富 | 更偏底层 |
| 灵活性 | 高 | 极高（但样板更多） |
:::

### 最小应用结构

- `new Elysia()` 创建实例
- `.get/.post` 注册路由
- `.use` 挂载插件
- `.listen` 启动服务

## 进阶篇

:::collapse
- :+ 什么时候优先用 Elysia

  你希望获得更好的类型约束、清晰的路由组织和更快的团队协作速度。

- 什么时候优先用 Bun.serve

  极简接口、性能极限优化、或需要完全控制请求生命周期时。
:::

## 完整代码示例

```ts
import { Elysia, t } from 'elysia';

interface User {
  id: number;
  name: string;
}

const users: User[] = [];

const app = new Elysia()
  .get('/health', () => ({ code: 0, message: 'ok' }))

  // 列表查询
  .get('/users', () => ({ code: 0, data: users }))

  // 按 id 查询
  .get('/users/:id', ({ params, set }) => {
    const id = Number(params.id);
    const user = users.find((item) => item.id === id);

    if (!user) {
      set.status = 404;
      return { code: 4040, message: '用户不存在' };
    }

    return { code: 0, data: user };
  })

  // 创建用户（带请求体校验）
  .post(
    '/users',
    ({ body, set }) => {
      const nextUser: User = {
        id: Date.now(),
        name: body.name.trim(),
      };
      users.push(nextUser);
      set.status = 201;
      return { code: 0, data: nextUser };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
      }),
    },
  )

  .listen(3000);

console.log(`Elysia server running at http://localhost:${app.server?.port}`);
```

## 最佳实践

- 统一返回体结构与状态码策略。
- 用 schema 明确接口契约，减少前后端对齐成本。
- 插件仅放“通用能力”（鉴权、日志、限流），避免业务耦合。
- 提前定义错误码表，避免随手返回字符串。

## 常见错误

- 所有逻辑都堆到一个文件，路由维护困难。
- 不做请求体验证，依赖“前端一定传对”。
- 把 Elysia 插件当全局状态仓库使用，导致副作用扩散。

