---
title: Gulp
createTime: 2026/02/09 17:10:00
permalink: /engineering/gulp-guide/
---

> [!IMPORTANT]
> Gulp 是基于流（stream）的任务运行器（task runner），适合把一组文件处理步骤串成自动化流水线

:::table title="Gulp 与 Webpack" full-width

| 维度 | Gulp | Webpack |
| --- | --- | --- |
| 核心角色 | Task Runner | Module Bundler |
| 关注点 | 任务编排与文件流处理 | 模块依赖分析与打包 |
| 典型能力 | 拷贝、压缩、编译、注入、监听 | loader/plugin、代码分割、构建优化 |
| 使用感受 | 上手快、规则少 | 功能全、学习成本更高 |
:::

:::collapse

- 适用场景

  1. 对静态资源做快速自动化处理（编译、压缩、拷贝、注入）
  2. 项目需要轻量任务编排，而不是完整打包生态

:::

安装：

```bash
pnpm add -D gulp
```

## 核心概念

Gulp 的核心理念: "一切皆任务，任务即函数"

### 任务模型

任务模型是 Gulp 组织任务的基础，其本质都是函数，但在 "是否对外暴露" 和 "如何触发" 上有三种常见模型：

:::table  full-width

| 模型 | 定义方式 | 触发方式 | 典型场景 |
| --- | --- | --- | --- |
| 公开任务 | `exports.xxx = task` | `npx gulp xxx` | 供 CLI 直接执行 |
| 私有任务 | 仅定义函数，不导出 | `series/parallel` 组合触发 | 仅作为内部步骤 |
| 默认任务 | `exports.default = task` | `npx gulp` | 约定入口任务 |

:::

:::code-tabs
@tab 公开任务

```js
function build(cb) {
  console.log('build task')
  cb()
}

// 暴露给 CLI：npx gulp build
exports.build = build
```

@tab 私有任务

```js
const { series } = require('gulp')

function clean(cb) {
  console.log('clean task')
  cb()
}

function build(cb) {
  console.log('build task')
  cb()
}

// clean 不导出，作为内部任务被组合执行
exports.buildTask = series(clean, build)
```

@tab 默认任务

```js
function serve(cb) {
  console.log('dev server start')
  cb()
}

// 执行 npx gulp 时触发
exports.default = serve
```

:::

### 任务组合

当一个任务无法覆盖完整流程时，就需要把多个子任务组合起来执行。在 Gulp 最常见的两种组合方式是 `series` 与 `parallel`

:::table full-width

| 组合方式 | 执行方式 | 适用场景 | 典型风险 |
| --- | --- | --- | --- |
| `series` | 严格串行| 有依赖顺序的流程（先清理再构建） | 总时长可能更长 |
| `parallel` | 并行执行 | 互不依赖的任务（JS/CSS 同时处理） | 任务间有隐式依赖时会出错 |
:::

:::code-tabs
@tab series

```js
const { series } = require('gulp')

function clean(cb) {
  setTimeout(() => {
    console.log('clean done')
    cb()
  }, 1000)
}

function build(cb) {
  setTimeout(() => {
    console.log('build done')
    cb()
  }, 1000)
}

// 串行：先 clean，再 build
exports.buildTask = series(clean, build)
```

@tab parallel

```js
const { parallel } = require('gulp')

function jsTask(cb) {
  setTimeout(() => {
    console.log('js task done')
    cb()
  }, 1000)
}

function cssTask(cb) {
  setTimeout(() => {
    console.log('css task done')
    cb()
  }, 1000)
}

// 并行：jsTask 与 cssTask 同时执行
exports.assetsTask = parallel(jsTask, cssTask)
```

:::

### 任务完成机制

Gulp 中任务几乎都是异步的，所以 "任务什么时候算结束" 必须明确告知

> [!IMPORTANT]
> 一个任务只应使用一种结束方式，不要在同一个任务里混用 `cb` + `return Promise` 等多种信号

:::table full-width

| 方式 | 结束判定 | 适用场景 |
| --- | --- | --- |
| `callback` | 显式调用 `cb()` / `cb(error)` | 简单异步流程 |
| `return Stream` | 流 `end/finish` 时结束 | 文件处理流水线 |
| `return Promise` | `resolve/reject` 决定成功失败 | 需要封装异步结果 |
| `return Child Process` | 子进程退出时结束 | 调用外部命令 |
| `return Observable` | `complete/error` 触发结束 | Rx 流式场景 |
:::

:::code-tabs
@tab callback

```js
function clean(cb) {
  setTimeout(() => {
    console.log('clean done')
    cb() // 成功结束
    // cb(new Error('clean failed')) // 失败结束
  }, 500)
}

exports.clean = clean
```

@tab return Stream

```js
const { src, dest } = require('gulp')

function copyTask() {
  // 返回流，流结束即任务结束
  return src('./src/**/*.js')
    .pipe(dest('./dist'))
}

exports.copyTask = copyTask
```

@tab return Promise

```js
function asyncTask() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ok = true
      if (ok) resolve()
      else reject(new Error('task failed'))
    }, 500)
  })
}

exports.asyncTask = asyncTask
```

@tab return Child Process

```js
const { exec } = require('node:child_process')

function lintTask() {
  // 返回子进程对象，退出时任务结束
  return exec('pnpm eslint ./src')
}

exports.lintTask = lintTask
```

@tab return Observable

```js
const { of } = require('rxjs')
const { delay } = require('rxjs/operators')

function observableTask() {
  // Observable complete 时任务结束
  return of('done').pipe(delay(300))
}

exports.observableTask = observableTask
```

:::

:::details 注意事项（按结束信号分类）

- `callback（回调结束信号）`：必须确保一定会调用，且只调用一次
- `Stream（流结束信号）`：推荐用于 `src().pipe().pipe(dest())`，不要遗漏 `return`
- `Promise（承诺结束信号）`：`reject` 会让任务失败退出，避免吞掉异常
- `Child Process（子进程结束信号）`：注意命令失败时的退出码，必要时在 CI 中做失败中断
- `Observable（可观察流结束信号）`：需要额外依赖（如 `rxjs`），并确保流会 `complete`
:::

## 文件流水线操作

Gulp 基于 Node.js 的 Stream 的方式处理文件，形成 "文件流水线"。它允许开发者将文件从源头读取，经过一系列转换操作（例如压缩、合并、转义）最终输出

:::details `Vinyl`
`Vinyl` 是 Gulp 生态中的 "虚拟文件对象"；通过 `src()` 读取到的每个文件都会被包装成一个 `Vinyl` 对象，再在 `pipe()` 中被插件逐步处理；`dest()` 最终把处理后的 `Vinyl` 对象写回到目标目录

常见字段：`path`（文件路径）、`base/cwd`（基准目录）、`contents`（可能是 `Buffer` 或 `Stream`）、`stat`（文件元信息）
:::

:::table full-width

| 核心方法 | 作用 | 输入 | 输出 |
| --- | --- | --- | --- |
| `src(glob)` | 从匹配路径读取文件并创建可读流 | 文件匹配规则（如 `./src/**/*.js`） | Vinyl 文件流 |
| `pipe(transform)` | 将上一步流传入转换插件，串联处理链路 | 上游 Stream + 转换函数/插件 | 新的可继续传递的 Stream |
| `dest(path)` | 将处理后的文件写入目标目录 | 上游处理完成的文件流 | 落盘到目标目录 |
:::

```js
const { src, dest } = require('gulp')

function copyFile() {
  return src('./src/**/*.js')
    .pipe(dest('./dist'))
}

exports.copyFile = copyFile
```

### 监听文件变化

如果希望 "改完代码就自动重跑任务" 时，就需要 `watch`。它的核心价值是缩短反馈周期，让开发流程从 "手动执行构建" 变成 "文件变化自动触发任务"

`watch` 的常见签名是 `watch(glob, [options], task)`：

:::table full-width

| 参数 | 说明 | 常用写法 |
| --- | --- | --- |
| `glob` | 监听的文件匹配规则 | `./src/**/*.js`、`./src/**/*.{ts,tsx}` |
| `options` | 监听行为配置（可选） | `{ ignoreInitial: false, delay: 200 }` |
| `task` | 文件变化后执行的任务函数 | `jsTask`、`series(clean, build)` |
:::

> [!IMPORTANT]
> 任务必须正确结束（`cb` / `return stream` / `return Promise`），否则会出现任务卡住或重复触发异常

:::code-tabs
@tab 基础监听

```js
const { watch } = require('gulp')

function jsTask(cb) {
  console.log('build js...')
  cb()
}

function cssTask(cb) {
  console.log('build css...')
  cb()
}

// 监听 JS 与 CSS 变化
watch('./src/**/*.js', jsTask)
watch('./src/**/*.css', cssTask)
```

@tab 带 options 的监听

```js
const { watch, series } = require('gulp')

function clean(cb) {
  console.log('clean dist')
  cb()
}

function build(cb) {
  console.log('rebuild project')
  cb()
}

const rebuild = series(clean, build)

// ignoreInitial: false 表示启动监听时先执行一次任务
// delay: 防抖延迟，减少连续保存导致的频繁触发
watch('./src/**/*', { ignoreInitial: false, delay: 200 }, rebuild)
```

@tab 监听事件回调

```js
const { watch } = require('gulp')

function jsTask(cb) {
  console.log('build js...')
  cb()
}

const watcher = watch('./src/**/*.js', jsTask)

watcher.on('add', (filePath) => {
  console.log('[add]', filePath)
})

watcher.on('change', (filePath) => {
  console.log('[change]', filePath)
})

watcher.on('unlink', (filePath) => {
  console.log('[unlink]', filePath)
})
```

:::

## 开发与构建流水线

:::::steps

1. 安装依赖

   ```bash
   pnpm add -D gulp-babel gulp-terser @babel/preset-env 
   pnpm add -D gulp-less gulp-htmlmin 
   pnpm add -D gulp-inject browser-sync
   ```

   :::details 插件作用说明：
   - `gulp-babel`：在 Gulp 流水线中接入 Babel 转译
   - `gulp-terser`：压缩与混淆 JavaScript
   - `gulp-less`：将 Less 编译为 CSS
   - `gulp-htmlmin`：压缩 HTML（去注释、折叠空白）
   - `gulp-inject`：将构建后的 JS/CSS 自动注入 HTML
   - `browser-sync`：启动本地开发服务器并支持自动刷新
   :::

2. JavaScript 的转换与压缩

   这一步把源代码里的 JS 先做语法转换，再做压缩混淆，最后输出到 `dist/js`

   ```js
   const { src, dest } = require('gulp')
   const babel = require('gulp-babel')
   const terser = require('gulp-terser')

   function jsTask() {
     return src('./src/**/*.js')
       .pipe(babel({ presets: ['@babel/preset-env'] }))
       .pipe(terser({ mangle: { toplevel: true } }))
       .pipe(dest('./dist/js'))
   }
   ```

3. HTML 的打包与压缩

   这一步对 HTML 做压缩处理，减少注释和空白，输出到 `dist`

   ```js
   const { src, dest } = require('gulp')
   const htmlmin = require('gulp-htmlmin')

   function htmlTask() {
     return src('./index.html')
        // 去注释、折叠空白
       .pipe(htmlmin({ removeComments: true, collapseWhitespace: true }))
       .pipe(dest('./dist'))
   }
   ```

4. CSS 的打包

   这里以 Less 为例，把样式编译成 CSS 并输出到 `dist/css`

   ```js
   const { src, dest } = require('gulp')
   const less = require('gulp-less')

   function cssTask() {
     return src('./src/**/*.less')
       .pipe(less())
       .pipe(dest('./dist/css'))
   }
   ```

5. 注入打包后的文件

   这一步把构建后的 `js/css` 自动注入到 HTML，避免手动维护脚本和样式引用

   ```js
   const { src, dest } = require('gulp')
   const inject = require('gulp-inject')

   function injectTask() {
     return src('./dist/index.html')
       .pipe(
         inject(src(['./dist/**/*.js', './dist/**/*.css']), {
           relative: true, // 避免注入错误绝对路径
         }),
       )
       .pipe(dest('./dist'))
   }
   ```

6. 开启本地服务监听

   这一步用于本地开发：监听源码变更后自动重建，并通过 BrowserSync 刷新页面

   ```js
   const { watch } = require('gulp')
   const browserSync = require('browser-sync')

   const bs = browserSync.create()

   function serve(buildTask) {
     watch('./src/**', buildTask)
     bs.init({
       port: 9527,
       open: true,
       files: './dist/*',
       server: { baseDir: './dist' },
     })
   }
   ```

7. 构建任务

   最后用 `series + parallel` 把前面任务编排成可执行的构建流水线和开发流水线

   ```js
   const { series, parallel } = require('gulp')

   // 假设下面这些任务已在同文件定义
   // htmlTask, jsTask, cssTask, injectTask, serve

   const buildTask = series(parallel(htmlTask, jsTask, cssTask), injectTask)
   const serveTask = series(buildTask, () => serve(buildTask))

   exports.buildTask = buildTask
   exports.serveTask = serveTask
   ```

   对应执行命令：

   ```bash
   npx gulp buildTask
   npx gulp serveTask
   ```

:::::
