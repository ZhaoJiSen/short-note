---
title: 简介
createTime: 2026/02/14 10:21:00
permalink: /bun/flp74gm9/
---

[+jsc]: Bun 使用 JavaScriptCore（Safari 同款引擎），不是 Node.js 的 V8

> [!IMPORTANT]
> Bun 是一个“可渐进采用”的 JavaScript/TypeScript 工具链：运行时、包管理器、测试、打包都在一个工具里。

## 1. Bun 是什么

Bun 由 Zig 编写，核心目标是：==更快启动、更低 I/O 开销、更少工具拼装成本==。  
你可以只用其中一个能力（例如 `bun test` 或 `bun install`），也可以整套采用。

:::table title="Bun 能力总览" full-width
| 能力 | 命令 / API | 典型用途 |
| --- | --- | --- |
| 运行时 | `bun run` / `bun index.ts` | 执行 JS/TS 服务与脚本 |
| 包管理 | `bun add` / `bun install` | 安装依赖、管理 lock 文件 |
| 测试 | `bun test` | 单元测试、集成测试 |
| 构建 | `bun build` | 前端打包、脚本构建 |
| 服务端 | `Bun.serve()` | HTTP/WebSocket 服务 |
:::

## 2. 安装与最小验证

:::code-tabs
@tab macOS / Linux
```bash
curl -fsSL https://bun.sh/install | bash
```

@tab Windows (PowerShell)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```
:::

```bash
bun --version
bun -e "console.log(Bun.version)"
```

## 3. 命令地图（先记住最常用）

:::table title="高频命令" full-width
| 目标 | 命令 | 说明 |
| --- | --- | --- |
| 运行入口 | `bun run src/index.ts` | 执行 TS/JS 入口 |
| 监听重启 | `bun --watch src/index.ts` | 变更后硬重启进程 |
| 热重载 | `bun --hot src/index.ts` | 变更后软重载代码 |
| 安装依赖 | `bun add zod` | 添加生产依赖 |
| 开发依赖 | `bun add -d @types/bun` | 添加类型声明 |
| 执行临时 CLI | `bunx prettier . --write` | 类似 `npx` |
| 运行测试 | `bun test` | 执行测试文件 |
:::

## 4. 导入与模块解析（Bun 如何找到你的 `import`）

和“导入处理”相比，更准确的说法是：  
==当你写下 `import` / `require` 后，Bun 按什么规则定位文件并加载模块==。

:::table title="导入来源与解析方式" full-width
| 来源 | 写法 | 解析要点 |
| --- | --- | --- |
| 相对路径 | `import './utils'` | 会按一组扩展顺序查找（如 `.ts/.js/...`） |
| npm 包 | `import { z } from 'zod'` | 走包解析规则（兼容 Node 生态） |
| Bun 内置模块 | `import { Database } from 'bun:sqlite'` | 直接使用 Bun 原生能力 |
| Node 内置模块 | `import path from 'node:path'` | 兼容 Node API |
:::

```ts
// Bun 允许在同一文件里混用 import 与 require
import { join } from 'node:path'
const pkg = require('./package.json')

console.log(join('/a', 'b'))
console.log(pkg.name)
```

:::details 需要记住的边界
- 新项目优先 `ESM`（`import/export`）。
- `require()` 是同步加载，不能加载使用 top-level await 的模块。
- Bun 支持 `tsconfig` 的 `paths`/`baseUrl` 路径映射，迁移 TS 项目会更顺滑。
:::

## 5. TypeScript 支持

Bun 可以直接执行 `.ts/.tsx`，默认做“快速转译 + 执行”。  
但要注意：==能运行不等于做了完整类型检查==，CI 仍建议跑 `tsc --noEmit`。

```bash
bun add -d @types/bun typescript
```

:::code-tabs
@tab tsconfig.json（推荐基线）
```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["bun-types"],
    "noEmit": true
  },
  "include": ["src", "test"]
}
```

@tab src/index.ts
```ts
interface User {
  id: number
  name: string
}

const user: User = { id: 1, name: 'Bun' }
console.log(user)
```

@tab 运行与类型检查
```bash
bun run src/index.ts
bunx tsc --noEmit
```
:::

## 6. 监听模式与热重载

先有 `--watch`（文件变更就重启进程），再看 `--hot`（文件变更软重载）。  
这两个能力的差异，直接决定你在本地开发时“状态是否保留”。

:::code-tabs
@tab server.ts
```ts
declare global {
  var counter: number
}

var localCount: number

globalThis.counter ??= 0
localCount ??= 0

console.log(`Reloaded ${globalThis.counter} times`)
console.log(`localCount: ${localCount}`)

globalThis.counter++
localCount++

// 避免进程退出，便于观察重载效果
setInterval(() => {}, 1_000_000)
```

@tab 运行命令
```bash
# 硬重启：每次变更都会重启整个进程
bun --watch server.ts

# 软重载：重载模块，但进程不整体重启
bun --hot server.ts
```
:::

分别运行后，你会看到：  
`--watch` 下 `globalThis.counter` 与 `localCount` 都会重新初始化；  
`--hot` 下 `localCount` 会重置，但挂在 `globalThis` 上的 `counter` 会持续累加。

## 7. `bunx`（临时执行 npm 包命令）

`bunx` 是 `bun x` 的别名，可理解为 Bun 版 `npx`。

```bash
# 临时执行 prettier（二进制来自 npm 包）
bunx prettier . --write

# 临时运行脚手架
bunx create-vite my-app

# 指定版本执行
bunx cowsay@1.6.0 "hello bunx"
```

:::card title="什么时候用 bunx" icon="material-icon-theme:console"
一次性执行 CLI、试用脚手架、避免全局安装污染。
:::

## 8. 实战建议

- 开发期默认 `bun --hot`，需要“完整重启语义”再切 `--watch`。
- TS 项目把“运行”和“类型检查”分开：运行用 Bun，静态检查用 `tsc --noEmit`。
- 新代码统一 ESM；仅在兼容老包时使用 CJS。
- 大型项目把路径别名写进 `tsconfig`，并在团队约定中固定导入层级。

::::collapse
- :+ 最小迁移清单（Node -> Bun）

  1. 用 Bun 跑现有测试：`bun test`。
  2. 用 Bun 启动原服务：`bun run src/index.ts`。
  3. 验证关键依赖（数据库、鉴权、日志）是否行为一致。
  4. 再决定是否重构到 `Bun.serve()` / Elysia。
::::
