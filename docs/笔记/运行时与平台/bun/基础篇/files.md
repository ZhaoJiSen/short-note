---
title: 文件处理
createTime: 2026/02/14 10:25:00
permalink: /bun/kwuel2pb/
---

> [!IMPORTANT]
> Bun 的文件 API 设计偏向“高频操作直达”：先拿 `BunFile` 句柄，再按目标选择 `text/json/arrayBuffer/stream`。

## 1. 文件 API 总览

:::table title="Bun 文件 API 速查" full-width
| API | 返回值 | 用途 |
| --- | --- | --- |
| `Bun.file(path)` | `BunFile` | 创建文件句柄（惰性，不会立即读取） |
| `file.text()` | `Promise<string>` | 读取文本 |
| `file.json()` | `Promise<unknown>` | 读取并解析 JSON |
| `file.arrayBuffer()` | `Promise<ArrayBuffer>` | 读取二进制 |
| `file.bytes()` | `Promise<Uint8Array>` | 按字节读取 |
| `file.stream()` | `ReadableStream` | 流式读取大文件 |
| `Bun.write(path, data)` | `Promise<number>` | 写入文本/字节，返回写入字节数 |
:::

## 2. 读取策略（按数据形态选）

:::code-tabs
@tab 文本 / JSON
```ts
const readme = Bun.file('./README.md')
const text = await readme.text()

const configFile = Bun.file('./config.json')
const config = await configFile.json() as { port: number }

console.log(text.length)
console.log(config.port)
```

@tab 二进制
```ts
const image = Bun.file('./avatar.png')
const bytes = await image.bytes()

// 判断 PNG 文件头（89 50 4E 47）
const isPNG =
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47

console.log('is png:', isPNG)
```
:::

:::details 大文件建议
- 小文件：`text()` / `json()` 最直接。
- 大文件：优先 `stream()`，避免一次性拉满内存。
- 未知数据来源：先按字节读取，再决定解码方式。
:::

## 3. 写入策略（稳定性优先）

`Bun.write` 很直接，但生产场景建议加“原子写入”策略：先写临时文件，再 `rename` 覆盖。

```ts
import { rename } from 'node:fs/promises'

async function writeAtomic(targetPath: string, content: string | Uint8Array | Buffer) {
  const tmpPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`

  // 1) 先写临时文件
  await Bun.write(tmpPath, content)

  // 2) 再原子替换目标文件
  await rename(tmpPath, targetPath)
}
```

## 4. 完整示例：文档目录索引器

目标：扫描目录里的 `*.md`，输出 `report.json`，包含大小、行数、摘要哈希。  
这个例子覆盖了文件存在性检查、批量读取、哈希计算、原子写入。

:::code-tabs
@tab scripts/build-report.ts
```ts
import { readdir, stat, rename } from 'node:fs/promises'
import { join, relative } from 'node:path'

interface FileReport {
  file: string
  bytes: number
  lines: number
  sha256: string
}

async function walk(dir: string): Promise<string[]> {
  const result: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) {
      result.push(...(await walk(abs)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(abs)
    }
  }

  return result
}

async function buildOne(filePath: string, root: string): Promise<FileReport> {
  const file = Bun.file(filePath)
  if (!(await file.exists())) {
    throw new Error(`文件不存在: ${filePath}`)
  }

  const [text, fileStat] = await Promise.all([
    file.text(),
    stat(filePath)
  ])

  const lines = text === '' ? 0 : text.split(/\r?\n/).length

  const hasher = new Bun.CryptoHasher('sha256')
  hasher.update(text)

  return {
    file: relative(root, filePath),
    bytes: fileStat.size,
    lines,
    sha256: hasher.digest('hex')
  }
}

async function writeAtomic(path: string, content: string) {
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`
  await Bun.write(tmp, content)
  await rename(tmp, path)
}

async function main() {
  const root = process.cwd()
  const targetDir = Bun.argv[2] ?? './docs'
  const outFile = Bun.argv[3] ?? './report.json'

  const files = await walk(targetDir)
  const reports = await Promise.all(files.map((f) => buildOne(f, root)))

  // 统一排序，确保结果稳定可比较
  reports.sort((a, b) => a.file.localeCompare(b.file))

  await writeAtomic(outFile, JSON.stringify(reports, null, 2))
  console.log(`done: ${reports.length} files -> ${outFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

@tab 运行
```bash
bun run scripts/build-report.ts ./docs ./report.json
```
:::

## 5. 最佳实践

- 读取前先判定“文本/二进制/大文件”类型，再选 API。
- 外部输入路径必须做白名单或根目录约束，避免目录穿越。
- 产物文件统一 JSON 格式与排序规则，便于 CI 比对。
- 写关键文件时使用原子写入，减少中断导致的脏数据。

::::collapse
- :+ 文件 I/O 稳定性清单

  1. 所有读写都要有错误处理和可定位日志。
  2. 大文件不要 `text()` 一次读完。
  3. 写入结果检查返回字节数是否符合预期。
::::
