---
title: 二进制数据处理
createTime: 2026/02/14 10:24:00
permalink: /bun/j3o1v6by/
---

## 核心对象

### Buffer

Buffer 可以理解为一段 ==固定长度== 的字节内存，用来承载二进制数据。在 Bun 里，文件内容、网络请求体、图片/音视频、压缩包这些 "看起来不同" 的数据，本质上都可以归结为字节序列（bytes）

:::code-tabs
@tab 读取文件为 Buffer
```ts
const file = Bun.file('./avatar.png')
const buffer = Buffer.from(await file.arrayBuffer())

console.log('bytes:', buffer.length)
console.log('header:', buffer.subarray(0, 8).toString('hex'))
```

@tab 写入 Buffer 到文件
```ts
const buffer = Buffer.from([0x48, 0x69, 0x21]) // Hi!
await Bun.write('./hi.bin', buffer)
```
:::

::::collapse
- Buffer 相关方法

  :::table full-width align="left"
  | 方法                              | 返回值   | 常见用途                                    |
  | --------------------------------- | -------- | ------------------------------------------- |
  | `Buffer.from(...)`                | `Buffer` | 从字符串/字节数组/`ArrayBuffer` 创建 Buffer |
  | `Buffer.alloc(size)`              | `Buffer` | 创建指定大小并初始化为 `0` 的缓冲区         |
  | `Buffer.allocUnsafe(size)`        | `Buffer` | 创建指定大小但不清零的缓冲区                |
  | `Buffer.concat(list)`             | `Buffer` | 合并多个字节块                              |
  | `Buffer.byteLength(text, 'utf8')` | `number` | 获取字符串的字节长度                        |
  | `buf.slice(start, end)`           | `Buffer` | 按区间截取字节（兼容写法）                  |
  | `buf.subarray(start, end)`        | `Buffer` | 按区间读取字节                              |
  | `buf.toString('utf8')`            | `string` | 字节转文本                                  |
  | `buf.copy(target, targetStart?, sourceStart?, sourceEnd?)` | `number` | 将当前 Buffer 的字节复制到目标 Buffer |
  :::

- Bun I/O 相关方法

  :::table full-width
  | 对象      | 方法                    | 返回值                 | 用途                                     |
  | --------- | ----------------------- | ---------------------- | ---------------------------------------- |
  | `Bun`     | `Bun.file(path)`        | `BunFile`              | 创建文件句柄，惰性对象，不会立刻读入内存 |
  | `Bun`     | `Bun.write(path, data)` | `Promise<number>`      | 写入 `Buffer`/文本到文件，返回写入字节数 |
  | `BunFile` | `file.arrayBuffer()`    | `Promise<ArrayBuffer>` | 读取二进制文件内容                       |
  | `Request` | `request.formData()`    | `Promise<FormData>`    | 解析上传表单                             |
  :::
  
::::

### Uint8Array

`Uint8Array` 是最常用的字节视图，元素范围固定为 `0~255`。适用于 "按字节读写" ，例如协议解析、二进制拼包、文件头判断等

```ts
const u8 = new Uint8Array(6)

// 按偏移批量写入
u8.set([0x48, 0x65, 0x6c, 0x6c, 0x6f], 0)

// 读取局部视图（共享内存）
const head = u8.subarray(0, 2)
console.log(head) // Uint8Array(2) [72, 101]

// 拷贝片段（独立数据）
const copied = u8.slice(0, 5)
console.log(new TextDecoder().decode(copied)) // Hello
```

::::collapse
- Uint8Array 相关方法

  :::table full-width  align="left"
  | 方法 | 返回值 | 常见用途 |
  | --- | --- | --- |
  | `u8.length` | `number` | 查看当前视图长度（元素个数） |
  | `u8.set(source, offset?)` | `void` | 批量写入字节到当前视图 |
  | `u8.subarray(start, end)` | `Uint8Array` | 创建共享内存的新视图（不拷贝） |
  | `u8.slice(start, end)` | `Uint8Array` | 拷贝区间数据，得到独立数组 |
  :::

::::



### ArrayBuffer

`ArrayBuffer` 是一块原始的连续内存区域，本身只负责 "存字节"，不负责解释这些字节的含义。若要把它当成数字、字符串或结构化字段来读写，则需要搭配 `TypedArray` 或 `DataView`

```ts
// 申请 8 字节内存
const ab = new ArrayBuffer(8)
const view = new DataView(ab)

// 写入数据（默认大端；第三个参数可控制小端）
view.setUint16(0, 2026)        // 2 字节
view.setFloat32(2, 3.14, true) // 4 字节，小端

// 读取数据
console.log(view.getUint16(0))         // 2026
console.log(view.getFloat32(2, true))  // 3.14
```

::::collapse

- ArrayBuffer / DataView 常用方法

  :::table title="" full-width
  | 对象实例 | 可调用属性/方法 | 返回值 | 常见用途 |
  | --- | --- | --- | --- |
  | `ab` | `ab.byteLength` | `number` | 查看底层内存总字节数 |
  | `ab` | `ab.slice(start, end)` | `ArrayBuffer` | 拷贝指定区间内存，得到新 `ArrayBuffer` |
  | `view` | `view.getUint8/getUint16/getFloat32(...)` | `number` | 按协议读取不同类型数值 |
  | `view` | `view.setUint8/setUint16/setFloat32(...)` | `void` | 按偏移写入不同类型数值 |
  :::

::::

## 转换

[+视图]: 
  同一块底层数据的一个观察/操作窗口，视图通常不复制数据，只是引用同一块内存
  <br />
  <br />
  放到二进制里
  - `ArrayBuffer`：仓库本体（只是一块内存）
  - `Uint8Array` / `Buffer`/ `DataView`：看这个仓库的不同 "窗口"（视图）

`Buffer`，其底层基于 `Uint8Array`，而 `Buffer/Uint8Array` 通常又是基于 `ArrayBuffer` 的视图[+视图]

:::table full-width
| 对象          | 本质              | 能力侧重点                                    |
| ------------- | ----------------- | --------------------------------------------- |
| `ArrayBuffer` | 原始内存块        | 只负责 "存字节"，不关心字节含义，不带操作能力 |
| `Uint8Array`  | 字节视图（0~255） | 以数组方式访问字节，可读可写                  |
| `Buffer`      | Node 风格字节容器 | 二进制工具方法更丰富（编码、读写数值、拼接）  |
:::

::::details  常见的转换方式

:::table maxContent
| 目标                        | 写法                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `ArrayBuffer -> Uint8Array` | `new Uint8Array(ab)`                                                |
| `ArrayBuffer -> Buffer`     | `Buffer.from(ab)`                                                   |
| `Buffer -> Uint8Array`      | `new Uint8Array(buf)`                                               |
| `Buffer -> ArrayBuffer`     | `buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)` |
:::

::::

```ts
// ArrayBuffer -> Uint8Array / Buffer
const ab = new ArrayBuffer(4)
const u8 = new Uint8Array(ab)
u8.set([1, 2, 3, 4])

const buf = Buffer.from(ab)
console.log(buf) // <Buffer 01 02 03 04>

// Buffer -> Uint8Array
const u8FromBuf = new Uint8Array(buf)
console.log(u8FromBuf) // Uint8Array(4) [1, 2, 3, 4]

// Buffer -> ArrayBuffer（精确切片，避免把无关字节带出来）
const abFromBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
console.log(new Uint8Array(abFromBuf)) // Uint8Array(4) [1, 2, 3, 4]
```

> [!IMPORTANT]
> - 需要独立副本时，优先用 `Buffer.from(source)` 或 `Uint8Array.from(source)` 做拷贝
> - `new Uint8Array(buffer)` 通常共享 `ArrayBuffer` 的底层内存
> - `Buffer` 方法：`buf.subarray(...)` 与 `buf.slice(...)` 通常都是共享底层内存的视图
> - `Uint8Array` 方法：`u8.subarray(...)` 通常是共享视图
> - `Uint8Array` 方法：`u8.slice(...)` 会拷贝数据，得到独立副本
> - `Buffer -> ArrayBuffer` 建议按 `byteOffset + byteLength` 做精确切片，避免越界或脏数据

## 二进制协议编解码案例

整段代码其实是将对象 "序列化成二进制包" 按约定格式编码成 Buffer，方便网络传输或文件存储，接收端再按同样规则解码回来

:::code-tabs
@tab packet.ts
```ts
export interface Packet {
  version: number;
  message: string;
}

export function encodePacket(packet: Packet): Buffer {
  // 消息体转字节
  const payload = Buffer.from(packet.message, 'utf8');

  // 总长度 = 版本(2) + 长度(2) + 消息体
  // 版本(2) + 长度(2) 是协议头里固定占用的字节
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
```

@tab demo.ts
```ts
import { decodePacket, encodePacket } from './packet';

const encoded = encodePacket({ version: 1, message: 'hello bun' });
const decoded = decodePacket(encoded);

console.log('编码结果(hex):', encoded.toString('hex'));
console.log('解码结果:', decoded);
```
:::
