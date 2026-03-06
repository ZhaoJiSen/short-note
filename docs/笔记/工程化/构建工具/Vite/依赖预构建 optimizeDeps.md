---
title: 依赖预构建 optimizeDeps
createTime: 2026/02/25 11:22:30
permalink: /engineering/1m4nkdkg/
---

`optimizeDeps` 是 Vite 开发期性能和兼容性的关键配置。它的核心作用是先把第三方依赖做一次预处理，再让浏览器按 ESM 方式快速加载。

## 为什么需要依赖预构建

主要解决两个问题：
1. 有些包是 `CommonJS/UMD`，浏览器原生 ESM 无法直接高效消费。  
2. 大型依赖树会导致 dev 冷启动时请求很多文件，首屏等待变长。

预构建后，常见收益是：
- 冷启动更快
- HMR 初始稳定性更好
- 混合模块格式兼容性更好

## 常用配置项

:::table full-width
| 配置项 | 作用 | 常见写法 | 场景 |
| --- | --- | --- | --- |
| `optimizeDeps.include` | 强制预构建某些依赖 | `['lodash-es']` | 大依赖、经常被多页引用 |
| `optimizeDeps.exclude` | 排除预构建 | `['your-lib']` | 依赖内部结构特殊、不适合预构建 |
| `optimizeDeps.entries` | 指定扫描入口 | `['src/main.ts']` | 非标准入口结构、monorepo 子应用 |
| `optimizeDeps.esbuildOptions` | 预构建阶段细调 | `{ target: 'es2020' }` | 需要特殊转译规则 |
| `optimizeDeps.force` | 强制重新预构建 | `true` | 升级依赖后排查缓存问题 |
:::

## 基础示例

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['lodash-es', 'dayjs'],
    exclude: ['your-big-lib'],
    entries: ['src/main.ts'],
  },
})
```

## Monorepo 场景建议

在 monorepo 场景下，依赖重复实例和入口分散比较常见。建议显式指定入口与 include 列表，减少自动扫描的不确定性。

:::code-tabs
@tab vite.config.ts
```ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    entries: ['apps/web/src/main.ts'],
    include: ['vue', 'vue-router', 'pinia'],
  },
  resolve: {
    dedupe: ['vue'],
  },
})
```

@tab 排查缓存
```bash
# 删除 Vite 预构建缓存后重启
rm -rf node_modules/.vite
pnpm vite
```
:::

## 什么时候该调 optimizeDeps

可以把它当“问题导向配置”，不是所有项目都要手调：
- 冷启动很慢
- 启动时频繁出现依赖解析告警
- 特定三方包在 dev 可用性不稳定

:::details 常见误区
1. 看到 `optimizeDeps` 就一次性把依赖全塞进 `include`。  
2. `exclude` 太激进，导致本应预构建的包回退到慢路径。  
3. 忽略缓存影响，改完配置不清缓存就判断无效。  
:::
