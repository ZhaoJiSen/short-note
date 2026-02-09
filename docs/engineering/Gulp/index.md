---
title: Gulp
createTime: 2026/02/09 17:10:00
permalink: /engineering/gulp-guide/
---

> [!IMPORTANT]
> Gulp 是基于流（stream）的任务运行器（task runner），适合把一组文件处理步骤串成自动化流水线。

:::collapse expand
- 适用场景

  1. 对静态资源做快速自动化处理（编译、压缩、拷贝、注入）
  2. 项目需要轻量任务编排，而不是完整打包生态
  3. 历史项目维护或需要高度自定义文件处理链
:::

## 核心定位

:::table title="Gulp 与 Webpack" full-width
| 维度 | Gulp | Webpack |
| --- | --- | --- |
| 核心角色 | Task Runner | Module Bundler |
| 关注点 | 任务编排与文件流处理 | 模块依赖分析与打包 |
| 典型能力 | 拷贝、压缩、编译、注入、监听 | loader/plugin、代码分割、构建优化 |
| 使用感受 | 上手快、规则少 | 功能全、学习成本更高 |
:::

## 快速开始

安装：

```bash
pnpm add -D gulp
```

最小任务（`gulpfile.js`）：

```js
function foo(cb) {
  console.log('Gulp 任务')
  cb() // 显式通知任务结束
}

exports.foo = foo
```

执行：

```bash
npx gulp foo
```

## 任务模型

Gulp 4 中任务本质是异步函数，常见导出方式：

- `public`：通过 `exports.xxx` 导出，可被 CLI 直接执行
- `private`：仅在内部被 `series/parallel` 组合使用
- `default`：默认任务，执行 `npx gulp` 时触发

```js
function clean(cb) {
  // private task
  cb()
}

function build(cb) {
  // public task
  cb()
}

exports.build = build
exports.default = build
```

### 任务结束方式

:::table title="任务结束信号" full-width
| 方式 | 说明 |
| --- | --- |
| `callback` | 显式调用回调标记结束 |
| `return Stream` | 返回流，流结束即任务结束 |
| `return Promise` | Promise resolve/reject 决定任务完成/失败 |
| `return Child Process` | 子进程退出后结束 |
| `return Observable` | 适配 Rx 流式任务 |
:::

## 任务组合

Gulp 提供两种组合方式：

- `series`：串行执行（有前后依赖时使用）
- `parallel`：并行执行（任务互不依赖时使用）

```js
const { series, parallel } = require('gulp')

function foo1(cb) {
  setTimeout(() => {
    console.log('foo1')
    cb()
  }, 1000)
}

function foo2(cb) {
  setTimeout(() => {
    console.log('foo2')
    cb()
  }, 2000)
}

exports.seriesTask = series(foo1, foo2)
exports.parallelTask = parallel(foo1, foo2)
```

## 文件流操作

`src` 读取文件流，`dest` 输出文件流，`pipe` 负责串联处理过程。

```js
const { src, dest } = require('gulp')

function copyFile() {
  return src('./src/**/*.js')
    .pipe(dest('./dist'))
}

exports.copyFile = copyFile
```

## 监听文件变化

`watch` 用于监听文件变动并自动触发任务：

```js
const { watch } = require('gulp')

watch('./src/**/*.js', jsTask)
watch('./src/**/*.css', cssTask)
```

## 开发与构建流水线

下面是一套常见流水线：JS 编译压缩、CSS 编译、HTML 压缩、资源注入、本地服务与监听。

### 安装常见插件

```bash
pnpm add -D gulp-babel @babel/preset-env gulp-terser gulp-less gulp-htmlmin gulp-inject browser-sync
```

### 完整示例

```js
const { src, dest, watch, series, parallel } = require('gulp')
const babel = require('gulp-babel')
const terser = require('gulp-terser')
const less = require('gulp-less')
const htmlmin = require('gulp-htmlmin')
const inject = require('gulp-inject')
const browserSync = require('browser-sync')

const bs = browserSync.create()

function jsTask() {
  return src('./src/**/*.js')
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(terser({ mangle: { toplevel: true } }))
    .pipe(dest('./dist/js'))
}

function cssTask() {
  return src('./src/**/*.less')
    .pipe(less())
    .pipe(dest('./dist/css'))
}

function htmlTask() {
  return src('./index.html')
    .pipe(htmlmin({ removeComments: true, collapseWhitespace: true }))
    .pipe(dest('./dist'))
}

function injectTask() {
  return src('./dist/index.html')
    .pipe(inject(src(['./dist/**/*.js', './dist/**/*.css']), { relative: true }))
    .pipe(dest('./dist'))
}

function serve() {
  watch('./src/**', buildTask)
  bs.init({
    port: 9527,
    open: true,
    files: './dist/*',
    server: { baseDir: './dist' },
  })
}

const buildTask = series(parallel(htmlTask, jsTask, cssTask), injectTask)
const serveTask = series(buildTask, serve)

exports.buildTask = buildTask
exports.serveTask = serveTask
```

## 常见问题

### 注入路径错误

使用 `gulp-inject` 时，如果发现注入后的 `src/href` 资源路径不正确，通常是缺少相对路径选项：

```js
.pipe(inject(src(['./dist/**/*.js', './dist/**/*.css']), { relative: true }))
```

这个选项可以避免在注入结果中出现错误的绝对路径前缀，减少本地预览时资源 404 的问题。
