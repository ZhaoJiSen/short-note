---
title: fs 模块
createTime: 2026/01/14 17:13:34
permalink: /node/1jbhp0rf/
---

`fs`（File System）是 Node.js 内置的核心模块，提供对文件系统操作的全部能力。无论是读取配置文件、写日志、解析数据文件，还是处理上传资源，都离不开 `fs` 模块的支持。

Node.js 的 `fs` 模块由 libuv 提供底层实现，异步 API 采用线程池机制，在 I/O 阻塞时不会阻塞事件循环，这是 Node.js 能够高效处理并发请求的关键因素之一。

## 为什么需要 fs

在前端开发中，浏览器出于安全考虑，限制了直接访问本地文件系统。而 Node.js 作为后端运行时，允许 JavaScript 直接与操作系统交互。文件读写是服务端开发最基础的能力：

- 读取配置：应用启动时从磁盘加载配置文件
- 数据持久化：将内存中的数据写入文件或数据库
- 日志记录：将运行时信息输出到日志文件
- 静态资源：提供静态文件的读取与响应

## 核心能力概览

`fs` 模块的核心能力可分为以下几类：

**文件操作**：读取、写入、追加、复制、删除、获取元信息

**目录操作**：创建、读取、删除、重命名

**文件描述符**：通过句柄进行低层次的文件操作，支持随机读写

**流操作**：大文件处理、管道传输

**监视**：监听文件或目录的变化

## 常用 API

### 读取文件

读取文件是最常见的操作，推荐使用 `fs/promises` 的 Promise 风格：

```javascript
import { readFile } from 'node:fs/promises'

// 读取文本文件
const content = await readFile('./package.json', 'utf8')
console.log(content)

// 读取二进制文件
const buffer = await readFile('./image.png')
console.log(buffer.length)
```

`readFile` 的第二个参数可以指定编码，不传则返回 `Buffer`。对于文本文件，明确传入 `'utf8'` 可以直接得到字符串，避免手动转换。

**使用场景**：读取配置文件、加载模板、解析数据文件。

### 写入文件

写入文件会覆盖原内容，如果目标文件不存在则自动创建：

```javascript
import { writeFile } from 'node:fs/promises'

await writeFile('./output.txt', 'Hello Node.js', 'utf8')

// 写入 Buffer
await writeFile('./data.bin', Buffer.from([0x01, 0x02, 0x03]))
```

`writeFile` 默认以 `w` 模式打开文件，即创建新文件或截断已有文件。如果需要原子写入或更细粒度的控制，可以使用 `open` + `write`。

**使用场景**：保存处理结果、写入配置、生成报告。

### 追加内容

追加写入不会覆盖已有内容，而是在文件末尾添加新数据：

```javascript
import { appendFile } from 'node:fs/promises'

await appendFile('./access.log', `${Date.now()} - request received\n`, 'utf8')
```

如果文件不存在，`appendFile` 会自动创建它。这使得 appendFile 非常适合日志记录场景。

**使用场景**：日志写入、错误追踪、用户行为记录。

### 删除文件

删除单个文件使用 `unlink`：

```javascript
import { unlink } from 'node:fs/promises'

await unlink('./temp.txt')
```

删除目录需要使用 `rm`，且需要设置 `recursive: true`：

```javascript
import { rm } from 'node:fs/promises'

await rm('./cache', { recursive: true, force: true })
```

`force: true` 表示不抛错即使目录不存在，这在清理目录时很实用。

**使用场景**：清理临时文件、删除用户上传的文件、清除缓存目录。

### 判断文件状态

`stat` 返回文件或目录的元信息：

```javascript
import { stat } from 'node:fs/promises'

const info = await stat('./package.json')

console.log(info.isFile())      // true
console.log(info.isDirectory()) // false
console.log(info.size)          // 文件大小（字节）
console.log(info.mtime)         // 修改时间
console.log(info.mode)          // 权限位
```

需要注意的是，`stat` 会跟随符号链接。如果需要获取符号链接本身的信息，使用 `lstat`：

```javascript
import { lstat } from 'node:fs/promises'

const info = await lstat('./symlink')  // 返回链接本身的信息，而非目标
```

`access` 用于检查文件是否存在以及是否有特定权限：

```javascript
import { access, constants } from 'node:fs/promises'

// 检查文件是否存在
await access('./config.json')

// 检查是否可读
await access('./data.txt', constants.R_OK)

// 检查是否可读写
await access('./output', constants.R_OK | constants.W_OK)
```

**使用场景**：处理文件前先检查存在性、权限校验、区分文件和目录。

### 目录操作

创建目录：

```javascript
import { mkdir } from 'node:fs/promises'

// 简单创建（父目录必须存在）
await mkdir('./uploads')

// 递归创建（父目录不存在时自动创建）
await mkdir('./a/b/c', { recursive: true })
```

读取目录内容：

```javascript
import { readdir } from 'node:fs/promises'

// 只返回文件名
const files = await readdir('./src')

// 返回 Dirent 对象（可判断类型）
const entries = await readdir('./src', { withFileTypes: true })
for (const entry of entries) {
  if (entry.isFile()) {
    console.log(`文件: ${entry.name}`)
  } else if (entry.isDirectory()) {
    console.log(`目录: ${entry.name}`)
  }
}
```

重命名或移动：

```javascript
import { rename } from 'node:fs/promises'

await rename('./old-name.txt', './new-name.txt')
await rename('./file.txt', './subdir/file.txt')  // 移动文件
```

**使用场景**：项目初始化、文件遍历、目录结构操作。

### 同步 API 与异步 API 的区别

Node.js 的 `fs` 模块提供三套 API：

**Promise 风格**（推荐）：返回 Promise，配合 async/await 使用

```javascript
import { readFile } from 'node:fs/promises'

const data = await readFile('config.json', 'utf8')
```

**回调风格**：最后一个参数是回调函数

```javascript
import { readFile } from 'node:fs'

readFile('config.json', 'utf8', (err, data) => {
  if (err) throw err
  console.log(data)
})
```

**同步风格**：直接在当前线程执行，阻塞后续代码

```javascript
import { readFileSync } from 'node:fs'

const data = readFileSync('config.json', 'utf8')
```

同步 API 名称以 `Sync` 结尾，如 `readFileSync`、`writeFileSync`。在服务端请求处理中使用同步 API 会阻塞事件循环，导致其他请求无法被处理，**严禁在请求路径中使用同步 API**。

同步 API 适用于：命令行脚本、构建工具、测试代码、应用启动阶段的配置加载。

### fs/promises 的使用方式

`fs/promises` 是现代 Node.js 开发的首选，它导出 Promise 版本的 API：

```javascript
// 完整导入
import * as fs from 'node:fs/promises'

// 按需导入
import { readFile, writeFile, mkdir } from 'node:fs/promises'
```

与回调风格相比，Promise 风格的优势在于：

- 代码可读性更好，避免嵌套回调
- 可以使用 try/catch 进行错误处理
- 可以使用 Promise.all 并行执行多个操作

并行读取多个文件：

```javascript
import { readFile } from 'node:fs/promises'

const [config, data, template] = await Promise.all([
  readFile('./config.json', 'utf8'),
  readFile('./data.csv', 'utf8'),
  readFile('./template.html', 'utf8')
])
```

## 常见开发场景

### 读取 JSON 配置文件

```javascript
import { readFile } from 'node:fs/promises'

async function loadConfig() {
  const content = await readFile('./config.json', 'utf8')
  return JSON.parse(content)
}
```

解析 JSON 时需要捕获 SyntaxError，建议包装成工具函数：

```javascript
async function loadJson(filepath) {
  try {
    const content = await readFile(filepath, 'utf8')
    return JSON.parse(content)
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${filepath}`)
    }
    throw err
  }
}
```

### 简单的日志写入

```javascript
import { appendFile } from 'node:fs/promises'

async function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`
  await appendFile('./app.log', line, 'utf8')
}
```

生产环境中建议使用专业日志库如 pino、winston。

### 检查并创建目录

```javascript
import { access, mkdir } from 'node:fs/promises'
import { constants } from 'node:fs'

async function ensureDir(dirpath) {
  try {
    await access(dirpath, constants.F_OK)
  } catch {
    await mkdir(dirpath, { recursive: true })
  }
}
```

### 遍历目录查找文件

```javascript
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

async function findFiles(dir, ext) {
  const results = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...await findFiles(fullPath, ext))
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath)
    }
  }

  return results
}

const jsFiles = await findFiles('./src', '.js')
```

### 复制文件

使用流复制大文件：

```javascript
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

await pipeline(
  createReadStream('./large.mp4'),
  createWriteStream('./backup.mp4')
)
```

`pipeline` 会自动处理背压问题，并在出错时正确关闭流，避免文件句柄泄漏。

### 文件锁防止并发写入

多进程同时写入同一文件可能导致数据损坏，使用文件锁可以避免这种情况：

```javascript
import { open } from 'node:fs/promises'

async function writeWithLock(filepath, data) {
  const file = await open(filepath, 'r+')
  try {
    await file.lock()
    const content = await file.read({ encoding: 'utf8' })
    await file.write(content + data)
  } finally {
    await file.close()
  }
}
```

## 易错点与注意事项

**路径问题**：相对路径是相对于当前工作目录（process.cwd()），而非脚本文件所在目录。生产环境中建议使用绝对路径，或基于 `__dirname`、`import.meta.url` 构建：

```javascript
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = resolve(__dirname, './config.json')
```

**大文件处理**：超过几百 MB 的文件不应使用 `readFile`，而应使用流：

```javascript
import { createReadStream } from 'node:fs'

createReadStream('./large.log')
  .on('data', (chunk) => { /* 处理 chunk */ })
  .on('end', () => { /* 完成 */ })
```

**编码问题**：Windows 下的文本文件可能使用 GBK 编码，读取时需要指定正确的编码：

```javascript
const content = await readFile('./gbk.txt', 'gbk')
```

**文件句柄泄漏**：使用 `open` 返回的 FileHandle 后必须关闭，或使用 try/finally 确保关闭：

```javascript
const file = await open('./data.txt', 'r')
try {
  // 使用 file
} finally {
  await file.close()
}
```

**删除目录**：删除目录必须使用 `rm` 并设置 `recursive: true`，单独的 `rmdir` 只能删除空目录：

```javascript
await rm('./dir', { recursive: true, force: true })
```

**权限问题**：在 Linux/macOS 上，写入文件需要父目录的写权限。遇到 EACCES 错误时，检查目录权限。

**并发写入竞争**：多个异步操作同时写入同一文件可能导致数据交叉，使用文件锁或队列化处理。

## 面试或工程中高频问题

**问题一：fs 模块有哪几种 API 风格？**

答：`fs` 模块提供三种风格的 API——回调风格、Promise 风格（fs/promises）、同步风格（Sync 结尾）。现代开发推荐使用 Promise 风格，配合 async/await 使用。

**问题二：同步 API 为什么不能在服务端使用？**

答：Node.js 是单线程事件循环模型，同步 API 会阻塞事件循环，导致其他请求无法被处理。在请求处理路径中使用同步 API 会导致服务吞吐量急剧下降。同步 API 仅适用于脚本、构建工具、测试代码等场景。

**问题三：大文件读取应该怎么做？**

答：使用流式读取（createReadStream），避免一次性将整个文件加载到内存。流可以分块处理数据，并且自动处理背压。

**问题四：如何确保文件写入的原子性？**

答：可以使用 `fs.open` 的 `r+` 模式配合 `write` 方法，或使用临时文件写入后重命名。写入完成后通过 `rename` 原子性地替换原文件。

**问题五：fs.watch 的局限性是什么？**

答：`fs.watch` 依赖操作系统的原生事件，在不同平台表现不一致，某些情况下可能无法检测到文件变化。需求更可靠的监控时，可以使用 `chokidar` 等第三方库。

**问题六：如何处理文件不存在的情况？**

答：使用 `access` 检查或直接尝试操作并捕获 ENOENT 错误。`readFile` 在文件不存在时直接抛出错误，错误码为 'ENOENT'。

## 总结

`fs` 模块是 Node.js 文件操作的核心，几乎所有服务端应用都会与之打交道。日常开发中应遵循以下原则：

- 优先使用 `fs/promises` 的 Promise 风格，代码更简洁、可维护性更高
- 处理大文件必须使用流，避免内存溢出
- 构建路径时结合 `path` 模块，避免跨平台路径问题
- 使用 try/catch 捕获错误，根据错误码进行针对性处理
- 避免在请求路径中使用同步 API，防止阻塞事件循环

掌握 `fs` 模块的操作是 Node.js 后端开发的基础，后续的日志、配置、数据持久化等功能都建立在此之上。
