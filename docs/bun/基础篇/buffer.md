---
title: 二进制数据处理
createTime: 2026/02/14 10:24:00
permalink: /bun/j3o1v6by/
---

[+view]: 视图（View）是“观察/操作同一块内存的窗口”，通常不拷贝底层字节

> [!IMPORTANT]
> 二进制处理最容易混乱的不是 API 数量，而是“谁是内存本体、谁是视图、谁会拷贝”。

## 1. 先建立心智模型

:::table title="Buffer / ArrayBuffer / Uint8Array 的定位" full-width
| 对象 | 本质 | 适合做什么 |
| --- | --- | --- |
| `ArrayBuffer` | 原始连续内存块 | 只负责存字节，不关心解释方式 |
| `Uint8Array` | 8 位无符号整型视图 | 按字节读写，适合协议与文件头处理 |
| `Buffer` | Node 风格字节容器（Bun 兼容） | 在 `Uint8Array` 基础上提供更丰富二进制工具 |
:::

可以这样记：`ArrayBuffer` 是仓库本体，`Uint8Array/Buffer/DataView` 是不同的观察窗口[+view]。

## 2. 二进制三件套

### Buffer

`Buffer` 是 Bun/Node 生态里最常见的二进制对象，适合网络包、文件块、编码转换等场景。

```ts
const payload = Buffer.from('hello bun', 'utf8')
console.log(payload.length)
console.log(payload.toString('hex'))
```

:::table title="Buffer 常用方法" full-width align="left"
| 方法 | 返回值 | 用途 |
| --- | --- | --- |
| `Buffer.from(input)` | `Buffer` | 从字符串/数组/`ArrayBuffer` 创建 Buffer |
| `Buffer.alloc(size)` | `Buffer` | 创建并清零内存（更安全） |
| `Buffer.allocUnsafe(size)` | `Buffer` | 创建但不清零（更快，需自行完全写满） |
| `Buffer.concat(list)` | `Buffer` | 合并多个字节块 |
| `Buffer.byteLength(text, enc?)` | `number` | 计算文本占用字节数 |
| `buf.slice(start, end)` | `Buffer` | 返回共享内存视图（不拷贝） |
| `buf.subarray(start, end)` | `Buffer` | 返回共享内存视图（不拷贝） |
| `buf.copy(target, targetStart?, sourceStart?, sourceEnd?)` | `number` | 把当前字节复制到目标 Buffer |
| `buf.toString(enc?)` | `string` | 字节解码为字符串 |
:::

### ArrayBuffer

`ArrayBuffer` 只是一块内存，不提供“按类型读写”的语义。要解释内容，通常搭配 `DataView` 或 `TypedArray`。

```ts
const ab = new ArrayBuffer(8)
const view = new DataView(ab)

view.setUint16(0, 2026)        // 2 字节
view.setFloat32(2, 3.14, true) // 4 字节（小端）

console.log(view.getUint16(0))
console.log(view.getFloat32(2, true))
```

:::table title="ArrayBuffer / DataView 常用方法" full-width
| 对象 | 方法 | 返回值 | 用途 |
| --- | --- | --- | --- |
| `ab` | `ab.byteLength` | `number` | 查看总字节数 |
| `ab` | `ab.slice(start, end)` | `ArrayBuffer` | 拷贝区间字节，返回新内存 |
| `view` | `getUint8/getUint16/getFloat32` | `number` | 按协议读取数值 |
| `view` | `setUint8/setUint16/setFloat32` | `void` | 按偏移写入数值 |
:::

### Uint8Array

`Uint8Array` 是最常用的字节视图，元素范围固定 `0~255`，非常适合做按字节协议处理。

```ts
const u8 = new Uint8Array(6)
u8.set([0x48, 0x65, 0x6c, 0x6c, 0x6f], 0)

const shared = u8.subarray(0, 2) // 共享底层内存
const copied = u8.slice(0, 5)    // 拷贝出独立副本

console.log(shared)
console.log(new TextDecoder().decode(copied))
```

:::table title="Uint8Array 常用方法" full-width align="left"
| 方法 | 返回值 | 用途 |
| --- | --- | --- |
| `u8.length` | `number` | 当前视图元素数量 |
| `u8.set(source, offset?)` | `void` | 批量写入字节 |
| `u8.subarray(start, end)` | `Uint8Array` | 共享内存的新视图 |
| `u8.slice(start, end)` | `Uint8Array` | 拷贝区间，得到独立数据 |
:::

## 3. 转换、共享与拷贝

### 常见转换写法

:::table title="类型转换速查" full-width
| 目标 | 写法 |
| --- | --- |
| `ArrayBuffer -> Uint8Array` | `new Uint8Array(ab)` |
| `ArrayBuffer -> Buffer` | `Buffer.from(ab)` |
| `Buffer -> Uint8Array` | `new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)` |
| `Buffer -> ArrayBuffer` | `buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)` |
:::

### `slice` / `subarray` 的关键区别

:::table title="会不会拷贝" full-width
| 对象 | `subarray` | `slice` |
| --- | --- | --- |
| `Buffer` | 共享内存视图 | 共享内存视图（兼容语义） |
| `Uint8Array` | 共享内存视图 | 拷贝后独立数据 |
| `ArrayBuffer` | 无 | 拷贝后独立数据 |
:::

> [!NOTE]
> 如果你要“隔离数据、防止联动修改”，优先显式拷贝：`Buffer.from(source)` 或 `u8.slice(...)`。

## 4. 和 Bun I/O 一起使用

Bun 的文件、请求体、表单上传，本质都能回到字节处理。

:::table title="Bun 二进制 I/O 常用 API" full-width
| 对象 | 方法 | 返回值 | 典型场景 |
| --- | --- | --- | --- |
| `Bun.file(path)` | `file.arrayBuffer()` | `Promise<ArrayBuffer>` | 读取图片、压缩包 |
| `Bun.file(path)` | `file.bytes()` | `Promise<Uint8Array>` | 直接按字节处理 |
| `Request` | `request.arrayBuffer()` | `Promise<ArrayBuffer>` | 读取二进制请求体 |
| `Request` | `request.formData()` | `Promise<FormData>` | 文件上传表单 |
| `Bun.write(path, data)` | `Bun.write(...)` | `Promise<number>` | 写回 `Buffer/Uint8Array` |
:::

## 5. 协议编解码（完整示例）

这个示例演示“把对象编码成 Buffer 再解码回来”。  
不是加密，而是协议序列化：按字节布局把数据打包。

:::code-tabs
@tab packet.ts
```ts
export interface Packet {
  version: number
  message: string
}

export function encodePacket(packet: Packet): Buffer {
  // 1) 将消息体编码为 UTF-8 字节
  const payload = Buffer.from(packet.message, 'utf8')

  // 2) 总长度 = 版本(2字节) + 长度(2字节) + 消息体
  const out = Buffer.allocUnsafe(4 + payload.length)

  // 3) 写协议头（大端）
  out.writeUInt16BE(packet.version, 0)
  out.writeUInt16BE(payload.length, 2)

  // 4) 拷贝消息体到偏移 4 的位置
  payload.copy(out, 4)

  return out
}

export function decodePacket(input: Buffer): Packet {
  // 防御性校验：协议头至少 4 字节
  if (input.length < 4) {
    throw new Error('非法包：长度不足 4 字节')
  }

  const version = input.readUInt16BE(0)
  const payloadLength = input.readUInt16BE(2)

  // 防御性校验：声明长度必须与真实长度一致
  if (input.length !== payloadLength + 4) {
    throw new Error('非法包：长度字段不匹配')
  }

  const message = input.subarray(4).toString('utf8')
  return { version, message }
}
```

@tab demo.ts
```ts
import { decodePacket, encodePacket } from './packet'

const encoded = encodePacket({ version: 1, message: 'hello bun' })
const decoded = decodePacket(encoded)

console.log('编码结果(hex):', encoded.toString('hex'))
console.log('解码结果:', decoded)
```
:::

## 6. 最佳实践

- 先决定“要共享还是要拷贝”，再选 `subarray/slice/from`。
- 协议数据必须带长度校验，避免越界与脏数据。
- `allocUnsafe` 只在你会完整覆写内存时使用。
- 文件/网络入口优先转为统一字节模型，再进入业务层。

::::collapse
- :+ 二进制排错清单

  1. 先打印十六进制：`buf.toString('hex')`。
  2. 再核对偏移与字节序（LE/BE）。
  3. 最后确认是否发生“共享内存联动修改”。
::::
