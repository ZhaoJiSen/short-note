---
title: 文件处理
createTime: 2026/02/14 10:25:00
permalink: /node/bun/files/
---

## 基础篇

### Bun 文件 API 全景

Bun 在文件 I/O 上提供了高频 API：`Bun.file`、`Bun.write`、`Bun.spawn`（配合外部命令）、流式读写。

:::table title="文件 API 速查" full-width
| API | 作用 | 典型用法 |
| --- | --- | --- |
| `Bun.file(path)` | 创建文件对象 | `await Bun.file('a.txt').text()` |
| `Bun.write(path, data)` | 写入内容 | 写日志、生成构建产物 |
| `file.stream()` | 流式读取 | 处理大文件 |
| `file.arrayBuffer()` | 读二进制 | 图片、压缩包、协议数据 |
:::

### 读取策略

- 小文本：`text()`
- JSON：`json()`
- 二进制：`arrayBuffer()` / `bytes()`
- 大文件：优先流式处理，避免一次性占用过高内存

## 进阶篇

:::collapse
- :+ 原子写入思路

  先写临时文件，再 rename 替换目标文件，可降低写入中断导致脏文件的风险。

- 文件路径安全

  对外部输入路径做规范化和白名单校验，避免目录穿越。

- 大文件处理

  尽量分块处理 + 背压控制，不要把多 GB 文件整体读入内存。
:::

## 完整代码示例

示例实现一个“文本文件摘要器”：统计行数、字数，计算 SHA-256 并输出 `report.json`。

```ts
interface FileReport {
  file: string;
  lines: number;
  words: number;
  sha256: string;
}

async function buildReport(path: string): Promise<FileReport> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    throw new Error(`文件不存在: ${path}`);
  }

  // 读取文本并统计
  const text = await file.text();
  const lines = text === '' ? 0 : text.split(/\r?\n/).length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // 计算哈希（适合用于变更检测）
  const hasher = new Bun.CryptoHasher('sha256');
  hasher.update(text);

  return {
    file: path,
    lines,
    words,
    sha256: hasher.digest('hex'),
  };
}

async function main() {
  const [, , input = './README.md'] = Bun.argv;

  const report = await buildReport(input);

  // 输出到终端
  console.log(report);

  // 同时写入文件，便于 CI 或后续处理
  await Bun.write('./report.json', JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error('处理失败:', error);
  process.exit(1);
});
```

## 最佳实践

- 读写前先检查文件是否存在，报错信息携带完整路径。
- 明确文本编码，避免跨平台乱码。
- 对大文件使用流，避免 OOM。
- 产物文件（如 report）固定格式，便于自动化消费。

## 常见错误

- 直接 `json()` 解析未知内容，异常捕获不完整。
- 多处重复读写同一文件，未做并发控制。
- 忽略异常分支，导致 CI 里 silent fail。

