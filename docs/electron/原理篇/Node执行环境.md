---
title: Node 执行环境
createTime: 2026/05/08 07:27:15
permalink: /electron/aisvw1te/
---

## 主进程 Node 环境

[+位置]: 该函数位于 `shell/app/electron_main_win.cc`
[+ElectronMainDelegate]: 位于 `shell/app/electron_main_delegate.cc`。它是 Electron 提供给 Chromium `content::ContentMain` 的启动委托类，用来介入和定制 Chromium 的启动流程。例如在 `PreEarlyInitialization` 阶段设置一些环境变量，或者在 `PreCreateThreads` 阶段创建一些线程等

当用户启动 Electron 应用时，会执行整个应用的入口函数 `wWinMain`（Windows 环境）[+位置]。该函数会对命令行指令进行处理、初始化环境变量

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
  //    启用 ELECTRON_RUN_AS_NODE 时 Electron 不会走完整的 Chromium/Electron 应用启动流程，
  //    而是直接进入 Node.js 的启动入口
  if (run_as_node) {
    base::AtExitManager atexit_manager;
    base::i18n::InitializeICU();
    return electron::NodeMain();
  }

  // 5. 读取当前进程的命令行参数
  const base::CommandLine* command_line =
      base::CommandLine::ForCurrentProcess();

  const std::string process_type =
      command_line->GetSwitchValueASCII(kProcessType);

  // 6. 如果当前进程是 crashpad-handler，则启动崩溃上报进程
  if (process_type == crash_reporter::switches::kCrashpadHandler) {
    base::FilePath user_data_dir =
        command_line->GetSwitchValuePath(kUserDataDir);

    return crash_reporter::RunAsCrashpadHandler(
        *command_line,
        user_data_dir,
        kProcessType,
        kUserDataDir
    );
  }

  // 7. 普通 Electron 应用启动流程
  base::win::AllowDarkModeForApp(true);

  if (!electron::CheckCommandLineArguments(command_line->argv()))
    return -1;

  sandbox::SandboxInterfaceInfo sandbox_info = {nullptr};
  content::InitializeSandboxInfo(&sandbox_info);

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
4. 如果当前进程是 `crashpad-handler`，则进入崩溃上报进程逻辑
5. 如果都不是，则进入正常 Electron 启动流程
6. 初始化 sandbox 信息和 `ElectronMainDelegate`[+ElectronMainDelegate]
7. 最后调用 Chromium 的 `content::ContentMain()`，正式进入 Electron/Chromium 的多进程启动流程
:::

## 渲染进程 Node 环境
