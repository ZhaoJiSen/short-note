---
title: CRUD 应用
createTime: 2026/02/14 10:30:00
permalink: /bun/bun/crud/tzgfi11i/
---

> [!IMPORTANT]
> 这一章把前面的能力串起来：Bun 运行时 + Elysia 路由校验 + SQLite 持久化，构建一个可直接落地的 Todo CRUD。

## 1. 项目目标与接口设计

:::table title="Todo API 设计" full-width
| 操作 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 列表 | `GET` | `/api/todos` | 按时间倒序 |
| 详情 | `GET` | `/api/todos/:id` | 查询单条 |
| 创建 | `POST` | `/api/todos` | 新增待办 |
| 更新 | `PATCH` | `/api/todos/:id` | 局部更新 |
| 删除 | `DELETE` | `/api/todos/:id` | 删除记录 |
:::

建议目录：

```text
src/
  db.ts
  modules/
    todo.ts
  index.ts
```

## 2. 数据模型

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## 3. 完整代码

:::code-tabs
@tab src/db.ts
```ts
import { Database } from 'bun:sqlite'

export interface TodoRow {
  id: number
  title: string
  done: number
  created_at: string
  updated_at: string
}

const db = new Database('crud.db')
db.exec(`PRAGMA journal_mode = WAL;`)

db.exec(`
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`)

const listStmt = db.query(`
  SELECT id, title, done, created_at, updated_at
  FROM todos
  ORDER BY id DESC;
`)

const getStmt = db.query(`
  SELECT id, title, done, created_at, updated_at
  FROM todos
  WHERE id = ?;
`)

const createStmt = db.query(`
  INSERT INTO todos (title, done)
  VALUES (?, 0);
`)

const updateStmt = db.query(`
  UPDATE todos
  SET title = ?, done = ?, updated_at = datetime('now')
  WHERE id = ?;
`)

const deleteStmt = db.query(`DELETE FROM todos WHERE id = ?;`)

export function listTodos(): TodoRow[] {
  return listStmt.all() as TodoRow[]
}

export function getTodo(id: number): TodoRow | null {
  return (getStmt.get(id) as TodoRow | null) ?? null
}

export function createTodo(title: string): TodoRow {
  const result = createStmt.run(title)
  const id = Number(result.lastInsertRowid)
  return getStmt.get(id) as TodoRow
}

export function updateTodo(id: number, next: { title: string; done: boolean }): TodoRow | null {
  const exists = getTodo(id)
  if (!exists) return null

  updateStmt.run(next.title, next.done ? 1 : 0, id)
  return getStmt.get(id) as TodoRow
}

export function removeTodo(id: number): boolean {
  const exists = getTodo(id)
  if (!exists) return false

  deleteStmt.run(id)
  return true
}
```

@tab src/modules/todo.ts
```ts
import { Elysia, t } from 'elysia'
import { createTodo, getTodo, listTodos, removeTodo, updateTodo } from '../db'

function rowToDTO(row: {
  id: number
  title: string
  done: number
  created_at: string
  updated_at: string
}) {
  return {
    id: row.id,
    title: row.title,
    done: row.done === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const todoModule = new Elysia({ prefix: '/api/todos' })
  .get('/', () => listTodos().map(rowToDTO))
  .get(
    '/:id',
    ({ params, status }) => {
      const row = getTodo(params.id)
      if (!row) return status(404, { code: 4040, message: 'Todo 不存在', data: null })
      return { code: 0, message: 'ok', data: rowToDTO(row) }
    },
    {
      params: t.Object({ id: t.Number() })
    }
  )
  .post(
    '/',
    ({ body, status }) => {
      const row = createTodo(body.title.trim())
      return status(201, { code: 0, message: 'created', data: rowToDTO(row) })
    },
    {
      body: t.Object({ title: t.String({ minLength: 1 }) })
    }
  )
  .patch(
    '/:id',
    ({ params, body, status }) => {
      const old = getTodo(params.id)
      if (!old) return status(404, { code: 4040, message: 'Todo 不存在', data: null })

      const nextTitle = body.title?.trim() || old.title
      const nextDone = typeof body.done === 'boolean' ? body.done : old.done === 1

      const updated = updateTodo(params.id, { title: nextTitle, done: nextDone })
      return { code: 0, message: 'updated', data: rowToDTO(updated!) }
    },
    {
      params: t.Object({ id: t.Number() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        done: t.Optional(t.Boolean())
      })
    }
  )
  .delete(
    '/:id',
    ({ params, status }) => {
      const deleted = removeTodo(params.id)
      if (!deleted) return status(404, { code: 4040, message: 'Todo 不存在', data: null })
      return { code: 0, message: 'deleted', data: { id: params.id } }
    },
    {
      params: t.Object({ id: t.Number() })
    }
  )
```

@tab src/index.ts
```ts
import { Elysia } from 'elysia'
import { todoModule } from './modules/todo'

new Elysia()
  .use(todoModule)
  .get('/health', () => ({ code: 0, message: 'ok', data: { uptime: process.uptime() } }))
  .onError(({ code, error, status }) => {
    if (code === 'VALIDATION') {
      return status(422, { code: 4220, message: error.message, data: null })
    }

    return status(500, { code: 5000, message: 'internal error', data: null })
  })
  .listen(3000)

console.log('CRUD server running at http://localhost:3000')
```
:::

## 4. 运行与验证

:::code-tabs
@tab 启动
```bash
bun add elysia
bun run src/index.ts
```

@tab API 验证
```bash
# 1) 创建
curl -X POST http://localhost:3000/api/todos \
  -H 'content-type: application/json' \
  -d '{"title":"学习 Bun"}'

# 2) 列表
curl http://localhost:3000/api/todos

# 3) 更新
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H 'content-type: application/json' \
  -d '{"done":true}'

# 4) 删除
curl -X DELETE http://localhost:3000/api/todos/1
```
:::

## 5. 最佳实践

- 路由层只做协议处理，SQL 操作集中在 `db/repository` 层。
- 所有写操作先校验参数，再执行数据库变更。
- 返回结构保持统一，便于前端与监控消费。
- `PRAGMA journal_mode = WAL` 作为服务端默认值更稳妥。

::::collapse
- :+ 可继续扩展的方向

  1. 增加分页与筛选（`done`、关键词）。
  2. 接入鉴权，把 Todo 与用户绑定。
  3. 补集成测试（创建-查询-更新-删除全链路）。
::::
