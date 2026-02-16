---
title: 模块
createTime: 2026/02/14 10:22:00
permalink: /node/bun/modules/
---

## 基础篇

### 模块类型与加载

Bun 同时支持 ESM 与 CommonJS，并提供 `bun:*` 内置模块（如 `bun:sqlite`、`bun:test`）。

:::table title="Bun 模块类型速查" full-width
| 模块类型 | 典型写法 | 说明 |
| --- | --- | --- |
| ESM | `import { x } from './x'` | 推荐默认方案 |
| CJS | `const x = require('./x')` | 兼容历史包 |
| 内置模块 | `import { Database } from 'bun:sqlite'` | Bun 提供的高性能能力 |
| 动态导入 | `await import('./x')` | 按需加载，适合懒执行 |
:::

### import 与导出组织

- 保持“一个模块只做一件事”，减少循环依赖概率。
- 用 `index.ts` 做聚合导出时，注意只导出公共 API。
- 在脚本入口中使用 `import.meta.main` 判断是否直接执行。

## 进阶篇

:::collapse
- :+ `bun:*` 模块的价值

  `bun:*` 模块通常是 Bun 原生实现，性能与 API 一致性更可控，适合核心链路。

- ESM/CJS 混用策略

  新代码优先 ESM；存量库继续 CJS，逐步收敛到 ESM。

- 路径与别名

  优先使用相对路径或标准别名，避免深层 `../../../` 降低可维护性。
:::

## 完整代码示例

下面示例展示一个“模块化配置加载器”，包含：默认导出、具名导出、动态导入与入口判断。

```ts
// file: config-loader.ts
export interface AppConfig {
  name: string;
  port: number;
  debug: boolean;
}

export const defaultConfig: AppConfig = {
  name: 'bun-app',
  port: 3000,
  debug: false,
};

export async function loadConfig(path = './app.config.json'): Promise<AppConfig> {
  const file = Bun.file(path);

  // 文件不存在时返回默认配置
  if (!(await file.exists())) {
    return defaultConfig;
  }

  // 读取配置并与默认值合并
  const raw = (await file.json()) as Partial<AppConfig>;
  return {
    ...defaultConfig,
    ...raw,
  };
}

// file: main.ts
import { loadConfig } from './config-loader';

async function bootstrap() {
  // 动态导入：只有在 debug 时才加载额外模块
  const config = await loadConfig();
  if (config.debug) {
    const debugTools = await import('./tools/debug-tools');
    debugTools.enable();
  }

  console.log(`应用 ${config.name} 启动在 :${config.port}`);
}

if (import.meta.main) {
  bootstrap().catch((error) => {
    console.error('启动失败', error);
    process.exit(1);
  });
}
```

## 最佳实践

- 对外只暴露稳定 API，内部实现分层到私有模块。
- 统一模块风格（全 ESM 或明确边界），降低维护成本。
- 为模块写最小单元测试，防止重构破坏导出契约。
- 大模块拆成“读取层 / 业务层 / 输出层”，提高复用性。

## 常见错误

- 在多个模块里互相 `import` 导致循环依赖。
- `default export` 与具名导出混用无规范，调用方阅读成本高。
- 动态导入滥用到高频路径，反而增加运行时开销。

