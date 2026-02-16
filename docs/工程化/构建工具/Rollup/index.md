---
title: Rollup
createTime: 2026/02/10 10:30:10
permalink: /engineering/build-rollup/
---

> [!IMPORTANT]
> Rollup 是一个以 `ESM` 为核心的打包工具，适合 ==组件库/SDK== 这类“追求产物干净、Tree Shaking 友好”的场景。

:::collapse expand
- 适用场景

  1. 做 npm 包、组件库、SDK，希望输出 `es/cjs` 多格式产物
  2. 希望 Tree Shaking 更稳定，尽量减少无效代码进入最终包
  3. 要精细控制产物结构（文件命名、格式、外部依赖策略）
:::

## 使用方式

Rollup 常见有三种使用方式：CLI、配置文件、JavaScript API。日常项目建议以配置文件为主，JS API 用于工具链二次封装。

:::table full-width
| 方式 | 适合场景 | 优点 |
| --- | --- | --- |
| CLI | 快速试验 | 直接执行、零样板 |
| `rollup.config.*` | 日常工程构建 | 配置可版本化、可复用 |
| JS API | 工具链二次封装 | 灵活可编程 |
:::

:::code-tabs
@tab CLI
```bash
# 最小打包
npx rollup src/index.js --file dist/index.js --format es

# 基于配置文件并监听
npx rollup -c -w
```

@tab 配置文件
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.js',
  output: {
    file: 'dist/index.es.js',
    format: 'es',
    sourcemap: true,
  },
})
```
:::

## 基本使用

### input

`input` 用来声明构建入口。入口可以是单文件，也可以是多入口对象。

:::code-tabs
@tab 单入口
```js
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.es.js',
    format: 'es',
  },
}
```

@tab 多入口
```js
export default {
  input: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'es',
  },
}
```
:::

### output

`output` 决定产物如何落盘。你可以输出单文件，也可以通过数组一次输出多种格式。

#### 产物格式（format）

不同使用方需要不同模块格式，Rollup 的一个核心能力就是“一次源码输入，多格式输出”。

:::table full-width
| 格式 | 适用场景 | 注意事项 |
| --- | --- | --- |
| `es` | 现代构建工具、浏览器 ESM | 库分发首选格式 |
| `cjs` | Node.js CommonJS 生态 | 常用于兼容老工具链 |
| `iife` | 浏览器 `<script>` 直接引入 | 需搭配 `output.name` |
| `umd` | 通用脚本分发 | 需配置 `name/globals` |
| `amd` | 旧模块加载体系 | 新项目较少使用 |
| `system` | SystemJS 生态 | 按需使用 |
:::

> [!NOTE]
> `commonjs/esm/module/systemjs` 是别名写法，Rollup 内部会映射到 `cjs/es/es/system`。实战里建议直接写标准值：`cjs/es/system`。

#### 多格式打包写法

```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['react'],
  output: [
    {
      file: 'dist/index.es.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.iife.js',
      format: 'iife',
      name: 'MyLib',
      globals: { react: 'React' },
      sourcemap: true,
    },
  ],
})
```

#### globals 与 exports（结合 lodash）

`output.globals` 和 `output.exports` 经常一起出现，但它们解决的是两个不同问题：
- `globals`：给 `umd/iife` 产物里的外部依赖指定浏览器全局变量名
- `exports`：控制 `cjs` 产物的导出方式（`default/named/auto/none`）

:::code-tabs
@tab globals（UMD + lodash）
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['lodash'],
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'MyLib',
    globals: {
      lodash: '_', // 告诉 UMD 包：lodash 来自 window._
    },
  },
})
```

@tab exports（CJS + lodash）
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['lodash'],
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    exports: 'named', // 同时导出命名成员时更稳定
  },
})
```

@tab 示例源码（src/index.ts）
```ts
import chunk from 'lodash/chunk'

export function splitArray(list: unknown[], size = 2) {
  return chunk(list, size)
}

export default splitArray
```
:::

> [!NOTE]
> `globals` 只对 `umd/iife` 生效；`es/cjs` 不需要配置 `globals`。

#### 输出命名规则

`output` 还负责控制产物命名。多入口或代码分割场景下，命名规则会直接影响缓存策略与排错效率。

:::table full-width
| 配置项 | 作用 | 常见值 | 使用建议 |
| --- | --- | --- | --- |
| `output.entryFileNames` | 入口文件命名规则 | `'[name].js'` | 多入口场景建议显式配置 |
| `output.chunkFileNames` | chunk 文件命名规则 | `'chunks/[name]-[hash].js'` | 建议带 `hash` 防缓存污染 |
| `output.assetFileNames` | 静态资源命名规则 | `'assets/[name]-[hash][extname]'` | 配合 CDN 缓存策略使用 |
:::

```js
export default {
  input: {
    index: 'src/index.ts',
    utils: 'src/utils.ts',
  },
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
  },
}
```

### sourcemap

`sourcemap` 用于把产物映射回源码，便于调试和错误定位。库项目建议默认开启。

```js
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.es.js',
    format: 'es',
    sourcemap: true,
  },
}
```

### external

`external` 用来声明“哪些依赖不应被打进最终产物”。  
对库项目来说，这一步非常关键：如果把 `react/vue/lodash` 这类运行时依赖打进去，容易导致体积膨胀和版本冲突。

:::table full-width
| 写法 | 示例 | 适用场景 |
| --- | --- | --- |
| 字符串数组 | `external: ['react', 'lodash']` | 依赖列表稳定、数量不多 |
| 正则表达式 | `external: [/^lodash/]` | 需要匹配子路径（如 `lodash/chunk`） |
| 函数 | `external: (id) => id.startsWith('lodash')` | 复杂规则、按条件动态判断 |
:::

:::code-tabs
@tab 基础写法（lodash）
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['lodash', 'react'],
  output: [
    { file: 'dist/index.es.js', format: 'es' },
    { file: 'dist/index.cjs', format: 'cjs', exports: 'named' },
  ],
})
```

@tab 子路径匹配（lodash/*）
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: [/^lodash(\/|$)/], // 匹配 lodash 和 lodash/chunk 等子路径
  output: {
    file: 'dist/index.es.js',
    format: 'es',
  },
})
```

@tab 配合 globals（UMD）
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['lodash'],
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'MyLib',
    globals: {
      lodash: '_', // 浏览器侧从 window._ 读取 lodash
    },
  },
})
```
:::

> [!NOTE]
> 库构建时，`peerDependencies` 通常应与 `external` 保持一致。

### 其他重要配置

你现在已经覆盖了 `input/output/sourcemap/external/plugins`，下面这些配置在实战里同样关键。

:::table full-width
| 配置项 | 作用 | 常见写法 | 使用建议 |
| --- | --- | --- | --- |
| `treeshake` | 控制 Tree Shaking 细节 | `true` / 对象 | 默认开启，必要时精细调优 |
| `watch` | 监听模式配置 | `{ include: 'src/**' }` | 提升本地迭代效率 |
| `onwarn` | 自定义警告处理 | `(warning, warn) => {}` | 过滤噪音，保留关键告警 |
:::

:::details 常见组合示例
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['react'],
  treeshake: {
    moduleSideEffects: false,
  },
  watch: {
    include: 'src/**',
    clearScreen: false,
  },
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') return
    warn(warning)
  },
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
  },
})
```
:::

### Plugin

当默认能力不够时，插件就是 Rollup 的“扩展接口”。

#### 插件语法模板

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

安装这些能力常用依赖：

```bash
pnpm add -D @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-babel @babel/core @babel/preset-env @rollup/plugin-terser rollup-plugin-postcss postcss
```

#### 处理 node_modules 依赖（@rollup/plugin-node-resolve）

Rollup 默认对第三方包解析能力有限，尤其是包入口字段较复杂时。先用 `node-resolve` 把依赖路径解析出来，后续插件才能继续处理。

```js
import { defineConfig } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'

export default defineConfig({
  input: 'src/index.js',
  plugins: [
    nodeResolve({
      browser: true,
      extensions: ['.mjs', '.js', '.json'],
    }),
  ],
  output: {
    file: 'dist/index.es.js',
    format: 'es',
  },
})
```

#### 处理 CommonJS 依赖（@rollup/plugin-commonjs）

很多历史包仍是 `require/module.exports` 写法，Rollup 需要先把它们转换成 ESM 才能参与后续打包。

```js
import { defineConfig } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  input: 'src/index.js',
  plugins: [
    commonjs(), // 把 CJS 转成 ESM
  ],
  output: {
    file: 'dist/index.es.js',
    format: 'es',
  },
})
```

#### JavaScript 转换（@rollup/plugin-babel）

如果需要兼容较低运行环境，就要把新语法转成目标环境可执行的语法版本。

```js
import { defineConfig } from 'rollup'
import { babel } from '@rollup/plugin-babel'

export default defineConfig({
  input: 'src/index.js',
  plugins: [
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
      extensions: ['.js', '.mjs'],
    }),
  ],
  output: {
    file: 'dist/index.es.js',
    format: 'es',
    sourcemap: true,
  },
})
```

#### JavaScript 压缩（@rollup/plugin-terser）

生产构建一般会增加压缩，减少包体积并提升传输效率。

```js
import { defineConfig } from 'rollup'
import terser from '@rollup/plugin-terser'

export default defineConfig({
  input: 'src/index.js',
  plugins: [terser()],
  output: {
    file: 'dist/index.es.min.js',
    format: 'es',
    sourcemap: true,
  },
})
```

#### CSS 处理（rollup-plugin-postcss）

Rollup 本身不负责完整样式链路，通常通过 `postcss` 插件做样式提取、压缩和后处理。

```js
import { defineConfig } from 'rollup'
import postcss from 'rollup-plugin-postcss'

export default defineConfig({
  input: 'src/index.js', // 入口里 import './styles.css'
  plugins: [
    postcss({
      extract: 'styles.css', // 抽离独立 CSS 文件
      minimize: true, // 压缩 CSS
    }),
  ],
  output: {
    file: 'dist/index.es.js',
    format: 'es',
  },
})
```

> [!NOTE]
> 常见插件顺序是：`nodeResolve -> commonjs -> babel -> 其他处理 -> terser`。

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
    file: 'dist/index.es.js',
    format: 'es',
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
    file: 'dist/index.es.js',
    format: 'es',
  },
})
```
:::

## JS API 使用方式

当你要在脚手架、平台化构建工具中“程序化调用 Rollup”时，JS API 比配置文件更灵活。

:::code-tabs
@tab 单次构建
```js
import { rollup } from 'rollup'

const bundle = await rollup({
  input: 'src/index.ts',
  external: ['react'],
})

await bundle.write({
  file: 'dist/index.es.js',
  format: 'es',
  sourcemap: true,
})

await bundle.close()
```

@tab JS API 多格式输出
```js
import { rollup } from 'rollup'

const bundle = await rollup({
  input: 'src/index.ts',
  external: ['react'],
})

await Promise.all([
  bundle.write({ file: 'dist/index.es.js', format: 'es', sourcemap: true }),
  bundle.write({ file: 'dist/index.cjs', format: 'cjs', sourcemap: true, exports: 'named' }),
])

await bundle.close()
```

@tab 监听构建（watch）
```js
import { watch } from 'rollup'

const watcher = watch({
  input: 'src/index.ts',
  output: { file: 'dist/index.es.js', format: 'es' },
})

watcher.on('event', (event) => {
  if (event.code === 'BUNDLE_END') {
    console.log('build done')
  }
  if (event.code === 'ERROR') {
    console.error(event.error)
  }
})
```
:::

> [!NOTE]
> JS API 场景下记得在构建结束后调用 `bundle.close()`，避免资源句柄泄露。

## 库模式构建实践

下面给一套可直接落地的库构建流程，目标是输出 `es + cjs + d.ts`。

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
           file: 'dist/index.es.js',
           format: 'es',
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
         format: 'es',
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
         file: 'dist/index.es.min.js',
         format: 'es',
         sourcemap: true,
       },
     },
   ])
   ```

4. 配置 `package.json` 导出字段

   ```json
   {
     "main": "dist/index.cjs",
     "module": "dist/index.es.js",
     "types": "dist/index.d.ts",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.es.js",
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
