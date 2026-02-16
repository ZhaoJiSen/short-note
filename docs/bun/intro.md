---
title: 简介
createTime: 2026/02/14 10:21:00
permalink: /node/bun/intro/
---

> [!IMPORTANT]
> Bun 不只是运行时，它把包管理、脚本执行、测试、打包整合在一个工具链里。

## 基础篇

### 什么是 Bun

Bun 是由 Zig 编写的 JavaScript/TypeScript 运行时，底层基于 JSC[+jsc]，目标是减少启动与 I/O 开销。

[+jsc]: Bun 基于 JavaScriptCore，而不是 Node.js 使用的 V8，因此在实现细节和性能曲线会有差异。

### Bun 的能力边界

:::table title="Bun 核心能力" full-width
| 能力 | 命令 / API | 说明 |
| --- | --- | --- |
| 运行脚本 | `bun run index.ts` | 原生执行 TS/JS |
| 包管理 | `bun add` / `bun install` | 依赖安装与 lock 文件管理 |
| 测试 | `bun test` | 内置测试运行器 |
| 构建 | `bun build` | 打包前端或脚本 |
| 服务端 | `Bun.serve()` | 原生 HTTP/WebSocket 服务器 |
:::

### Bun 与 Node 的关键差异

- Bun 的默认定位更偏向“一体化工具链”，而 Node 更强调“运行时 + npm 生态”。
- Bun 原生支持直接运行 TS，Node 通常需要 `ts-node` 或预编译。
- 在冷启动、小文件 I/O、高并发连接等场景，Bun 通常更容易跑出更高吞吐。

## 进阶篇

:::details 什么时候优先选 Bun
- 你希望用一套工具完成安装、运行、测试、构建
- 你的项目以 API 服务、脚本工具为主
- 你希望降低 CI 时间与本地启动时间
:::

::: card title="迁移提醒" icon="vscode-icons:file-type-node"
从 Node 迁移到 Bun 时，要先确认关键依赖是否用到了 Node 私有行为（尤其是原生模块、低层网络库）。
:::

## 完整代码示例

下面示例是一个最小可运行的 Bun CLI，包含参数解析、文件读取和 JSON 输出。

```ts
#!/usr/bin/env bun

// 读取命令行参数：bun run cli.ts ./package.json
const [, , target = './package.json'] = Bun.argv;

async function main() {
  // Bun.file 返回一个惰性文件对象，不会立刻把文件读入内存
  const file = Bun.file(target);

  if (!(await file.exists())) {
    console.error(`文件不存在: ${target}`);
    process.exit(1);
  }

  // 读取为文本并尝试解析 JSON
  const text = await file.text();
  const json = JSON.parse(text) as Record<string, unknown>;

  // 输出结果，方便 shell 管道继续处理
  console.log(
    JSON.stringify(
      {
        file: target,
        keys: Object.keys(json).length,
        hasScripts: typeof json.scripts === 'object',
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});
```

## 最佳实践

- 用 `bun --watch` 做开发阶段热重启，减少手动重启成本。
- 用 `bunx` 执行临时命令，避免全局安装工具污染环境。
- 在迁移项目前先跑一轮 `bun test` 与核心接口压测。
- 对性能敏感路径使用 ==同一套基准脚本== 做 Node/Bun 对比，不要只看单次结果。

## 常见错误

- 误以为“跑起来就等于完全兼容 Node”，未验证生产依赖。
- 把 Bun 当作纯包管理器使用，忽略了运行时行为差异。
- 混用 `npm/pnpm/bun` 多套 lock 文件，导致团队环境不一致。

