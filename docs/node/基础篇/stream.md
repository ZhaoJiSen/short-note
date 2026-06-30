---
title: stream 模块
createTime: 2026/04/16 23:20:00
permalink: /node/bye9cq7r/
---

`stream`（流）是 Node.js 处理流式数据的抽象接口。它把数据看作"随时间陆续到达的一连串块"，而不是"一次性完整加载的整体"。文件读写、网络通信、压缩加密等场景的数据往往很大或源源不断，流让我们能够边到达边处理，无需把全部数据堆进内存。

Node 中许多核心对象本身就是流：`fs.createReadStream` 返回可读流，HTTP 的 `req`/`res` 是流，`process.stdin`/`stdout` 也是流。理解流是写出高效、低内存占用 Node 程序的关键。

## 为什么需要流

设想读取一个 2GB 的日志文件并发送给客户端。如果用 `readFile` 一次性读入，会瞬间占用 2GB 内存，并发几个请求就内存溢出。流的做法是把文件切成一个个小块（chunk），读一块、发一块、再读下一块，内存占用始终维持在一个很小的水平。

流带来三个核心收益：

- **低内存占用**：无论数据多大，内存只需容纳当前正在处理的块
- **时间效率**：数据边到达边处理，不必等全部就绪
- **可组合**：通过管道把多个流串联，像搭积木一样构建数据处理链路

## 四种流类型

Node 的流分为四种，覆盖读、写、读写、转换四类需求：

:::table full-width
| 类型 | 说明 | 典型例子 |
| --- | --- | --- |
| **Readable**（可读流） | 数据的来源，从中读取数据 | `fs.createReadStream`、HTTP 请求 `req` |
| **Writable**（可写流） | 数据的去向，向其写入数据 | `fs.createWriteStream`、HTTP 响应 `res` |
| **Duplex**（双工流） | 既可读又可写，读写互相独立 | TCP `socket` |
| **Transform**（转换流） | 双工流的特例，写入的数据经转换后可读出 | `zlib` 压缩、加密 |
:::

## 可读流的两种模式

可读流有两种消费数据的模式，初学者容易混淆：

**流动模式（flowing）**：监听 `data` 事件，数据一到就自动、尽快地推送给你：

```javascript
import { createReadStream } from 'node:fs'

const rs = createReadStream('./big.log', { encoding: 'utf8' })

rs.on('data', (chunk) => {
  console.log(`收到 ${chunk.length} 字符`)
})

rs.on('end', () => console.log('读取完成'))
rs.on('error', (err) => console.error('出错', err))
```

**暂停模式（paused）**：用 `for await...of` 异步迭代，由你主动按节奏拉取，代码更直观且天然处理背压：

```javascript
import { createReadStream } from 'node:fs'

const rs = createReadStream('./big.log', { encoding: 'utf8' })

for await (const chunk of rs) {
  console.log(`处理 ${chunk.length} 字符`)
}
console.log('读取完成')
```

现代 Node 开发推荐 `for await...of`，它把流当作异步可迭代对象，错误可以用 try/catch 捕获，背压自动处理。

## 管道与背压

### pipe:把可读流接到可写流

`pipe` 把一个可读流的输出直接灌入可写流，自动处理数据搬运：

```javascript
import { createReadStream, createWriteStream } from 'node:fs'

createReadStream('./source.mp4')
  .pipe(createWriteStream('./dest.mp4'))
```

### 背压(backpressure)是流最重要的概念

背压指的是**生产速度快于消费速度时的协调机制**。如果可读流疯狂地读、可写流来不及写（比如磁盘慢、网络慢），数据就会在内存里堆积，最终内存溢出。

流通过背压自动解决这个问题：`write()` 返回 `false` 时表示内部缓冲已满，此时应暂停读取，等可写流触发 `drain` 事件再继续。`pipe` 和 `pipeline` 会自动做这件事，这正是不该手动 `data` + `write` 搬运数据的原因——容易漏掉背压处理。

### pipeline:更安全的管道

`pipe` 有个缺陷：当中间某个流出错时，不会自动销毁其他流，可能导致内存泄漏或文件句柄泄漏。`pipeline`（推荐）解决了这个问题，它在任一环节出错时会正确关闭所有流：

```javascript
import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'

// 读取文件 → gzip 压缩 → 写入新文件
await pipeline(
  createReadStream('./access.log'),
  createGzip(),
  createWriteStream('./access.log.gz')
)
console.log('压缩完成')
```

这段代码完整展示了流的可组合性：三个流串成一条处理链，数据流过时被逐块压缩，全程内存占用极低，且出错时自动清理。

## 常见开发场景

### 大文件复制

```javascript
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

await pipeline(
  createReadStream('./large.iso'),
  createWriteStream('./backup.iso')
)
```

### HTTP 流式响应文件

直接把文件流 pipe 给响应对象，不必把文件读进内存：

```javascript
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'

createServer((req, res) => {
  res.setHeader('Content-Type', 'video/mp4')
  createReadStream('./movie.mp4').pipe(res)
}).listen(3000)
```

### 自定义 Transform 流

继承 `Transform` 实现一个把文本转大写的流：

```javascript
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase())
  }
})

await pipeline(process.stdin, upperCase, process.stdout)
// 在终端运行后，输入的内容会被转成大写输出
```

## 易错点与注意事项

**手动搬运数据漏掉背压**：用 `readable.on('data')` + `writable.write()` 手动搬运时，如果不检查 `write()` 的返回值、不监听 `drain`，高速数据会撑爆内存。优先用 `pipe`/`pipeline` 让框架处理背压。

**用 pipe 不处理错误**：`pipe` 不会在出错时自动销毁上下游流，可能造成句柄泄漏。生产代码应使用 `pipeline`（来自 `node:stream/promises`），它保证出错时清理所有流。

**编码问题**：可读流默认返回 `Buffer`，不指定 `encoding` 时 `chunk` 是 Buffer 而非字符串。处理文本要么设置 `{ encoding: 'utf8' }`，要么手动 `chunk.toString()`。

**Transform 中忘记 callback**：自定义 Transform 流的 `transform` 方法必须调用 `callback`，否则流会停住不再处理后续数据。

**混用流动模式与暂停模式**：一旦监听了 `data` 事件，流就进入流动模式，再用 `read()` 主动拉取会行为混乱。两种模式只用其一。

## 高频问题

**问题一：Node 中有哪几种流？**

答：Readable（可读）、Writable（可写）、Duplex（双工）、Transform（转换）四种。Transform 是 Duplex 的特例，输入数据经转换后输出。

**问题二：什么是背压，如何处理？**

答：背压是数据生产快于消费时的堆积问题。当可写流 `write()` 返回 `false` 表示缓冲已满，应暂停读取直到 `drain` 事件。使用 `pipe`/`pipeline` 会自动处理背压。

**问题三：pipe 和 pipeline 有什么区别？**

答：`pipe` 在中间流出错时不会自动销毁其他流，可能泄漏；`pipeline` 会在任一环节出错时正确关闭所有流，是推荐用法。

**问题四：为什么大文件要用流而不是 readFile？**

答：`readFile` 会把整个文件读进内存，大文件会导致内存溢出。流分块处理，内存占用始终很小，且能边读边处理。

**问题五：流的两种读取模式是什么？**

答：流动模式（监听 `data` 事件，数据自动推送）和暂停模式（用 `read()` 或 `for await...of` 主动拉取）。现代开发推荐 `for await...of`。

## 总结

流是 Node 处理大数据和持续数据的核心抽象：

- 四种流类型对应读、写、读写、转换；许多核心对象（文件、HTTP、stdin/stdout）本身就是流
- 流的本质是分块处理，用极小的内存处理任意大小的数据
- 背压是流最重要的概念，`pipe`/`pipeline` 会自动协调生产与消费的速度
- 优先使用 `pipeline`（出错自动清理）和 `for await...of`（代码直观、背压自动）
- 大文件复制、HTTP 响应、压缩加密等场景都应该用流

流与 [fs 模块](/node/1jbhp0rf/)、[事件循环](/node/2xt2aon8/) 紧密相关，掌握它才能写出真正高效的 Node 服务。
