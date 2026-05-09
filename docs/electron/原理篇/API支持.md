---
title: API 支持
createTime: 2026/05/09 07:54:17
permalink: /electron/3xl557ck/
---

## 公开 API

在 Electron 中，有些自己的 API：

- 访问剪贴板
- 创建系统菜单
- 创建托盘图标
- ...

这些 API 是如何公开的 ？

在 Electron 源码的 `lib` 目录下面，存储了一系列的 TS 文件，这些 TS 文件就为开发者提供了 Electron 自身的 API，比如有：

- `app`
- `ipcMain`
- `ipcRenderer`
- ...

这些 TS 所提供的 API 最终是会被==注入到 Node.js==里面的。

:::tip 理解注入机制
Electron 的 API 并不是 Node.js 原生提供的，而是通过编译和注入的方式，让这些 API 在 Node.js 环境中可用。
:::

## 编译流程

首先这些 TS 文件是需要被编译为 JS 文件才能够被 Node.js 所执行。

:::: steps

1. TypeScript 编译

   在 Electron 里面，使用的是 [Rollup](https://rollupjs.org/) 来对这些 TS 文件进行编译。

   编译 TS 文件的工作是被定义在 Electron 的编译脚本 `BUILD.gn` 的文件里面。

2. 生成 JS 文件

   经过这个编译脚本对 TS 文件进行编译之后，就会生成一系列的 JS 文件：

   - `browser_init.js`
   - `renderer_init.js`
   - `isolated_bundle.js`
   - `sandbox_bundle.js`
   - `worker_init.js`
   - `node_init.js`

3. 转换为 C 数组

   接着，编译指令会通过一个名为 `js2c.py` 的 python 文件将这些 JS 转换为 ASCII 码形式的 C 数组，最终会生成一个名为 `electron_native.cc` 的文件。

4. 执行 JS 逻辑

   在 `electron_native.cc` 文件里面，有一个名为 `LoadEmbedderJavaScriptSource` 的方法，该方法的作用是用于读取 ASCII 码数组的内容，并执行这些内容。

   这里执行这些内容其实就是在执行相应的 JS 逻辑，也就是执行了一开始的 TS 逻辑。
::::

## 注入到 Node.js

Electron 编译工具在编译 Node.js 源码之前，会以==补丁==的形式将 `electron_native.cc` 这个文件注入到 Node.js 源码里面。

在 Electron 中有另外一个补丁，该补丁位于源码的 `patches/node/build_modify_js2c_py_to_allow_injection_of_original-fs_and_custom_embedder_js.patch` 这个位置，该源码包含这样一段代码：

```js
 LoadJavaScriptSource();
+  LoadEmbedderJavaScriptSource();
```

在上面的代码中，`LoadEmbedderJavaScriptSource` 方法前面有一个加号，代表该方法会以补丁的形式添加进去，会为 `NativeModuleLoader` 类型的构造函数增加这么一个函数调用。

:::warning 关键时机
`NativeModuleLoader` 会在主进程初始化 Node.js 环境的时候被实例化，因此也就代表着在主进程初始化 Node.js 环境的时候，TS 逻辑就已经被执行了，自身的那些 API 已经就存在了。
:::

## 不同进程的不同 API

在 Electron 中，主进程和渲染进程能够使用的 API 是不同的。

:::table full-width

| 进程类型 | 可用模块 | 说明 |
| --- | --- | --- |
| 主进程 | `app`、`ipcMain` 等 | 负责窗口管理、系统 API |
| 渲染进程 | `ipcRenderer`、`webFrame` 等 | 负责页面渲染和用户交互 |
| 通用模块 | `clipboard`、`desktopCapturer` 等 | 主进程和渲染进程都可以使用 |

:::

前面我们提到 Electron 里面通过 Rollup 来对 TS 进行编译，编译之后会生成一系列的 JS 文件，其中就有：

- `browser_init.js`
- `renderer_init.js`

而这两个文件就是为不同的进程提供服务的，生成这两个文件所使用的输入信息也是不同的。

:::: steps

1. 生成 `browser_init.js`

   所提供的输入信息是 `auto_filenames.browser_bundle_deps` 编译变量。

   这个变量对应的数组包含了主进程特有的 TS 文件，例如：
   - `lib/browser/api/app.ts`
   - `lib/browser/ipc-main-impl.ts`

2. 生成 `renderer_init.js`

   所提供的输入信息是 `auto_filenames.renderer_bundle_deps` 编译变量。

   这个变量对应的数组不包含上面的主进程特有文件，而是包含渲染进程特有的文件，例如：
   - `lib/renderer/api/clipboard.ts`
   - `lib/renderer/api/desktop-capturer.ts`
::::

:::details 查看 auto_filenames.renderer_bundle_deps 编译变量

`auto_filenames.renderer_bundle_deps` 编译变量所对应的数组，里面包含了一系列的 TS 文件，但是在这个数组里面，并不包含：

- `lib/browser/api/app.ts`
- `lib/browser/ipc-main-impl.ts`

这两个 TS 文件。

但是如果是为主进程服务的 `auto_filenames.browser_bundle_deps` 编译变量所对应的数组，就会包含上面所罗列的这两个 TS 文件。

另外，这两个编译变量所对应的数组，都会包含：

- `lib/common/api/clipboard.ts`
- `lib/renderer/api/desktop-capturer.ts`

:::

> [!NOTE]
> 这种分离设计确保了不同进程只能访问到自己应该拥有的 API，从而保证了 Electron 应用的安全性和稳定性。

[+auto_filenames]:
  `auto_filenames` 是 Electron 构建系统中用于自动生成文件列表的 GN 配置变量。
  它定义在 `filenames.auto.gni` 文件中，包含了所有进程的 bundle 依赖配置。
