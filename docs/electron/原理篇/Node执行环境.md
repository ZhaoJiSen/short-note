---
title: Node 执行环境
createTime: 2026/05/08 07:27:15
permalink: /electron/aisvw1te/
---

## 主进程 Node 环境

[+wWinMain]: 该函数位于 `shell/app/electron_main_win.cc`，是 Windows 操作系统下的入口函数
[+ElectronMainDelegate]: 位于 `shell/app/electron_main_delegate.cc`。它是 Electron 提供给 Chromium `content::ContentMain` 的启动委托类，用来介入和定制 Chromium 的启动流程
[+ElectronBrowserMainParts]: 位于 `shell/browser/electron_browser_main_parts.cc`。它继承于 Chromium 的 `BrowserMainParts` 类，包含了 Chromium 启动过程中的一系列事件

当用户启动 Electron 应用时，会执行整个应用的入口函数 `wWinMain`[+wWinMain]。该函数会对命令行指令进行处理、初始化环境变量。

```c++
int APIENTRY wWinMain(HINSTANCE instance, HINSTANCE, wchar_t* cmd, int) {
  // 1. 解析 Windows 命令行参数
  int argc = 0;
  wchar_t** argv = ::CommandLineToArgvW(::GetCommandLineW(), &argc);

  base::CommandLine::Init(0, nullptr);
  electron::ElectronCommandLine::Init(argc, argv);
  LocalFree(argv);

  // 2. 判断是否以 Node.js 模式运行
  bool run_as_node =
      electron::fuses::IsRunAsNodeEnabled() &&
      IsEnvSet(electron::kRunAsNode);

  // 3. 将标准输出绑定到控制台，保证日志可以正常打印
  if (run_as_node || !IsEnvSet("ELECTRON_NO_ATTACH_CONSOLE"))
    base::RouteStdioToConsole(false);

  // 4. 如果是 ELECTRON_RUN_AS_NODE，则直接启动 Node.js
  if (run_as_node) {
    base::AtExitManager atexit_manager;
    base::i18n::InitializeICU();
    return electron::NodeMain();
  }

  // 5. 普通 Electron 应用启动流程
  electron::ElectronMainDelegate delegate;
  content::ContentMainParams params(&delegate);
  params.instance = instance;
  params.sandbox_info = &sandbox_info;

  return content::ContentMain(std::move(params));
}
```

:::details 启动流程

1. 解析 Windows 命令行参数，并初始化 Electron 自己的命令行系统
2. 判断是否设置了 `ELECTRON_RUN_AS_NODE`
3. 如果是 Node 模式，则初始化 ICU、AtExitManager，然后进入 `electron::NodeMain()`
4. 如果都不是，则进入正常 Electron 启动流程
5. 初始化 `ElectronMainDelegate`[+ElectronMainDelegate]
6. 最后调用 Chromium 的 `content::ContentMain()`，正式进入 Electron/Chromium 的多进程启动流程

:::

## ContentMain 的代理机制

`ContentMain` 方法主要是用于启动 Chromium。该方法接受一个代理对象作为参数，工程师可以对这个代理对象进行一些初始化的工作，从而达到对 Chromium 进行二次开发的目的。

Electron 工程师正是利用了该代理对象，注入了自己的逻辑。

:::tip 理解代理模式
`ElectronMainDelegate` 继承于 Chromium 的 `ContentMainDelegate` 类，通过覆写其生命周期方法，Electron 能够在 Chromium 启动的不同阶段注入自己的代码。
:::

### CreateContentBrowserClient

通过 `ElectronMainDelegate` 的 `CreateContentBrowserClient` 方法，会创建一个 `ElectronBrowserClient` 对象（位于 `shell/browser/electron_browser_client.cc`），该对象继承于 Chromium 的 `ContentBrowserClient` 类。

`ContentBrowserClient` 类提供了一系列的方法：

- `IsBrowserStartupComplete`：判断浏览器核心是否完全启动
- `IsShuttingDown`：判断浏览器核心是否被关闭
- `RenderProcessWillLaunch`：是否有新的渲染进程将要被加载

### CreateBrowserMainParts

接下来通过 `ElectronBrowserClient` 类的 `CreateBrowserMainParts` 方法，会去创建一个 `ElectronBrowserMainParts` 对象[+ElectronBrowserMainParts]。

:::warning 关键事件
整个 Electron 就是在 `ElectronBrowserMainParts` 对象所对应的 `PostEarlyInitialization` 这个事件中初始化的 Node.js 环境。
:::

`PostEarlyInitialization` 事件实际上是 Chromium 启动的时候的一个比较早期的事件，类似的事件还有：

:::table full-width

| 事件名称 | 触发时机 | 说明 |
| --- | --- | --- |
| `PreCreateMainMessageLoop` | 浏览器主进程消息循环开始前 | 早期初始化阶段 |
| `PostEarlyInitialization` | 早期初始化完成后 | **Node.js 环境在此初始化** |
| `PostCreateMainMessageLoop` | 浏览器主进程消息循环开始后 | 消息循环准备就绪 |
| `OnFirstIdle` | 主进程第一次进入空闲时 | 空闲阶段 |

:::

## Node.js 环境初始化流程

在 `PostEarlyInitialization` 方法中，Node.js 环境的初始化流程如下：

:::: steps

1. 创建 JavaScript 环境

   使用 `node_bindings_->uv_loop()` 创建 `JavascriptEnvironment` 实例，这是 Node.js 运行的基础环境。

   ```c++
   // shell/browser/electron_browser_main_parts.cc
   // 使用 Node 的 uv_loop 创建 JavaScript 环境
   js_env_ = std::make_unique<JavascriptEnvironment>(node_bindings_->uv_loop());
   ```

2. 初始化 Node 绑定

   调用 `NodeBindings::Initialize` 方法，初始化 Electron 的操作系统所支持的逻辑，比如剪切板、系统菜单、托盘图标之类的控制逻辑。

   ```c++
   // shell/browser/electron_browser_main_parts.cc
   // 初始化 Node 绑定，传入 V8 isolate 和当前上下文
   node_bindings_->Initialize(isolate, isolate->GetCurrentContext());
   ```

   ```c++
   // shell/common/node_bindings.cc
   // RegisterBuiltinModules 注册 Electron 为 Node.js 提供的扩展模块
   void NodeBindings::Initialize(v8::Isolate* isolate,
                                  v8::Local<v8::Context> context) {
     // 注册内置模块，如 clipboard、crash-reporter 等
     RegisterBuiltinModules();
   }
   ```

3. 创建 Node 全局环境

   调用 `CreateEnvironment` 方法创建 Node.js 的全局环境。

   ```c++
   // shell/browser/electron_browser_main_parts.cc
   // 创建 Node.js 全局环境
   node_env_ = node_bindings_->CreateEnvironment(
       isolate, isolate->GetCurrentContext(), js_env_->platform(),
       js_env_->max_young_generation_size_in_bytes());
   ```

4. 绑定 Electron 扩展 API

   `electron_bindings_` 是 `ElectronBindings` 类的一个实例对象，其 `BindTo` 方法是为 `process` 对象提供一系列的扩展方法和属性，例如：
   - `getCPUUsage`
   - `crash`
   - `getCreationTime`

   ```c++
   // shell/browser/electron_browser_main_parts.cc
   // 将 Electron 扩展 API 绑定到 process 对象
   electron_bindings_->BindTo(isolate, node_env_->process_object());
   ```

   ```c++
   // shell/common/electron_bindings.cc
   // BindTo 方法为 process 对象添加扩展方法
   void ElectronBindings::BindTo(v8::Isolate* isolate,
                                  v8::Local<v8::Object> process) {
     // 绑定 getCPUUsage 方法
     // 绑定 crash 方法
     // 绑定 getCreationTime 方法
   }
   ```

5. 加载 Node.js 环境

   调用 `LoadEnvironment` 方法，这是最终初始化 Node.js 运行环境的方法。

   ```c++
   // shell/browser/electron_browser_main_parts.cc
   // 加载 Node.js 环境，执行初始化脚本
   node_bindings_->LoadEnvironment(node_env_.get());
   ```

6. 等待应用代码执行

   调用 `JoinAppCode` 方法，等待应用的主代码执行完成。

   ```c++
   // shell/browser/electron_browser_main_parts.cc
   // 等待应用主代码执行完成
   node_bindings_->JoinAppCode();
   ```

::::

> [!NOTE]
> 整个初始化过程的核心是 `node_bindings_` 和 `electron_bindings_` 两个对象。前者负责 Node.js 原生能力的初始化，后者负责 Electron 扩展 API 的注入。

## 渲染进程 Node 环境

渲染进程中初始化 Node.js 环境的过程与主进程类似，但触发时机不同。

首先和之前在主进程中初始化 Node.js 环境一样，会传入一个名为 `ElectronMainDelegate` 的代理对象。

接下来每创建一个渲染进程，都会执行代理对象的 `CreateContentRendererClient` 方法。该方法会创建一个 `ElectronRendererClient` 对象（位于 `shell/renderer/electron_renderer_client.cc`），该对象继承于 Chromium 的 `ContentRendererClient` 类。

`ContentRendererClient` 类为整个渲染进程的生命周期暴露了一系列的事件：

:::table full-width

| 事件名称 | 触发时机 | 说明 |
| --- | --- | --- |
| `DidCreateScriptContext` | 渲染进程的 JS 执行环境准备就绪时 | **Node.js 环境在此初始化** |
| `WillReleaseScriptContext` | 卸载渲染进程的 JS 执行环境时 | 清理资源 |

:::

:::tip 关键区别
渲染进程中初始化 Node.js 环境的过程就是在 `DidCreateScriptContext` 这个事件中执行的，而不是像主进程那样在 `PostEarlyInitialization` 中执行。
:::

```c++
// shell/renderer/electron_renderer_client.cc
// 渲染进程初始化 Node.js 环境
void ElectronRendererClient::DidCreateScriptContext(
    v8::Handle<v8::Context> context,
    content::RenderFrame* render_frame) {
  // 创建 Node.js 环境
  node::Environment* env = node_bindings_->CreateEnvironment(
      context, nullptr, uv_loop());

  // 绑定 Electron 扩展 API
  electron_bindings_->BindTo(env->process_object());

  // 加载 Node.js 环境
  node_bindings_->LoadEnvironment(env);
}

// 渲染进程销毁 Node.js 环境
void ElectronRendererClient::WillReleaseScriptContext(
    v8::Handle<v8::Context> context,
    content::RenderFrame* render_frame) {
  // 停止 Node.js 环境
  node::Environment* env = node::GetCurrentEnvironment(context);
  if (env) {
    node::Stop(env);
  }
}
```

## 总结

:::table full-width

| 进程类型 | 初始化时机 | 关键类 | 关键方法 |
| --- | --- | --- | --- |
| 主进程 | `PostEarlyInitialization` | `ElectronBrowserMainParts` | `node_bindings_->LoadEnvironment()` |
| 渲染进程 | `DidCreateScriptContext` | `ElectronRendererClient` | 类似的初始化流程 |

:::

[+NodeBindings]:
  `NodeBindings` 类（位于 `shell/common/node_bindings.cc`）是 Electron 中负责桥接 Node.js 和 Chromium 的核心类。
  它创建了 Node.js 的事件循环（uv_loop），并将其集成到 Chromium 的消息循环中。
