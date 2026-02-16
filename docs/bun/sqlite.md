---
title: Bun 与 SQLite
createTime: 2026/02/14 10:28:00
permalink: /node/bun/sqlite/
---

## 基础篇

### `bun:sqlite` 的定位

`bun:sqlite` 是 Bun 提供的原生 SQLite 驱动，适合中小型服务、工具脚本、边缘部署等场景。

:::table title="SQLite 在 Bun 中的常见用途" full-width
| 用途 | 典型场景 | 说明 |
| --- | --- | --- |
| 本地开发数据库 | 原型、Demo、个人项目 | 零依赖，开箱即用 |
| 嵌入式数据存储 | 桌面工具、CLI | 文件级数据库便于分发 |
| 小型后端服务 | 读多写少的 API | 运维简单 |
:::

### 基本操作模型

- 连接数据库：`new Database('app.db')`
- 建表：`db.exec(SQL)`
- 查询：`db.query(SQL).all()` / `.get()`
- 写入：`db.query(SQL).run(params...)`

## 进阶篇

::: card title="事务是关键" icon="material-icon-theme:database"
批量写入必须使用事务，不然性能和一致性都会明显下降。
:::

:::details 索引设计建议
- 对高频筛选字段建索引
- 避免“每个字段都建索引”导致写入变慢
- 通过 `EXPLAIN QUERY PLAN` 观察执行计划
:::

## 完整代码示例

```ts
import { Database } from 'bun:sqlite';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const db = new Database('notes.db');

// 1) 初始化表结构
// 使用 IF NOT EXISTS，保证重复启动不会报错
db.exec(`
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// 2) 预编译语句（推荐）
const insertStmt = db.query(
  `INSERT INTO notes (title, content) VALUES (?, ?);`,
);
const listStmt = db.query(`SELECT id, title, content, created_at FROM notes ORDER BY id DESC;`);
const findStmt = db.query(`SELECT id, title, content, created_at FROM notes WHERE id = ?;`);

// 3) 写入函数
function createNote(title: string, content: string) {
  const result = insertStmt.run(title, content);
  return Number(result.lastInsertRowid);
}

// 4) 查询函数
function listNotes(): Note[] {
  return listStmt.all() as Note[];
}

function getNoteById(id: number): Note | null {
  return (findStmt.get(id) as Note | null) ?? null;
}

// 5) 演示
const id = createNote('Bun SQLite', '这是一条由 bun:sqlite 写入的记录');
console.log('新建记录 ID:', id);
console.log('单条查询:', getNoteById(id));
console.log('列表查询:', listNotes());
```

## 最佳实践

- 使用预编译语句，避免重复解析 SQL。
- 写操作集中到事务中，尤其是批量导入。
- 给连接和关闭生命周期做统一封装。
- 把 SQL 与业务逻辑分层，便于后续迁移到 MySQL/PostgreSQL。

## 常见错误

- 动态拼接 SQL 字符串，带来注入风险。
- 忽略索引，数据量稍大后查询明显变慢。
- 把 SQLite 当高并发强一致数据库使用，超出能力边界。

