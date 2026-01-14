---
title: fs
createTime: 2026/01/14 17:13:34
permalink: /node/1jbhp0rf/
---

`fs` 是 Node.js 内置的文件系统模块，提供对 ==文件== 与 ==目录== 的创建、读取、写入、删除、监视等能力。异步 API 由 libuv 驱动，适合 I/O 密集场景。

> [!TIP]
> 服务端优先使用 Promise/回调版本，避免 `readFileSync` 等同步 API 阻塞事件循环。

## 使用方式

::: code-tabs
@tab ESM
```js
import * as fs from 'node:fs'
import { readFile } from 'node:fs/promises'
```

@tab CommonJS
```js
const fs = require('node:fs')
const { readFile } = require('node:fs/promises')
```
:::

> [!NOTE]
> 推荐使用 `node:` 前缀，能明确标识为 Node.js 内置模块。

## API 形态

`fs` 提供三套接口：==回调==、==Promise==、==同步==。名称上通常以 `Sync` 结尾表示同步版本。

::: details 选择建议
- 回调：历史代码兼容、需要与流/事件风格混用。
- Promise：现代写法，配合 `async/await` 可读性最佳。
- 同步：脚本启动阶段或 CLI 小工具里可用，服务端请求路径中慎用。
:::

## 读取与写入文件

::: code-tabs
@tab Promise
```js
import { readFile, writeFile, appendFile } from 'node:fs/promises'

const text = await readFile('note.txt', 'utf8')
await writeFile('copy.txt', text)
await appendFile('log.txt', `${Date.now()}\n`)
```

@tab Callback
```js
const fs = require('node:fs')

fs.readFile('note.txt', 'utf8', (err, text) => {
  if (err) throw err
  fs.writeFile('copy.txt', text, (writeErr) => {
    if (writeErr) throw writeErr
  })
})
```

@tab Sync
```js
import { readFileSync, writeFileSync } from 'node:fs'

const text = readFileSync('note.txt', 'utf8')
writeFileSync('copy.txt', text)
```
:::

::: tip
不传 `encoding` 时返回 `Buffer`；传入 `utf8` 等编码会直接返回字符串。
:::

::: warning
读取超大文件时不要用 `readFile`，请使用流式读取。
:::

## 目录操作

```js
import { mkdir, readdir, rm, rename } from 'node:fs/promises'

await mkdir('logs', { recursive: true })

const entries = await readdir('logs', { withFileTypes: true })
for (const entry of entries) {
  if (entry.isFile()) console.log(entry.name)
}

await rename('logs', 'archive')
await rm('archive', { recursive: true, force: true })
```

::: details 常用目录 API
- `mkdir`：创建目录（`recursive: true` 会级联创建）。
- `readdir`：读取目录项（`withFileTypes: true` 返回 `Dirent`）。
- `rm` / `rmdir`：删除目录（`rm` 可替代 `rmdir`）。
- `rename`：移动或重命名。
:::

## 文件信息与权限

```js
import { stat, lstat, access } from 'node:fs/promises'
import { constants } from 'node:fs'

const info = await stat('package.json')
console.log(info.isFile(), info.size, info.mtime)

await access('secret.txt', constants.R_OK)
```

> [!INFO]
> `stat` 会跟随软链接，`lstat` 返回链接本身的信息。

::: tip
`fs.constants` 中包含常用权限位：`R_OK`、`W_OK`、`X_OK` 等。
:::

## 文件描述符与 FileHandle

当需要 **随机读写** 或频繁操作同一文件时，先 `open` 再复用句柄更高效。

```js
import { open } from 'node:fs/promises'

const file = await open('data.bin', 'r')
try {
  const buffer = Buffer.alloc(16)
  await file.read(buffer, 0, 16, 0)
  console.log(buffer)
} finally {
  await file.close()
}
```

## 流式读写

```js
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

await pipeline(
  createReadStream('video.mp4'),
  createWriteStream('backup.mp4')
)
```

::: tip
`pipeline` 会自动处理背压并在出错时正确关闭流，优于手写 `pipe`。
:::

## 监视文件变化

```js
import { watch } from 'node:fs'

const watcher = watch('src', { recursive: true }, (eventType, filename) => {
  console.log(eventType, filename)
})

setTimeout(() => watcher.close(), 10_000)
```

::: warning
`fs.watch` 在不同平台的行为可能不一致；需要轮询方案时可用 `watchFile`。
:::

## 常见错误码

::: details 文件系统常见错误
- `ENOENT`：路径不存在。
- `EEXIST`：目标已存在（常见于 `mkdir`）。
- `EACCES` / `EPERM`：权限不足。
- `ENOTDIR` / `EISDIR`：期望文件却是目录，或相反。
:::

::: steps 处理错误的基本流程
1. 先判断路径是否存在或权限是否足够。
2. 需要覆盖时考虑 `force: true` 或先删除再写入。
3. 捕获异常并根据 `err.code` 做分支处理。
:::

## 小结

`fs` 覆盖了文件与目录操作的核心能力。日常开发中，==优先 Promise API==、==大文件用流==、==构建路径用 `path` 模块==，能显著提升可读性与稳定性。
