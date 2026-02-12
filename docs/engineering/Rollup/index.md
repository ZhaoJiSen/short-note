---
title: Rollup
createTime: 2026/02/10 10:30:10
permalink: /engineering/build-rollup/
---

> [!IMPORTANT]
> Rollup 是一个以 `ESM` 为核心的打包工具，特别适合 ==组件库/SDK== 这类“追求产物干净、Tree Shaking 友好”的场景。

:::table title="Rollup 与常见工具定位" full-width
| 维度 | Rollup | Webpack | esbuild | Vite |
| --- | --- | --- | --- | --- |
| 核心定位 | ESM 优先的 Bundler | 通用工程化 Bundler | 高性能 Bundler/Transpiler | 开发服务器 + 构建方案 |
| 典型优势 | 库构建产物干净 | 应用工程能力全面 | 构建速度极快 | 开发体验好 |
| 插件生态 | 丰富（库场景成熟） | 最丰富 | 相对精简 | 依托 Rollup 生态 |
| 上手复杂度 | 中等 | 中高 | 低 | 低 |
| 常见场景 | 组件库、工具库、SDK | 中大型应用 | 工具链中间层、快速构建 | 现代前端应用 |
:::

:::collapse
- 什么时候优先用 Rollup

  1. 你在做 npm 包、组件库、SDK，希望输出 `esm/cjs` 多格式产物
  2. 你希望 Tree Shaking 更稳定，尽量减少无效代码进入最终包
  3. 你要精细控制产物结构（文件命名、格式、外部依赖策略）
:::

安装：

```bash
pnpm add -D rollup
```

## 核心概念

### ESM 优先与 Tree Shaking

Rollup 的核心价值在于：基于 `ESM` 静态结构做依赖分析，因此更容易做准确的 Tree Shaking。

:::table full-width
| 概念 | 解决的问题 | 使用注意 |
| --- | --- | --- |
| ESM 静态分析 | 精准识别“哪些导出真正被使用” | 优先使用 `import/export`，避免过度动态导入写法 |
| Tree Shaking | 减少无效代码进入产物 | 三方包副作用要明确（`sideEffects` 声明） |
| External 外部化 | 避免把运行时依赖打进库包 | React/Vue 等 peer 依赖通常应 external |
:::

### 输入输出模型

理解 Rollup 的配置时，可以把它看成：`input -> plugins -> output`。

:::table full-width
| 模块 | 作用 | 常见配置 |
| --- | --- | --- |
| `input` | 构建入口 | `src/index.ts` / 多入口对象 |
| `plugins` | 对源码做解析、转换、压缩等处理 | `nodeResolve/commonjs/typescript/terser` |
| `output` | 定义产物格式和文件位置 | `format/file/dir/sourcemap/globals` |
| `external` | 声明不打包的依赖 | `['react', 'vue']` |
:::

### 产物格式（format）

不同使用方需要不同模块格式，Rollup 的一个核心能力就是“一次源码输入，多格式输出”。

:::table full-width
| 格式 | 适用场景 | 注意事项 |
| --- | --- | --- |
| `esm` | 现代构建工具、浏览器 ESM | 库分发首选格式 |
| `cjs` | Node.js CommonJS 生态 | 常用于兼容老工具链 |
| `iife` | 浏览器 `<script>` 直接引入 | 需搭配 `output.name` |
| `umd` | 通用脚本分发（新项目较少） | 需关注全局变量冲突 |
:::

::::details 常用配置

> [!NOTE]
> - 库构建通常至少提供 `esm + cjs` 两份产物
> - `external` 与 `output.globals` 需要配套考虑（尤其是 UMD/IIFE）
> - 建议把开发和生产差异集中在插件层，而不是拆很多份配置

:::table full-width
| 配置项 | 作用 | 常见值 | 实战建议 |
| --- | --- | --- | --- |
| `input` | 构建入口 | `src/index.ts` | 库入口尽量单一且语义清晰 |
| `output.file` | 单文件输出 | `dist/index.esm.js` | 单入口常用 |
| `output.dir` | 多文件输出目录 | `dist` | 代码分割或多入口时使用 |
| `output.format` | 产物模块格式 | `esm/cjs/iife/umd` | 库至少支持 `esm/cjs` |
| `output.sourcemap` | 生成 source map | `true` | 便于定位线上问题 |
| `external` | 外部化依赖 | `['react']` | peer 依赖优先 external |
| `plugins` | 构建扩展能力 | 插件数组 | 插件顺序会影响结果 |
| `treeshake` | 控制 Tree Shaking 行为 | `true` / 对象配置 | 默认开启，必要时再细调 |
:::
::::

## 配置方式

Rollup 常见有三种使用方式：CLI、配置文件、JavaScript API。

:::table full-width
| 方式 | 适合场景 | 优点 | 局限 |
| --- | --- | --- | --- |
| CLI | 快速试验 | 直接执行、零样板 | 复杂场景难维护 |
| `rollup.config.*` | 日常工程构建 | 配置可版本化、可复用 | 初次上手需理解配置结构 |
| JS API | 工具链二次封装 | 灵活可编程 | 代码复杂度更高 |
:::

:::code-tabs
@tab CLI
```bash
# 最小打包
npx rollup src/index.js --file dist/index.js --format esm

# 基于配置文件并监听
npx rollup -c -w
```

@tab rollup.config.mjs
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.js',
  output: {
    file: 'dist/index.esm.js',
    format: 'esm',
    sourcemap: true,
  },
})
```

@tab JS API
```js
import { rollup } from 'rollup'

const bundle = await rollup({
  input: 'src/index.js',
})

await bundle.write({
  file: 'dist/index.esm.js',
  format: 'esm',
})

await bundle.close()
```
:::

## Plugin

当默认能力不够时，插件就是 Rollup 的“扩展接口”。

### 插件语法模板

一个 Rollup 插件本质是一个对象，至少包含 `name`，并按需实现各类 hook。

```js
const myPlugin = {
  name: 'my-plugin',

  buildStart() {
    // 构建开始
  },

  resolveId(source, importer) {
    // 自定义模块解析
    return null
  },

  load(id) {
    // 自定义加载文件内容
    return null
  },

  transform(code, id) {
    // 对源码做转换
    return null
  },

  generateBundle(outputOptions, bundle) {
    // 产物输出前可做额外处理
  },
}
```

:::table full-width
| Hook | 触发阶段 | 常见用途 |
| --- | --- | --- |
| `buildStart` | 构建启动时 | 初始化缓存、打印信息 |
| `resolveId` | 解析模块路径时 | 别名映射、虚拟模块 |
| `load` | 读取模块内容时 | 自定义文件加载 |
| `transform` | 代码转换时 | 代码注入、语法转换 |
| `generateBundle` | 产物生成时 | 产物检查、额外文件输出 |
:::

:::code-tabs
@tab 常用插件组合（TS 库）
```js
import { defineConfig } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

export default defineConfig({
  input: 'src/index.ts',
  external: ['react'],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    terser(), // 生产构建时压缩
  ],
  output: {
    file: 'dist/index.esm.js',
    format: 'esm',
    sourcemap: true,
  },
})
```

@tab 自定义插件（构建耗时）
```js
import { defineConfig } from 'rollup'

function timingPlugin() {
  return {
    name: 'timing-plugin',
    buildStart() {
      console.time('rollup build')
    },
    generateBundle() {
      console.timeEnd('rollup build')
    },
  }
}

export default defineConfig({
  input: 'src/index.js',
  plugins: [timingPlugin()],
  output: {
    file: 'dist/index.esm.js',
    format: 'esm',
  },
})
```
:::

## 库模式构建实践

下面给一套可直接落地的库构建流程，目标是输出 `esm + cjs + d.ts`。

:::::steps
1. 安装依赖

   ```bash
   pnpm add -D rollup typescript tslib @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript @rollup/plugin-terser rollup-plugin-dts
   ```

2. 准备 `tsconfig.json`

   ```json
   {
     "compilerOptions": {
       "target": "ES2018",
       "module": "ESNext",
       "strict": true,
       "skipLibCheck": true
     },
     "include": ["src"]
   }
   ```

3. 编写 `rollup.config.mjs`

   ```js
   import { defineConfig } from 'rollup'
   import nodeResolve from '@rollup/plugin-node-resolve'
   import commonjs from '@rollup/plugin-commonjs'
   import typescript from '@rollup/plugin-typescript'
   import terser from '@rollup/plugin-terser'
   import dts from 'rollup-plugin-dts'

   const external = ['react', 'react-dom']

   export default defineConfig([
     {
       input: 'src/index.ts',
       external,
       plugins: [
         nodeResolve(),
         commonjs(),
         typescript({ tsconfig: './tsconfig.json' }),
       ],
       output: [
         {
           file: 'dist/index.esm.js',
           format: 'esm',
           sourcemap: true,
         },
         {
           file: 'dist/index.cjs',
           format: 'cjs',
           sourcemap: true,
           exports: 'named',
         },
       ],
     },
     {
       input: 'src/index.ts',
       external,
       plugins: [dts()],
       output: {
         file: 'dist/index.d.ts',
         format: 'esm',
       },
     },
     {
       input: 'src/index.ts',
       external,
       plugins: [
         nodeResolve(),
         commonjs(),
         typescript({ tsconfig: './tsconfig.json' }),
         terser(),
       ],
       output: {
         file: 'dist/index.esm.min.js',
         format: 'esm',
         sourcemap: true,
       },
     },
   ])
   ```

4. 配置 `package.json` 导出字段

   ```json
   {
     "main": "dist/index.cjs",
     "module": "dist/index.esm.js",
     "types": "dist/index.d.ts",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.esm.js",
         "require": "./dist/index.cjs"
       }
     },
     "scripts": {
       "build": "rollup -c",
       "dev": "rollup -c -w"
     }
   }
   ```

5. 执行命令

   ```bash
   pnpm run dev
   pnpm run build
   ```
:::::

## 最佳实践与常见错误

:::details 最佳实践
- 库构建时优先输出 `esm + cjs + d.ts`，并保证导出字段一致。
- 将 React/Vue 等运行时依赖标记为 `external`，减少重复打包。
- 插件顺序保持稳定并写明原因（如 `resolve -> commonjs -> typescript`）。
- 在 CI 中固定 Node 与包管理器版本，减少构建差异。
:::

:::details 常见错误
- 忘记配置 `external`：导致把 peer 依赖打进库包，引发体积和版本冲突。
- 只产出一种格式：下游工具链兼容性不足。
- 插件顺序混乱：可能出现解析失败、CommonJS 转换异常。
- 误以为 Rollup 负责类型检查：TypeScript 诊断仍应由 `tsc` 或 `vue-tsc` 兜底。
:::
