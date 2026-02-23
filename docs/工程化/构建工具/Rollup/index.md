---
title: Rollup
createTime: 2026/02/10 10:30:10
permalink: /engineering/build-rollup/
---

Rollup 是一个以 `ESM` 为核心的构建工具，适用于 npm 包、组件库等能够输出多种产物的情况。Rollup 有三种使用方式

:::table full-width
| 方式 | 适合场景 | 优点 |
| --- | --- | --- |
| CLI | 快速试验 | 直接执行、零样板 |
| rollup.config.* | 日常工程构建 | 配置可版本化、可复用 |
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

## JS API

JS API 适用于在脚手架、平台化构建工具中 "程序化调用 Rollup"

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
  bundle.write({
    file: 'dist/index.es.js', 
    format: 'es',
    sourcemap: true
  }),
  bundle.write({
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  }),
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
> JS API 场景下记得在构建结束后调用 `bundle.close()`，避免资源句柄泄露

## 基本配置

### input

用于声明构建入口，既可以是单文件入口，也可以是多入口对象

:::code-tabs
@tab single.js
```js
export default {
  input: 'src/index.ts',
}
```

@tab multiple.js
```js
export default {
  input: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
  }
}
```
:::

### external

用于声明 ==哪些依赖不应被打包进最终产物==，而是由使用者自行提供

> [!IMPORTANT]
> 对于库项目而言，这一步非常关键：如果将 react、vue、lodash 这类运行时依赖也打进 bundle，会导致产物体积显著膨胀，同时极易引发版本冲突

:::table full-width
| 写法 | 示例 | 适用场景 |
| --- | --- | --- |
| 字符串数组 | `external: ['react', 'lodash']` | 依赖列表稳定、数量不多 |
| 正则表达式 | `external: [/^lodash/]` | 需要匹配子路径（如 `lodash/chunk`） |
| 函数 | `external: (id) => id.startsWith('lodash')` | 复杂规则、按条件动态判断 |
:::

:::code-tabs
@tab 基础写法（lodash）.js
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['lodash', 'react'],  // [!code focus]
  output: [
    { file: 'dist/index.es.js', format: 'es' },
    { file: 'dist/index.cjs', format: 'cjs', exports: 'named' },
  ],
})
```

@tab 子路径匹配（lodash/*）.js
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: [/^lodash(\/|$)/], // 匹配 lodash 和 lodash/chunk 等子路径  // [!code focus]
  output: {
    file: 'dist/index.es.js',
    format: 'es',
  },
})
```

@tab 配合 globals（UMD）.js
```js
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/index.ts',
  external: ['lodash'], // [!code focus]
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'MyLib',
    globals: {
      lodash: '_', // 浏览器侧从 window._ 读取 lodash // [!code focus]
    },
  },
})
```
:::

> [!NOTE]
> 库构建时，`peerDependencies` 通常应与 `external` 保持一致

### output

用于配置构建产物的产物格式、名称等，通常以数组的形式构建多个产物出口

:::code-tabs
@tab multiple-output.js
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
:::

#### 1.产物格式

通过指定 `format` 字段来构建不同的产物

:::table full-width
| 格式 | 适用场景 | 注意事项 |
| --- | --- | --- |
| `es` | 现代构建工具、浏览器 ESM | 库分发首选格式 |
| `cjs` | Node.js CommonJS 生态 | 常用于兼容老工具链 |
| `iife` | 浏览器 `<script>` 直接引入 | **需搭配 `output.name`** |
| `umd` | 通用脚本分发 | **需配置 `name/globals`** |
| `amd` | 旧模块加载体系 | 新项目较少使用 |
| `system` | SystemJS 生态 | 按需使用 |
:::

> [!NOTE]
> `commonjs/esm/module/systemjs` 是别名写法，Rollup 内部会映射到 `cjs/es/es/system`

#### 2.输出命名规则

在多入口或代码分割场景下，==输出文件的命名规则会直接影响浏览器的长效缓存策略与排错定位效率==。通常通过以下 三个核心配置项 来精准控制不同类型资源的输出名称

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

#### 3.sourcemap

用于映射产物与源码，便于调试和错误定位

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

TODO: 补充 file dir 配置项

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

### Plugin

#### 1.基本使用

> [!NOTE]
> 常见插件顺序是：`nodeResolve -> commonjs -> babel -> 其他处理 -> terser`

::::steps

1. 处理三方依赖

    Rollup 默认对第三方包解析能力有限，尤其是包入口字段较复杂时。需要先使用 `node-resolve` 把依赖路径解析出来，后续插件才能继续处理

    :::code-tabs
      @tab 依赖安装
      ```bash
      pnpm add @rollup/plugin-node-resolve
      ```

      @tab 使用
      ```js
      import { defineConfig } from 'rollup'
      import nodeResolve from '@rollup/plugin-node-resolve'

      export default defineConfig({
        input: 'src/index.js',
        plugins: [  //[!code focus]
          nodeResolve({ //[!code focus]
            browser: true,  //[!code focus]
            extensions: ['.mjs', '.js', '.json'], //[!code focus]
          }), //[!code focus]
        ],
        output: {
          file: 'dist/index.es.js',
          format: 'es',
        },
      })
      ```
      :::

    // TODO 为什么 rollup 不处理三方依赖

2. 处理 CJS 依赖

    很多历史包仍是 CommonJS 的写法，Rollup 需要先把它们转换成 ESM 才能参与后续打包

    :::code-tabs
    @tab 安装依赖
    ```bash
    pnpm add @rollup/plugin-commonjs -D
    ```

    @tab 使用
    ```js
    import { defineConfig } from 'rollup'
    import commonjs from '@rollup/plugin-commonjs'

    export default defineConfig({
      input: 'src/index.js',
      plugins: [  //[!code focus]
        commonjs(), // 把 CJS 转成 ESM  //[!code focus]
      ],  //[!code focus]
      output: {
        file: 'dist/index.es.js',
        format: 'es',
      },
    })
    ```
    :::

3. JavaScript 转换

    如果需要兼容较低运行环境，就要把新语法转成目标环境可执行的语法版本

    :::code-tabs
    @tab 安装
    ```bash
    pnpm add @rollup/plugin-babel -D
    ```

    @tab 使用
    ```js
    import { defineConfig } from 'rollup'
    import { babel } from '@rollup/plugin-babel'

    export default defineConfig({
      input: 'src/index.js',
      plugins: [  //[!code focus]
        babel({ //[!code focus]
          babelHelpers: 'bundled',  //[!code focus]
          presets: ['@babel/preset-env'], //[!code focus]
          extensions: ['.js', '.mjs'],  //[!code focus]
        }), //[!code focus]
      ],
      output: {
        file: 'dist/index.es.js',
        format: 'es',
        sourcemap: true,
      },
    })
    ```
    :::

4. JavaScript 压缩

    生产构建一般会增加压缩，减少包体积并提升传输效率

    :::code-tabs
    @tab 安装 
    ```bash
    pnpm add @rollup/plugin-terser -D
    ```

    @tab 使用
    ```js
    import { defineConfig } from 'rollup'
    import terser from '@rollup/plugin-terser'

    export default defineConfig({
      input: 'src/index.js',
      plugins: [terser()], //[!code focus]
      output: {
        file: 'dist/index.es.min.js',
        format: 'es',
        sourcemap: true,
      },
    })
    ```
    :::

5. TypeScript 转换

    :::code-tabs
    @tab 安装
    ```bash
    pnpm add @rollup/plugin-typescript -D
    ```

    @tab 使用
    ```js
    import { defineConfig } from 'rollup'

    export default defineConfig({
      plugins: [  //[!code focus]
        typescript({ tsconfig: './tsconfig.json' }),  //[!code focus]
      ] //[!code focus]
    })
    ```
    :::

6. CSS 处理

    Rollup 本身不负责完整样式链路，通常通过 `postcss` 插件做样式提取、压缩和后处理

    :::code-tabs
    @tab 安装
    ```bash
    pnpm add rollup-plugin-postcss -D
    ```

    @tab 使用
    ```js
    import { defineConfig } from 'rollup'
    import postcss from 'rollup-plugin-postcss'

    export default defineConfig({
      input: 'src/index.js', // 入口里 import './styles.css'
      plugins: [  //[!code focus]
        postcss({
          extract: 'styles.css', // 抽离独立 CSS 文件 //[!code focus]
          minimize: true, // 压缩 CSS //[!code focus]
        }), //[!code focus]
      ],  //[!code focus]
      output: {
        file: 'dist/index.es.js',
        format: 'es',
      },
    })
    ```
    :::

::::

#### 2.自定义插件

一个 Rollup 插件本质是一个对象，至少包含 `name`，并按需实现各类 hook

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

