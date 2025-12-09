---
title: async 与 await
createTime: 2025/09/26 16:20:58
permalink: /rust/yxgj4re7/
---

## Future

Future 表示一个 "现在可能还没准备好、未来某时会就绪的值"。Rust 以 `Future` trait 为核心，不同异步操作都实现这个 trait 来暴露自己的进度

> [!IMPORTANT]
> 使用 `async fn` 或 `async {}` 会生成一个实现 `Future<Output = T>` 的状态机，交给执行器轮询 `poll` 直到返回 `Poll::Ready(T)`


我们必须显式地 await 这两个 futures，因为 Rust 中的 futures 是 惰性（lazy）的：在你使用 await 请求之前它们不会执行任何操作
