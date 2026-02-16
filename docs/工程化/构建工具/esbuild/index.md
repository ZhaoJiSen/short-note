---
title: esbuild
createTime: 2026/02/10 10:30:20
permalink: /engineering/build-esbuild/
---

> [!IMPORTANT]
> esbuild 是一个 "以速度优先" 为核心设计的构建工具，适合做 ==快速打包==、==快速转译== 和 ==高频重构建==

## 使用方式

可以把 esbuild 理解为三种模型：命令行（CLI）、脚本化（JS API）、长期运行上下文（Context API）

:::table full-width
| 方式 | 适合谁 | 优点 | 局限 |
| --- | --- | --- | --- |
| CLI | 快速试验、简单脚本 | 命令直接、零样板 | 复杂逻辑不易维护 |
| JS API | 日常工程化构建 | 可编程、可复用 | 需要自己组织构建脚本 |
| Context API | 本地开发和监听场景 | 支持 `watch` / `serve` / `rebuild` | 不是完整 HMR 方案 |
:::

实际使用时，通常把 `CLI` 用于临时验证，`JS API` 作为正式构建入口；这样配置可版本化、可测试、可回滚

:::code-tabs
@tab CLI
```bash
# 最小可用：单入口打包
npx esbuild src/main.ts --bundle --outfile=dist/main.js

# 生产常见参数：压缩 + sourcemap + 目标环境
npx esbuild src/main.ts \
  --bundle \
  --minify \
  --sourcemap \
  --target=es2018 \
  --outfile=dist/main.js
```

@tab JS API
```js
// scripts/build.mjs
import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'browser',
  target: ['es2018'],
  sourcemap: true,
  minify: false,
})

console.log('build done')
```

@tab Context API
```js
// scripts/dev.mjs
import * as esbuild from 'esbuild'

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  sourcemap: true,
})

// 启动监听：文件变更自动重建
await ctx.watch()

// 启动静态服务
await ctx.serve({ servedir: 'dist', port: 9528 })

console.log('dev server: http://127.0.0.1:9528')
```
:::

::::details 常用配置

> [!NOTE]
> - `outfile`：你确定只有一个入口、且只输出一个文件时最直接
> - `outdir`：你有多入口、动态导入或需要拆分 chunk 时更安全
> - 如果需要做长期缓存，优先 `outdir + entryNames/chunkNames` 的命名策略
> - 建议把 "开发配置" 和 "生产配置" 做最小差异化，避免多份配置长期漂移

:::table full-width
| 配置项 | 作用 | 常见值 | 实战建议 |
| --- | --- | --- | --- |
| `entryPoints` | 构建入口 | `['src/main.ts']` | 多入口建议配合 `outdir` |
| `outfile` | 单文件输出路径 | `dist/main.js` | 仅适合单入口场景 |
| `outdir` | 多文件输出目录 | `dist` | 多入口/代码分割推荐 |
| `format` | 模块格式 | `esm` / `cjs` / `iife` | 浏览器项目优先 `esm` |
| `splitting` | 启用代码分割 | `true` | 需要 `format: 'esm'` |
| `metafile` | 产物依赖信息 | `true` | 可用于体积分析 |
| `bundle` | 是否打包依赖 | `true` | 应用构建通常开启 |
| `minify` | 压缩代码 | `true/false` | 生产开启，开发关闭 |
| `sourcemap` | 生成 source map | `true` / `'inline'` | 开发建议开启 |
| `target` | 目标 JS 环境 | `['es2018']` 等 | 根据运行环境设定 |
| `platform` | 平台类型 | `browser` / `node` | 别写错，否则内置模块处理会变 |
| `external` | 外部化依赖 | `['react']` 等 | 库构建常用 |
| `define` | 编译期常量替换 | `process.env.NODE_ENV` | 记得值要字符串化 |
| `loader` | 资源文件处理 | `{ '.png': 'file' }` | 静态资源要显式声明 |
:::
::::

### Loader

`Loader` 在 esbuild 中是内置能力，无需安装额外 loader，只需要在配置里声明后缀映射

::::details 常用的映射
:::table full-width
| 内置类型 | 说明 |
| --- | --- |
| `js` | 按 JavaScript 解析 |
| `jsx` | 按 JSX 解析 |
| `ts` | 按 TypeScript 解析（仅转译） |
| `tsx` | 按 TSX 解析 |
| `json` | 按 JSON 模块导入 |
| `css` | 处理 CSS 文件 |
| `text` | 以纯文本字符串导入 |
| `file` | 输出为独立文件并返回 URL |
| `dataurl` | 转为 Data URL 内联到代码中 |
| `binary` | 以二进制数据形式加载 |
:::
::::

> [!NOTE]
> `less/scss/stylus` 这类预处理语法不属于内置 loader，通常要配合插件或前置编译

:::code-tabs
@tab loader 使用
```js
import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  loader: {
    '.png': 'file', // 输出文件并返回 URL
    '.svg': 'dataurl', // 转成 data URL（小图标常用）
    '.txt': 'text', // 作为字符串内容导入
    '.css': 'css', // 让 CSS 进入构建流程
  },
})
```

@tab 导入效果
```ts
import logoUrl from './assets/logo.png'
import iconDataUrl from './assets/icon.svg'
import readmeText from './README.txt'

console.log(logoUrl) // /assets/logo-xxxx.png
console.log(iconDataUrl) // data:image/svg+xml;base64,...
console.log(readmeText) // README 文本内容
```
:::

可以把 `loader` 理解成 "按后缀分拣文件" ：比如把 `.png` 作为资源文件处理、把 `.txt` 作为文本处理；而像 scss、PostCSS、CSS Modules 这类完整样式流程，建议交给专门工具做完再交给 esbuild 打包，这样更稳也更好排错

### Plugin

当内置配置（`loader/define/external` 等）不够用时，就需要 `plugin` 来扩展构建过程。插件本质是一个包含 name 和 setup 的对象

:::table full-width
| 语法项 | 作用 | 你需要注意 |
| --- | --- | --- |
| `name` | 插件名称（用于日志和排错） | 名称尽量唯一、可读 |
| `setup(build)` | 注册插件钩子 | 所有扩展逻辑都在这里定义 |
| `onResolve` | 拦截并改写模块路径解析 | 必须用 `filter` 限定范围，避免误伤全量模块 |
| `onLoad` | 自定义模块内容加载 | 返回值常用 `contents + loader` |
| `onStart/onEnd` | 构建开始/结束生命周期 | 适合做统计、日志、告警 |
:::

:::code-tabs
@tab 模板语法
```js
const myPlugin = {
  name: 'my-plugin',
  setup(build) {
    // 构建开始前触发
    build.onStart(() => {})

    // 模块路径解析阶段触发
    build.onResolve({ filter: /^@\// }, (args) => {
      return { path: args.path }
    })

    // 模块加载阶段触发
    build.onLoad({ filter: /\.txt$/ }, async (args) => {
      return {
        contents: 'hello from plugin',
        loader: 'text',
      }
    })

    // 构建结束后触发
    build.onEnd((result) => {})
  },
}
```

@tab 社区插件（Vue SFC）
```js
import * as esbuild from 'esbuild'
import vuePlugin from 'esbuild-plugin-vue-next'

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [vuePlugin()], // 让 esbuild 能识别并处理 .vue
})
```

@tab 自定义插件（构建耗时）
```js
import * as esbuild from 'esbuild'

const timingPlugin = {
  name: 'timing-plugin',
  setup(build) {
    build.onStart(() => {
      console.time('esbuild build')
    })

    build.onEnd((result) => {
      console.timeEnd('esbuild build')
      console.log('errors:', result.errors.length)
      console.log('warnings:', result.warnings.length)
    })
  },
}

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [timingPlugin],
})
```
:::

### 语言与框架支持

esbuild 原生支持 `JS/TS/JSX/TSX` 的高性能转译，但不同技术栈的 "工程完整度" 并不相同

:::table full-width
| 技术栈 | 原生支持程度 | 补充内容 | 架构注意点 |
| --- | --- | --- | --- |
| TypeScript | 语法转译原生支持 | 类型检查交给 `tsc --noEmit` | `typecheck` 建议作为 CI 硬门禁 |
| React | JSX/TSX 原生支持 | 按项目配置 JSX runtime | 注意 `jsx` 策略与产物兼容性 |
| Vue | `.vue` SFC 非原生 | 需要社区插件或前置编译 | 复杂 Vue 工程通常更适合 Vite |
:::

:::code-tabs
@tab TypeScript
```js
import * as esbuild from 'esbuild'

// esbuild 负责快速转译与打包
await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
})
```

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "pnpm run typecheck && node scripts/build.mjs --prod"
  }
}
```

@tab React
```js
import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  platform: 'browser',
  format: 'esm',
  jsx: 'automatic', // React 17+ 常用
  jsxImportSource: 'react',
  loader: { '.tsx': 'tsx' },
})
```

@tab Vue
```js
import * as esbuild from 'esbuild'
import vuePlugin from 'esbuild-plugin-vue-next'

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  plugins: [vuePlugin()], // 处理 .vue SFC
})
```
:::

## 自定义插件


## 开发与构建流水线

:::::steps
1. 安装依赖

   先安装基础依赖。工程实践中建议锁定 Node 与包管理器版本，减少构建漂移：

   ```bash
   pnpm add -D esbuild typescript
   # React 项目补充
   pnpm add react react-dom
   # Vue + esbuild（SFC）补充
   pnpm add vue
   pnpm add -D esbuild-plugin-vue-next
   ```

2. 编写统一构建脚本

   用一个脚本同时承载 `dev/prod` 两种模式，避免配置分叉太多；后续迁移或回滚时也更容易控制风险。

   ```js
   // scripts/esbuild.mjs
   import * as esbuild from 'esbuild'
   import vuePlugin from 'esbuild-plugin-vue-next'

   const isProd = process.argv.includes('--prod')
   const isVueProject = process.argv.includes('--vue')

   const baseConfig = {
     entryPoints: ['src/main.ts'],
     bundle: true,
     outdir: 'dist',
     format: 'esm',
     platform: 'browser',
     target: ['es2018'],
     sourcemap: !isProd,
     minify: isProd,
     splitting: true,
     define: {
       'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
     },
     plugins: isVueProject ? [vuePlugin()] : [],
   }

   async function run() {
     if (isProd) {
       await esbuild.build(baseConfig)
       console.log('production build done')
       return
     }

     const ctx = await esbuild.context(baseConfig)
     await ctx.watch()
     await ctx.serve({ servedir: 'dist', port: 9528 })
     console.log('dev server: http://127.0.0.1:9528')
   }

   run().catch((err) => {
     console.error(err)
     process.exit(1)
   })
   ```

3. 配置 package.json 脚本命令

   把常用命令统一收敛在脚本里，团队协作时更稳定。

   ```json
   {
     "scripts": {
       "dev": "node scripts/esbuild.mjs",
       "dev:vue": "node scripts/esbuild.mjs --vue",
       "typecheck": "tsc --noEmit",
       "build": "pnpm run typecheck && node scripts/esbuild.mjs --prod",
       "build:vue": "pnpm run typecheck && node scripts/esbuild.mjs --prod --vue"
     }
   }
   ```

4. 处理静态资源与外部依赖

   应用通常需要同时处理图片等资源，并按需外部化一部分包。

   ```js
   import * as esbuild from 'esbuild'

   await esbuild.build({
     entryPoints: ['src/main.ts'],
     bundle: true,
     outdir: 'dist',
     loader: {
       '.png': 'file',
       '.svg': 'file',
       '.woff2': 'file',
     },
     external: ['react', 'react-dom'], // 库模式下常用
   })
   ```

5. 产物分析与体积排查

   构建慢或包体积异常时，先用 `metafile` 看依赖图，再决定优化动作。建议在团队内固定一套分析阈值（如首包体积、构建耗时）用于长期跟踪。

   ```js
   import * as esbuild from 'esbuild'

   const result = await esbuild.build({
     entryPoints: ['src/main.ts'],
     bundle: true,
     outdir: 'dist',
     metafile: true,
   })

   // 输出一份可读的体积分析文本
   console.log(await esbuild.analyzeMetafile(result.metafile, { verbose: true }))
   ```

6. 执行命令

   ```bash
   pnpm run dev
   pnpm run build
   # Vue 项目可执行
   pnpm run dev:vue
   pnpm run build:vue
   ```
:::::
