---
title: TS 支持
createTime: 2026/02/14 10:23:00
permalink: /node/bun/typescript/
---

## 基础篇

### Bun 的 TypeScript 处理模型

Bun 可以直接执行 `.ts` 文件，默认做快速转译，不做完整类型检查[+类型检查]。

[+类型检查]: “能运行”不等于“类型正确”。建议在 CI 加 `tsc --noEmit` 做静态校验。

:::table title="Bun + TS 常用命令" full-width
| 目标 | 命令 | 说明 |
| --- | --- | --- |
| 运行 TS 脚本 | `bun run src/main.ts` | 快速开发 |
| 监听重启 | `bun --watch src/main.ts` | 本地调试 |
| 类型检查 | `bunx tsc --noEmit` | 发布前保障 |
| 运行测试 | `bun test` | 支持 TS 测试文件 |
:::

### tsconfig 的建议基线

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

## 进阶篇

::: card title="类型安全边界" icon="material-icon-theme:typescript"
Bun 负责“跑得快”，TypeScript 编译器负责“类型正确”，两者职责不同，项目里最好同时启用。
:::

:::details 团队协作建议
- 本地开发：`bun --watch`
- 提交前：`bunx tsc --noEmit && bun test`
- CI：把类型检查和测试拆成独立任务，定位问题更快
:::

## 完整代码示例

示例演示：严格类型 + 运行时校验 + 错误处理，避免“类型看起来没问题但线上脏数据崩溃”。

```ts
// file: src/env.ts
interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'test' | 'production';
}

function readNumber(key: string, fallback: number): number {
  const value = Bun.env[key];
  if (!value) return fallback;

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${key} 必须是数字，当前值: ${value}`);
  }
  return parsed;
}

function readNodeEnv(): EnvConfig['NODE_ENV'] {
  const value = Bun.env.NODE_ENV ?? 'development';
  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }
  throw new Error(`NODE_ENV 非法: ${value}`);
}

export function loadEnv(): EnvConfig {
  return {
    PORT: readNumber('PORT', 3000),
    NODE_ENV: readNodeEnv(),
  };
}

// file: src/main.ts
import { loadEnv } from './env';

try {
  const env = loadEnv();
  console.log('环境变量解析成功', env);
} catch (error) {
  console.error('配置错误，应用终止', error);
  process.exit(1);
}
```

## 最佳实践

- 始终配合 `strict: true`，避免隐式 `any` 滑入代码库。
- 把“环境变量读取”封装成单独模块，统一类型与校验。
- 对外部输入做运行时验证，不要只依赖 TS 编译期类型。
- 把 `bun-types` 放到 `types` 中，避免 IDE 缺失 Bun 全局类型。

## 常见错误

- 只运行 `bun run`，不做 `tsc --noEmit`，导致类型问题积累。
- 误把 `NODE_ENV` 当任意字符串使用，分支逻辑失控。
- 在 `strict` 关闭的项目中引入 Bun，新代码质量无法保证。

