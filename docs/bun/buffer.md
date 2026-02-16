---
title: Buffer
createTime: 2026/02/14 10:24:00
permalink: /node/bun/buffer/
---

## 基础篇

### Buffer 在 Bun 中的角色

Bun 兼容 Node 的 `Buffer`，底层仍基于 `Uint8Array`，适合做网络包、文件块、加密前后的字节处理。

:::table title="常见二进制类型" full-width
| 类型 | 适用场景 | 备注 |
| --- | --- | --- |
| `Buffer` | Node 生态兼容、二进制协议 | API 丰富 |
| `Uint8Array` | Web 标准接口、跨端 | 语义更通用 |
| `ArrayBuffer` | 纯内存块 | 常作为底层容器 |
:::

### 字符串与字节互转

- 文本编码用 `Buffer.from(text, 'utf8')`
- 文本解码用 `buffer.toString('utf8')`
- Base64 编解码可直接使用 `Buffer`

## 进阶篇

:::details 二进制处理中的关键原则
- 协议解析时先校验长度，再读取字段
- 明确字节序（小端/大端），避免跨平台歧义
- 使用切片时关注是否共享底层内存
:::

`Buffer.slice` 返回的通常是共享视图，修改子切片可能影响原缓冲区[+共享内存]。

[+共享内存]: 当你需要独立副本时，请使用 `Buffer.from(slice)` 重新拷贝。

## 完整代码示例

下面示例实现一个最小二进制协议编码/解码：

- 前 2 字节：版本号（`UInt16BE`）
- 接着 2 字节：消息长度
- 剩余内容：UTF-8 消息体

```ts
interface Packet {
  version: number;
  message: string;
}

export function encodePacket(packet: Packet): Buffer {
  // 消息体转字节
  const payload = Buffer.from(packet.message, 'utf8');

  // 总长度 = 版本(2) + 长度(2) + 消息体
  const out = Buffer.allocUnsafe(4 + payload.length);

  // 写入头部字段
  out.writeUInt16BE(packet.version, 0);
  out.writeUInt16BE(payload.length, 2);

  // 拷贝消息体
  payload.copy(out, 4);
  return out;
}

export function decodePacket(input: Buffer): Packet {
  // 基础长度校验，避免越界读取
  if (input.length < 4) {
    throw new Error('非法包：长度不足 4 字节');
  }

  const version = input.readUInt16BE(0);
  const payloadLength = input.readUInt16BE(2);

  // 确保声明长度与真实长度一致
  if (input.length !== payloadLength + 4) {
    throw new Error('非法包：长度字段不匹配');
  }

  const message = input.subarray(4).toString('utf8');
  return { version, message };
}

// 演示
const encoded = encodePacket({ version: 1, message: 'hello bun' });
const decoded = decodePacket(encoded);
console.log('解码结果:', decoded);
```

## 最佳实践

- 对每个二进制协议写“编码-解码对照测试”。
- 所有读取前都先做长度与边界校验。
- 日志中输出 `buffer.length` 与十六进制片段，便于排查线上问题。
- 统一在协议文档里声明字节序和版本策略。

## 常见错误

- 直接读取固定偏移，未校验长度导致运行时异常。
- 忘记区分 `utf8` 与 `base64`，出现乱码。
- 把 `slice` 当深拷贝使用，触发难定位的共享内存问题。

*[UTF-8]: 一种可变长度字符编码，兼容 ASCII

