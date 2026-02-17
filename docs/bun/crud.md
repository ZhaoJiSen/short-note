---
title: CRUD 应用
createTime: 2026/02/14 10:30:00
permalink: /bun/bun/crud/tzgfi11i/
---

## 基础篇

### 目标与范围

本章用 Bun + SQLite 实现一个最小 Todo CRUD，覆盖：创建、读取、更新、删除、参数校验、统一响应。

:::table title="CRUD 路由设计" full-width
| 操作 | 方法 | 路径 |
| --- | --- | --- |
| 列表 | `GET` | `/api/todos` |
| 详情 | `GET` | `/api/todos/:id` |
| 创建 | `POST` | `/api/todos` |
| 更新 | `PUT` | `/api/todos/:id` |
| 删除 | `DELETE` | `/api/todos/:id` |
:::

### 项目结构建议

```text
src/
  db.ts
  server.ts
```

## 进阶篇

:::details 接口稳定性的三个关键点
1. 统一返回格式（成功/失败都一致）
2. 明确错误码与 HTTP 状态码映射
3. 写入前校验参数，读取时校验资源是否存在
:::

## 完整代码示例

```ts
import { Database } from 'bun:sqlite';

interface Todo {
  id: number;
  title: string;
  done: number;
  created_at: string;
}

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

function ok<T>(data: T, message = 'ok') {
  return Response.json({ code: 0, message, data } satisfies ApiResult<T>);
}

function fail(code: number, message: string, status: number) {
  return Response.json({ code, message, data: null } satisfies ApiResult<null>, { status });
}

const db = new Database('crud.db');
db.exec(`
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

const listStmt = db.query('SELECT id, title, done, created_at FROM todos ORDER BY id DESC;');
const getStmt = db.query('SELECT id, title, done, created_at FROM todos WHERE id = ?;');
const createStmt = db.query('INSERT INTO todos (title) VALUES (?);');
const updateStmt = db.query('UPDATE todos SET title = ?, done = ? WHERE id = ?;');
const deleteStmt = db.query('DELETE FROM todos WHERE id = ?;');

const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);
    const { pathname } = url;

    // GET /api/todos
    if (req.method === 'GET' && pathname === '/api/todos') {
      return ok(listStmt.all() as Todo[]);
    }

    // /api/todos/:id 路由解析
    const todoIdMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
    const id = todoIdMatch ? Number(todoIdMatch[1]) : null;

    // GET /api/todos/:id
    if (req.method === 'GET' && id !== null) {
      const row = (getStmt.get(id) as Todo | null) ?? null;
      if (!row) return fail(4040, 'Todo 不存在', 404);
      return ok(row);
    }

    // POST /api/todos
    if (req.method === 'POST' && pathname === '/api/todos') {
      try {
        const body = (await req.json()) as { title?: string };
        const title = body.title?.trim();
        if (!title) return fail(4001, 'title 不能为空', 400);

        const result = createStmt.run(title);
        const createdId = Number(result.lastInsertRowid);
        const created = getStmt.get(createdId) as Todo;
        return ok(created, 'created');
      } catch {
        return fail(4002, '请求体不是合法 JSON', 400);
      }
    }

    // PUT /api/todos/:id
    if (req.method === 'PUT' && id !== null) {
      try {
        const body = (await req.json()) as { title?: string; done?: boolean };
        const old = (getStmt.get(id) as Todo | null) ?? null;
        if (!old) return fail(4040, 'Todo 不存在', 404);

        const nextTitle = body.title?.trim() || old.title;
        const nextDone = typeof body.done === 'boolean' ? (body.done ? 1 : 0) : old.done;

        updateStmt.run(nextTitle, nextDone, id);
        const updated = getStmt.get(id) as Todo;
        return ok(updated, 'updated');
      } catch {
        return fail(4002, '请求体不是合法 JSON', 400);
      }
    }

    // DELETE /api/todos/:id
    if (req.method === 'DELETE' && id !== null) {
      const old = (getStmt.get(id) as Todo | null) ?? null;
      if (!old) return fail(4040, 'Todo 不存在', 404);

      deleteStmt.run(id);
      return ok({ id }, 'deleted');
    }

    return fail(4040, '路由不存在', 404);
  },
});

console.log(`CRUD server is running at http://localhost:${server.port}`);
```

## 最佳实践

- 路由、数据访问、响应封装尽量分层，避免单文件失控。
- 用预编译 SQL + 参数绑定，确保性能与安全。
- 保持返回格式一致，方便前端和监控系统消费。
- 给每个写操作补充集成测试用例。

## 常见错误

- 忘记校验 `id` 与 `title`，造成脏数据。
- 更新操作直接覆盖全部字段，导致非预期丢数据。
- 只测试 happy path，缺少异常分支。

