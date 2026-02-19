---
title: Bun 与 SQLite
createTime: 2026/02/14 10:28:00
permalink: /bun/pag35l2e/
---

> [!IMPORTANT]
> `bun:sqlite` 是 Bun 自带的原生 SQLite 驱动。它的优势是：零额外服务、部署简单、读性能稳定，适合中小型后端与工具型应用。

## 1. 适用场景与边界

:::table title="Bun + SQLite 适用性" full-width
| 场景 | 适配度 | 说明 |
| --- | --- | --- |
| 个人项目 / 内部工具 | 高 | 维护成本低，开箱即用 |
| 中小型 API（读多写少） | 中高 | 需要合理索引与事务设计 |
| 超高并发写入系统 | 低 | 建议转 MySQL/PostgreSQL |
:::

## 2. 常用 API 地图

:::table title="`bun:sqlite` 高频操作" full-width
| 能力 | 写法 | 说明 |
| --- | --- | --- |
| 打开数据库 | `new Database('app.db')` | 文件不存在会自动创建 |
| 执行 DDL/批量 SQL | `db.exec(sql)` | 建表、PRAGMA、批处理 |
| 预编译语句 | `db.query(sql)` | 返回可复用语句对象 |
| 查询一条 | `stmt.get(...args)` | 返回单行或 `null` |
| 查询多条 | `stmt.all(...args)` | 返回行数组 |
| 写入/更新/删除 | `stmt.run(...args)` | 返回变更结果 |
:::

## 3. 基础模板：连接、建表、预编译

```ts
import { Database } from 'bun:sqlite'

export const db = new Database('notes.db')

// 推荐开启 WAL，提高并发读写体验
// 对于服务端应用，这通常是更稳妥的默认值
 db.exec(`PRAGMA journal_mode = WAL;`)

// 建表（幂等）
db.exec(`
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`)

export const insertNoteStmt = db.query(`
  INSERT INTO notes (title, content)
  VALUES (?, ?);
`)

export const getNoteStmt = db.query(`
  SELECT id, title, content, created_at
  FROM notes
  WHERE id = ?;
`)

export const listNoteStmt = db.query(`
  SELECT id, title, content, created_at
  FROM notes
  ORDER BY id DESC;
`)
```

## 4. 完整示例：带事务的 Note 仓储

:::code-tabs
@tab src/repository.ts
```ts
import { Database } from 'bun:sqlite'

export interface Note {
  id: number
  title: string
  content: string
  created_at: string
}

const db = new Database('notes.db')
db.exec(`PRAGMA journal_mode = WAL;`)

db.exec(`
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`)

const insertStmt = db.query(`INSERT INTO notes (title, content) VALUES (?, ?);`)
const getStmt = db.query(`SELECT id, title, content, created_at FROM notes WHERE id = ?;`)
const listStmt = db.query(`SELECT id, title, content, created_at FROM notes ORDER BY id DESC;`)

export function createNote(title: string, content: string): number {
  const result = insertStmt.run(title, content)
  return Number(result.lastInsertRowid)
}

export function getNoteById(id: number): Note | null {
  return (getStmt.get(id) as Note | null) ?? null
}

export function listNotes(): Note[] {
  return listStmt.all() as Note[]
}

export function createNotesBatch(items: Array<{ title: string; content: string }>) {
  // 手动事务：保证要么全部成功，要么全部回滚
  db.exec('BEGIN')
  try {
    for (const item of items) {
      insertStmt.run(item.title, item.content)
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function closeDB() {
  db.close()
}
```

@tab src/demo.ts
```ts
import { closeDB, createNote, createNotesBatch, getNoteById, listNotes } from './repository'

const firstId = createNote('Bun SQLite', '第一条记录')

createNotesBatch([
  { title: '事务批量写入 A', content: '内容 A' },
  { title: '事务批量写入 B', content: '内容 B' }
])

console.log('first:', getNoteById(firstId))
console.log('all:', listNotes())

closeDB()
```
:::

## 5. SQL 设计建议

:::card title="索引不是越多越好" icon="material-icon-theme:database"
先给高频查询条件建索引，再通过 `EXPLAIN QUERY PLAN` 验证收益；不要“每个字段都建索引”。
:::

```sql
-- 示例：按创建时间倒序查最近记录
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
```

## 6. 最佳实践

- 始终用参数绑定（`?`），不要字符串拼接 SQL。
- 高频 SQL 预编译后复用，减少重复解析成本。
- 批量写入必须放事务，保证一致性和性能。
- 把数据库访问封装到仓储层，业务层不要直接拼 SQL。

::::collapse
- :+ 从 SQLite 平滑迁移到其他数据库的做法

  1. 先固定 repository 接口（不要让业务层依赖 SQLite 细节）。
  2. 再把 SQL 与模型映射抽离成独立模块。
  3. 最后替换实现层（MySQL/PostgreSQL）。
::::
