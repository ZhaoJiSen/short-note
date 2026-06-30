---
title: child_process 模块
createTime: 2026/04/16 23:10:00
permalink: /node/hv1s28mq/
---

`child_process`（子进程）是 Node.js 内置的核心模块，用于创建和管理子进程。Node 是单线程的，面对 CPU 密集型任务或需要调用系统命令、其他语言程序的场景时，可以通过子进程把工作交给独立的进程去做，从而绕开单线程的限制、充分利用多核 CPU。

它的底层同样由 libuv 实现，子进程拥有独立的内存空间和 V8 实例，与主进程通过标准流或 IPC 通道通信。

## 为什么需要子进程

Node 的事件循环擅长 I/O 密集型任务，但有几类需求单靠主进程无法很好地解决：

- **执行系统命令**：调用 `git`、`ffmpeg`、`python` 等外部程序
- **CPU 密集型计算**：图像处理、加密、大数据计算，放在主进程会阻塞事件循环
- **利用多核**：主进程是单线程，无法吃满多核 CPU，通过多个子进程可以并行
- **隔离风险**：把不稳定或不可信的任务放到子进程，崩溃也不影响主进程

## 四种创建方式

`child_process` 提供四个创建子进程的方法，区别主要在于是否走 shell、是否缓冲输出、是否支持 IPC：

:::table full-width
| 方法 | 是否走 shell | 输出处理 | 典型用途 |
| --- | --- | --- | --- |
| `spawn` | 否 | 流式（stream） | 长时间运行、输出量大的命令 |
| `exec` | 是 | 缓冲（一次性返回） | 简单命令、输出量小、需要 shell 语法 |
| `execFile` | 否 | 缓冲 | 直接执行可执行文件，比 exec 更安全 |
| `fork` | 否 | 流式 + IPC 通道 | 专门派生 Node 子进程，主子进程间通信 |
:::

### spawn:流式、适合大输出

`spawn` 不缓冲输出，而是通过流逐块返回，适合输出量大或长时间运行的命令：

```javascript
import { spawn } from 'node:child_process'

const child = spawn('ls', ['-lh', '/usr'])

child.stdout.on('data', (data) => {
  console.log(`输出：${data}`)
})

child.stderr.on('data', (data) => {
  console.error(`错误：${data}`)
})

child.on('close', (code) => {
  console.log(`子进程退出，退出码 ${code}`)
})
```

`spawn` 的第一个参数是命令，第二个参数是参数数组。因为不走 shell，命令和参数分开传递，天然避免了命令注入风险。

### exec:缓冲、适合简单命令

`exec` 会启动一个 shell 来执行命令，把完整输出缓冲后一次性通过回调返回：

```javascript
import { exec } from 'node:child_process'

exec('cat *.js | wc -l', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行出错：${error.message}`)
    return
  }
  console.log(`行数：${stdout}`)
})
```

因为走 shell，可以直接用管道 `|`、通配符 `*` 等 shell 语法。但缓冲意味着输出过大时会超出 `maxBuffer`（默认 1MB）导致报错，大输出场景应改用 `spawn`。

### execFile:不走 shell 的 exec

`execFile` 与 `exec` 类似也是缓冲输出，但不启动 shell，直接执行指定的可执行文件，更高效也更安全：

```javascript
import { execFile } from 'node:child_process'

execFile('node', ['--version'], (error, stdout) => {
  if (error) throw error
  console.log(`Node 版本：${stdout}`)
})
```

### fork:派生 Node 子进程并通信

`fork` 是 `spawn` 的特例，专门用来派生新的 Node.js 进程，并自动在父子进程间建立一条 IPC 通道，可以用 `send` 收发消息：

```javascript
// parent.mjs
import { fork } from 'node:child_process'

const child = fork('./child.mjs')

child.on('message', (msg) => {
  console.log('父进程收到：', msg)
})

child.send({ type: 'task', payload: [1, 2, 3, 4, 5] })
```

```javascript
// child.mjs
process.on('message', (msg) => {
  if (msg.type === 'task') {
    const sum = msg.payload.reduce((a, b) => a + b, 0)
    process.send({ type: 'result', sum })
  }
})
```

`fork` 让父子进程像收发消息一样协作，是把 CPU 密集任务分流到子进程的常用手段。

## 常见开发场景

### 把 CPU 密集任务交给子进程

主进程接到计算请求时，派生子进程去算，算完通过 IPC 返回，主进程的事件循环全程不被阻塞：

```javascript
// 主进程：派发任务，不阻塞
import { fork } from 'node:child_process'

function heavyCompute(data) {
  return new Promise((resolve, reject) => {
    const child = fork('./worker.mjs')
    child.send(data)
    child.on('message', resolve)
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code !== 0) reject(new Error(`worker 退出码 ${code}`))
    })
  })
}

const result = await heavyCompute({ n: 40 })
```

> [!NOTE]
> 如果只是纯计算、不需要执行外部程序，更推荐使用 `worker_threads`，它比子进程更轻量、共享内存更方便。子进程的优势在于完全隔离和能执行任意外部命令。

### 调用外部命令行工具

```javascript
import { spawn } from 'node:child_process'

function convertVideo(input, output) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-i', input, output])
    ff.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`ffmpeg 退出码 ${code}`))
    })
  })
}
```

### 流式处理大量输出

```javascript
import { spawn } from 'node:child_process'

const tail = spawn('tail', ['-f', '/var/log/app.log'])
tail.stdout.on('data', (chunk) => {
  process.stdout.write(chunk)
})
```

## 易错点与注意事项

**命令注入风险**：`exec` 会把字符串交给 shell 解析，如果命令中拼接了用户输入，攻击者可以注入恶意命令。涉及外部输入时，优先用 `spawn` 或 `execFile`，把参数作为数组传递，绝不拼接到命令字符串里：

```javascript
// 危险：用户输入直接拼进 shell
exec(`ls ${userInput}`)

// 安全：参数数组，不经过 shell
spawn('ls', [userInput])
```

**maxBuffer 溢出**：`exec` 和 `execFile` 缓冲输出，默认上限 1MB，超出会报 `ENOBUFS` 并杀掉子进程。大输出务必用 `spawn` 的流式方式，或调大 `maxBuffer`。

**忘记监听 error 事件**：子进程启动失败（如命令不存在）会触发 `error` 事件而非 `close`，不监听会导致未捕获异常。

**僵尸进程**：子进程结束后若父进程不处理，可能残留。长期运行的服务要确保监听 `exit`/`close` 并适时清理。

**跨平台差异**：Windows 与类 Unix 的命令不同（如 `dir` vs `ls`），且 Windows 下执行 `.cmd`/`.bat` 可能需要 `shell: true`。跨平台脚本要特别注意。

## 高频问题

**问题一：spawn 和 exec 的区别？**

答：`spawn` 通过流式返回输出、不走 shell，适合大输出或长时间运行的命令；`exec` 启动 shell、缓冲输出后一次性返回，适合输出量小且需要 shell 语法的简单命令。

**问题二：fork 和 spawn 的关系？**

答：`fork` 是 `spawn` 的特例，专门派生 Node 进程，并自动建立 IPC 通道，父子进程可以用 `send`/`message` 通信。

**问题三：什么时候用子进程，什么时候用 worker_threads？**

答：需要执行外部程序、完全隔离、或运行非 JS 程序时用子进程；纯 CPU 密集型的 JS 计算且希望轻量、共享内存时用 worker_threads。

**问题四：如何避免命令注入？**

答：避免使用 `exec` 拼接用户输入，改用 `spawn`/`execFile` 并以数组形式传参，参数不经过 shell 解析。

**问题五：子进程间能共享内存吗？**

答：默认不能，子进程有独立的内存空间，只能通过 IPC 消息或标准流通信。需要共享内存应使用 worker_threads 的 SharedArrayBuffer。

## 总结

`child_process` 是 Node 突破单线程限制、与外部世界协作的关键模块：

- 四种创建方式各有侧重：`spawn` 流式、`exec` 走 shell、`execFile` 直接执行文件、`fork` 派生 Node 并支持 IPC
- 大输出、长任务用 `spawn`；简单命令用 `exec`；进程间通信用 `fork`
- 涉及用户输入时用数组传参，杜绝命令注入
- 纯 JS 计算优先考虑 `worker_threads`，子进程更适合隔离和调用外部程序

子进程让 Node 既能调度 I/O，又能把重活分流出去，是构建健壮服务端应用的重要一环。
