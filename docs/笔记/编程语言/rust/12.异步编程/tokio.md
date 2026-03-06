---
title: tokio
createTime: 2025/12/09 17:12:18
permalink: /rust/5x9cw82i/
---

Tokio 是 Rust 社区最常用的异步运行时，提供多线程任务调度、计时器、网络 IO 等能力，让 `async/await` 能够高效跑在多核上。它背后的核心理念是用轻量级任务（绿色线程）在有限的系统线程上调度，从而在低开销下获得高并发。

## 系统线程 vs 绿色线程

- 系统线程（OS thread）：由内核调度，切换和创建成本高，但能直接利用多核并执行阻塞操作。
- 绿色线程（green thread）：由用户态运行时调度，切换开销小，可大量创建；一旦执行阻塞操作会卡住所在的系统线程。
- Tokio 的任务就是绿色线程：大量任务被分配到一组系统线程上协作运行，需要阻塞时使用 `spawn_blocking` 或异步 API 避免卡住调度。

## Runtime 模式：单线程 vs 多线程

- 宏方式：
  - 多线程（默认）：`#[tokio::main]` 或 `#[tokio::main(flavor = "multi_thread", worker_threads = 4)]`。
  - 单线程：`#[tokio::main(flavor = "current_thread")]`，事件循环在一个系统线程上，适合 IO 密集但少量 CPU 场景。
- Builder 方式（可完全自定义）：

```rust
use tokio::runtime;

fn main() -> anyhow::Result<()> {
    // 单线程 runtime
    let rt = runtime::Builder::new_current_thread()
        .enable_all() // 开启 IO/时间驱动
        .build()?;

    rt.block_on(async {
        // 这里是异步世界
        hi().await;
    });

    // 多线程 runtime
    let rt_multi = runtime::Builder::new_multi_thread()
        .worker_threads(8)
        .max_blocking_threads(256)
        .thread_stack_size(5 * 1024 * 1024)
        .enable_all()
        .build()?;

    rt_multi.block_on(async {
        tokio::spawn(run());
    });

    Ok(())
}
```

### Builder 配置项说明

- `new_current_thread()`：创建单线程 runtime，事件循环在一个系统线程上。
- `new_multi_thread()`：创建多线程 runtime（默认 worker 线程数为 CPU 核心数）。
- `worker_threads(n)`：设置 worker 线程数量，决定可并行执行任务的系统线程数。
- `max_blocking_threads(n)`：阻塞线程池的最大线程数，供 `spawn_blocking` 使用，防止阻塞任务无限膨胀。
- `thread_stack_size(bytes)`：设置每个 worker 的栈大小，调大可避免深度递归栈溢出，但会增加内存占用。
- `event_interval(n)`：多少次任务轮转后检查一次定时器/IO 事件，数值大减少调度开销、可能增大延迟，数值小相反（默认 61）。
- `enable_all()`：启用 IO、时间驱动等所有 runtime 组件。
- `build()`：构建 runtime，返回 `Runtime` 对象。
- `block_on(fut)`：在当前线程同步阻塞，直到给定 Future 完成，用来“进入”异步世界。

## 常用任务 API

### tokio::spawn：在后台启动异步任务

```rust
let handle: tokio::task::JoinHandle<()> = tokio::spawn(async {
    hi().await;
});
// 等待任务完成
handle.await?;
```

### tokio::task::spawn_blocking：把阻塞工作丢到专门的阻塞线程池

```rust
let res = tokio::task::spawn_blocking(|| {
    std::thread::sleep(std::time::Duration::from_secs(1));
    42
}).await?;
```

### tokio::task::yield_now：主动让出调度权

```rust
tokio::task::yield_now().await;
```

### JoinSet：批量管理任务

```rust
let mut set = tokio::task::JoinSet::new();
for i in 0..5 {
    set.spawn(add(i, 2));
}
while let Some(res) = set.join_next().await {
    println!("got {:?}", res?);
}
```

## 并发组合器

### tokio::join!：等全部 Future 完成

```rust
let (a, b) = tokio::join!(add(1, 2), add(3, 4));
```

### tokio::select!：谁先完成先处理

```rust
tokio::select! {
    _ = hi() => println!("hi done"),
    _ = tokio::time::sleep(std::time::Duration::from_secs(1)) => println!("timeout"),
}
```

## 计时器与超时

```rust
use tokio::time::{sleep, timeout, Duration, interval};

sleep(Duration::from_millis(200)).await;

let v = timeout(Duration::from_secs(1), hi()).await; // 超时返回 Err

let mut ticker = interval(Duration::from_secs(5));
loop {
    ticker.tick().await;
    println!("tick");
}
```

## 通道（简略）

- `tokio::sync::mpsc`：多生产者单消费者队列，适合任务间消息传递。
- `tokio::sync::oneshot`：一次性单值传递。
- `tokio::sync::broadcast`：广播给多个接收者。
- `tokio::sync::Mutex/RwLock`：异步锁，避免在异步上下文使用阻塞锁。

## hi：最简单的异步函数

```rust
async fn hi() {
    println!("Hello, world!");
}
```

使用方式：在任何异步上下文 `hi().await` 即可，也可以 `tokio::spawn(hi())` 让它在后台任务中打印。

## run：异步循环打印

```rust
async fn run() {
    for i in 0..10 {
        println!("hi {}", i);
    }
}
```

使用方式：`tokio::spawn(run())` 可以并发启动打印 0~9；若想等它结束，可对 JoinHandle `await`，或用 `tokio::join!` 同时等待多个任务。

## run_yield：主动让出调度权

```rust
async fn run_yield() {
    for i in 1..=10 {
        println!("Yield {}", i);
        tokio::task::yield_now().await;
    }
}
```

使用方式：`yield_now().await` 会让当前任务主动挂起，把执行权交回调度器，演示 Tokio 的协作式调度。启动多个 `run_yield`（例如用 `tokio::spawn`）可观察输出交替出现。

## add：异步计算的基本单元

```rust
async fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

使用方式：适合与 `tokio::join!` 并发执行，例如 `tokio::join!(add(1, 2), add(3, 4))` 同时计算并返回 `(3, 7)`；也可配合 `JoinSet` 批量并发计算并逐个收集结果。

## main：Tokio 入口与并发示例

```rust
#[tokio::main]
async fn main() {
    // let rt = runtime::Builder::new_multi_thread()
    //     .worker_threads(10)
    //     .thread_stack_size(5 * 1024 * 1024)
    //     .event_interval(20)
    //     .max_blocking_threads(256)
    //     .enable_all()
    //     .build()?;

    // tokio::spawn(run());
    // hi().await;

    // let res = tokio::join!(add(1, 2), add(3, 4));
    // println!("{:#?}", res);

    // let mut set = tokio::task::JoinSet::new();
    // for i in 0..10 {
    //     set.spawn(add(i, 2));
    // }
    // while let Some(res) = set.join_next().await {
    //     if let Ok(value) = res {
    //         println!("{:?}", value);
    //     }
    // }

    let _ = tokio::join!(
        tokio::spawn(hi()),
        tokio::spawn(run_yield()),
        tokio::spawn(run_yield()),
    );
}
```

- 入口：`#[tokio::main]` 宏自动创建多线程 runtime 并作为程序入口。
- 自定义 runtime：若需控制线程数、栈大小等，取消注释 `runtime::Builder` 片段即可定制。
- 任务启动：`tokio::spawn` 启动后台任务；示例里并行启动一个 `hi` 和两个 `run_yield`。
- 并发等待：`tokio::join!` 同时等待多个 `Future`；需要逐个收集结果时可用 `JoinSet`（示例代码已给出注释版用法）。
