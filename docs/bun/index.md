---
title: Bun 专题
createTime: 2026/02/14 10:20:00
permalink: /node/bun/
---

> [!IMPORTANT]
> Bun 是一个以 ==性能与开发体验== 为核心目标的 JavaScript/TypeScript 运行时，适合从脚本工具到 API 服务的一体化开发。

Bun 的学习可以拆成 4 条线：运行时基础、服务端能力、生态兼容、实战落地[+学习线]。

[+学习线]: 先理解 Bun 的运行时模型与模块机制，再掌握 HTTP/文件/Buffer 等基础 API，最后进入框架与 CRUD/WebSocket 场景。

:::: card-grid
::: card title="基础篇" icon="logos:bun"
- [简介与定位](/node/bun/intro/)
- [模块系统](/node/bun/modules/)
- [TypeScript 支持](/node/bun/typescript/)
- [Buffer 与二进制](/node/bun/buffer/)
- [文件处理](/node/bun/files/)
:::

::: card title="服务端篇" icon="material-icon-theme:nodejs"
- [HTTP 服务器](/node/bun/http/)
- [Bun 与 WebSocket](/node/bun/websocket/)
:::

::: card title="生态篇" icon="material-icon-theme:npm"
- [Bun 与 Express](/node/bun/express/)
- [Bun 与 SQLite](/node/bun/sqlite/)
- [Elysia 框架](/node/bun/elysia/)
:::

::: card title="实战篇" icon="material-icon-theme:database"
- [CRUD 应用](/node/bun/crud/)
:::
::::

## 章节路线图

:::table title="Bun 学习路线与产出" full-width
| 篇章 | 关注点 | 你会得到什么 |
| --- | --- | --- |
| 基础篇 | 运行时、模块、类型、二进制、文件 I/O | 可以独立写 Bun 脚本与小工具 |
| 服务端篇 | `Bun.serve`、WebSocket | 可以写可上线的 API 与实时服务 |
| 生态篇 | Express 兼容、SQLite、本地框架 | 能在存量项目和新项目中选型 |
| 实战篇 | 完整 CRUD | 一套端到端后端实现模板 |
:::

## 阅读建议

:::collapse
- :+ 快速上手（1~2 天）

  先读「简介 → 模块 → TypeScript → HTTP 服务器」，目标是把本地接口跑起来。

- 工程化扩展（2~4 天）

  再读「文件处理 → Buffer → Express/SQLite」，目标是写出稳定服务。

- 项目落地（持续）

  最后读「Elysia → CRUD → WebSocket」，目标是形成可复用模板。
:::

*[JSC]: JavaScriptCore（Safari 同款 JavaScript 引擎）
*[CLI]: Command Line Interface（命令行接口）

