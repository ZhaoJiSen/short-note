---
title: Vite
createTime: 2026/02/25 16:04:05
permalink: /engineering/n8cecFal/
---

在浏览器原生支持 ESM 之前，JS 并没有统一的模块化运行机制。开发者只能依赖 Rollup、Webpack 等工具，先把源码模块打包成浏览器可执行文件，再进行开发和调试。随着项目规模增大，这种“先整包再启动”的模式会越来越吃力：开发服务器启动慢、模块图越大等待越久，即使开启 HMR，改动反馈也可能要等数秒。

而当现代浏览器支持 ES Module 后，开发阶段终于可以直接运行模块化代码。

```html
<script type="module">
  // 必须写明后缀
  import { formatDate } from "./utils.js";
  import App from "./App.js";

  App.init();
</script>
```

> [!IMPORTANT]
> 然而，原生 ESM 依然存在几个明显的缺陷
>
> 1. 必须手动写清每一个文件的后缀
> 2. 文件依赖一旦过深，浏览器会发起大量模块请求，首屏性能容易受影响
> 3. TypeScript、JSX、Vue SFC 等语法浏览器不能直接识别，需要使用工具将其转换为浏览器可识别的语法

为解决上述问题，Vite 应运而生。它主要由两部分组成：一个==基于原生 ES 模块==的开发服务器，它提供了丰富的内置功能，HMR 速度极快；另一套面向生产构建的能力，预先配置好后可直接输出优化过的静态资源

## CSS 支持

Vite 的 CSS 能力可以按“从易到难”的路径理解：先导入、再隔离、再扩展、最后优化

:::::steps

1. 原生 CSS 支持

   开发阶段直接导入 CSS 即可，Vite 会处理 HMR

   :::code-tabs
   @tab main.ts

   ```ts
   import './styles/reset.css'
   import './styles/theme.css'
   ```

   :::

2. 支持用 CSS Modules 做作用域隔离

   当组件越来越多时，建议把组件样式改为 `.module.css/.module.scss`，避免命名冲突

   :::code-tabs
   @tab button.module.css

   ```css
   .primary-button {
     color: #fff;
     background: #1f6feb;
   }
   ```

   @tab button.ts

   ```ts
   import styles from './button.module.css'
   console.log(styles.primaryButton)
   ```

   :::

3. 支持接入预处理器（Sass/Less）

   需要变量、mixin、函数时再接入预处理器，Vite 无需额外插件

   :::code-tabs

   @tab install.sh

   ```bash
   pnpm add -D sass less
   ```

   @tab vite.config.ts

   ```ts
   import { defineConfig } from 'vite'

   export default defineConfig({
     css: {
       preprocessorOptions: {
         scss: {
           additionalData: '@use "@/styles/variables.scss" as *;',
         },
         less: {
           javascriptEnabled: true,
         },
       },
     },
   })
   ```

   :::

4. 支持接入 PostCSS 做后处理

   常见用途是自动补前缀、支持嵌套语法等

   :::code-tabs
   @tab install.sh

   ```bash
   pnpm add -D postcss autoprefixer postcss-nesting
   ```

   @tab postcss.config.js

   ```js
   export default {
     plugins: {
       'postcss-nesting': {},
       autoprefixer: {},
     },
   }
   ```

   :::

   > [!NOTE]
   > 如果安装了 `@tailwindcss/vite`，通常不必再额外安装 `postcss`、`autoprefixer` 等插件

5. 开启调试与构建优化

   调试阶段可以开 CSS sourcemap，构建阶段关注 CSS 拆分和兼容目标

   :::code-tabs
   @tab vite.config.ts

   ```ts
   import { defineConfig } from 'vite'

   export default defineConfig({
     css: {
       devSourcemap: true,
     },
     build: {
       cssCodeSplit: true,
       cssTarget: 'chrome61',
     },
   })
   ```

   :::

:::::

## TypeScript 支持

[+转译]: 在 Vite7 中这一步常见由 esbuild 处理，在 Vite8 路线中转向 Rolldown 体系

Vite 原生支持 TypeScript。**开发阶段会对 `.ts/.tsx` 做快速转译，让浏览器拿到可执行的 JavaScript；但默认不做类型检查**

:::code-tabs
@tab package.json

```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "build": "pnpm run typecheck && vite build"
  }
}
```

@tab tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite-env.d.ts"]
}
```

:::

::: note 为什么请求的是 `.ts` 文件，浏览器却能运行

这是 Vite 最关键的机制之一。在 Network 面板看到请求路径是 `.ts`，但并不等于浏览器在执行 TypeScript 源码。实际过程可以理解为 "浏览器请求 TS 路径，Vite 返回 JS 内容"

1. 浏览器先按 ESM 规则发起模块请求
2. 请求进入 Vite Dev Server（Connect 中间件链），Vite 接管该请求
3. Vite 根据模块类型判断处理策略：若是 `.ts/.tsx`，进入转译流程
4. Vite 在服务端调用转译器把 TS 转成 JS[+转译]
5. Vite 重写导入路径（如依赖预构建产物路径、带查询参数的模块标识），并注入开发期所需代码（HMR 边界、source map 信息等）
6. 浏览器最终收到的是可执行 JavaScript，因此可以直接运行；路径看起来是 `.ts`，但响应体已经是 JS

:::
