---
title: 简介
createTime: 2026/02/14 10:21:00
permalink: /bun/flp74gm9/
---

[+jsc]: Bun 基于 JavaScriptCore，而不是 Node.js 使用的 V8，因此在实现细节和性能曲线会有差异

Bun 是由 Zig 编写的基于 JSC[+jsc] JavaScript/TypeScript 工具链。包含运行时、包管理、脚本执行、测试、打包以及构建服务端

> [!NOTE]
> Bun 的核心目标是减少启动与 I/O 开销

:::table full-width
| 能力 | 命令 / API | 说明 |
| --- | --- | --- |
| 运行脚本 | `bun run index.ts` | 原生执行 TS/JS |
| 包管理 | `bun add` / `bun install` | 依赖安装与 lock 文件管理 |
| 测试 | `bun test` | 内置测试运行器 |
| 构建 | `bun build` | 打包前端或脚本 |
| 服务端 | `Bun.serve()` | 原生 HTTP/WebSocket 服务器 |
:::

安装：

:::code-tabs
@tab Mac
```bash
curl -fsSL https://bun.sh/install | bash
```

@tab Windows
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```
:::

## 基本使用

### 监听模式

Bun 原生支持监听模式，在文件变化后自动重启进程。开启监听模式只需加入 `--watch` 即可开启

```bash
bun --watch src/index.ts
```

### 热重载

如果希望代码在更改时尽量保持运行态并减少完整重启，可以使用 `--hot`

:::details 软重载
官方文档把 `--hot` 的行为描述为 "软重载"：

- 从入口文件出发，追踪并监听导入链上的源码文件（默认不包含 `node_modules`）
- 发生变更时会重新执行代码，但==不会把整个 Bun 进程硬重启（这也是与 `--watch` 的根本区别）==
- 全局状态（尤其是 `globalThis`）会被保留
:::

:::code-tabs
@tab server.ts
```ts
declare global {
  var count: number
}

globalThis.count ??= 0
console.log(`Reloaded ${globalThis.count} times`)
globalThis.count++

setInterval(() => {}, 1_000_000)
```

@tab bash
```bash
# `--hot` 属于软重载，因此挂在 `globalThis` 上的 `count` 会继续累加
bun --hot server.ts

# `--watch` 会重启整个进程，因此挂载在全局对象 `globalThis` 下的 `count` 会从初始值重新开始
bun --watch server.ts
```
:::


> [!NOTE]
> - Bun 的 `--hot` 是服务端热重载，不等于浏览器里的前端 HMR；前端页面级热更新仍建议交给 Vite 这类工具
> - 对于 `Bun.serve()` 场景，官方文档还特别说明：源码更新时可以重新加载 `fetch` 处理逻辑，而不需要中断整个进程，这也是它在服务端开发里体感很快的原因

### bunx

与 `npx`、`pnpx` 类似 Bun 也提供了 `bunx` 命令快速执行包里的二进制命令，无需全局安装

```bash
# 格式化当前目录代码
bunx prettier . --write

# 创建项目（示例）
bunx create-vite my-app
```

### TypeScript 支持

[+类型检查]: "能运行" 不等于 "类型正确"。建议在 CI 加 `tsc --noEmit` 做静态校验

Bun 可以直接执行 `.ts` 文件，默认做快速转译，不做完整类型检查[+类型检查]

:::code-tabs
@tab tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "types": ["bun-types"]
  },
  "include": ["src", "test"]
}
```
:::

### 模块类型与加载

Bun 同时支持 ESM 与 CommonJS，并提供 `bun:*` 内置模块（如 `bun:sqlite`、`bun:test`）

:::table full-width
| 模块类型 | 典型写法 | 说明 |
| --- | --- | --- |
| ESM | `import { x } from './x'` | 推荐默认方案（优先 ESM） |
| CJS | `const x = require('./x')` | 兼容历史包 |
| 内置模块 | `import { Database } from 'bun:sqlite'` | Bun 提供的高性能能力 |
| 动态导入 | `await import('./x')` | 按需加载，适合懒执行 |
:::
