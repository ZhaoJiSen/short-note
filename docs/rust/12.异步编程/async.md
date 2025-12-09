---
title: 基本使用
createTime: 2025/09/26 16:20:58
permalink: /rust/yxgj4re7/
---

## Future

Future 表示一个 "现在可能还没准备好、未来某时会就绪的值"。Rust 以 `Future` trait 为核心，各类异步操作通过实现它来暴露可被轮询的状态

> [!NOTE]
> 异步操作会实现 `Future` trait，其内部的 `poll` 方法会返回 `Poll::Pending` 或 `Poll::Ready<T>` 两种状态。执行器会不断轮询调用 `poll`
> - 如果 Future 完成了，那么将返回 `Poll::Ready(result)` 其中 `result` 为最终的结果
> - 如果 Future 未完成，那么将返回 `Poll::Pending`，此时会保存本次 `Context` 中的 `waker`，**然后在可继续推进时调用 `waker.wake()` 并通知执行器再次 `poll`**

:::code-tabs
@tab socket.rs
```rust
pub struct Socket {
    pub has_data: bool,
    pub buffer: Vec<u8>,
    pub waker: Option<fn()>,
}

pub struct SocketRead {
    pub socket: Socket,
}

impl Socket {
    pub fn new(buffer: Vec<u8>) -> Self {
        Self {
            has_data: false,
            buffer,
            waker: None,
        }
    }

    pub fn has_data(&self) -> bool {
        self.has_data
    }

    pub fn read(&mut self) -> Vec<u8> {
        self.has_data = false;
        self.buffer.clone()
    }

    pub fn set_waker(&mut self, waker: fn()) {
        self.waker = Some(waker);
    }

    pub fn on_data_ready(&mut self) {
        self.has_data = true;
        if let Some(w) = self.waker.take() {
            w(); // 通知执行器可以再 poll
        }
    }
}

impl SocketRead {
    pub fn new(socket: Socket) -> Self {
        Self { socket }
    }
}

```

@tab main.rs
```rust
mod socket;

use socket::{Socket, SocketRead};

#[derive(Debug)]
enum Poll<T> {
    Pending,
    Ready(T),
}

trait SimpleFuture {
    type Output;
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output>;
}

impl SimpleFuture for SocketRead {
    type Output = Vec<u8>;

    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        if self.socket.has_data() {
            Poll::Ready(self.socket.read())
        } else {
            self.socket.set_waker(wake);
            Poll::Pending
        }
    }
}

fn simple_wake() {
    println!("waker called -> ready to poll again");
}

fn main() {
    let mut future = SocketRead::new(Socket::new(b"hello".to_vec()));

    match future.poll(simple_wake) {
        Poll::Ready(data) => println!("immediately got: {:?}", data),
        Poll::Pending => {
            println!("pending, simulate data arrival");
            future.socket.on_data_ready();

            match future.poll(simple_wake) {
                Poll::Ready(data) => println!("after wake got: {:?}", data),
                Poll::Pending => println!("still pending"),
            }
        }
    }
}
```
:::

### Waker 

Waker 由 ==执行器== 通过 `Context` 传递给 Future，当 Future 返回 `Pending` 时会保存本次 `poll` 提供的最新的 `waker`，等到后续事件就绪时调用 `wake()` 让任务重新入队

> [!IMPORTANT]
> - 一次或多次调用 `wake` 都是安全的，漏掉唤醒则会让 Future 永远停留在 `Pending`
> - `wake` 可以跨线程调用，只保证“尽快”重新调度
> - Waker 实现了 `clone` 可以复制和存储，除此之外还可以使用 `wake_by_ref` 在只有引用时唤醒，避免 clone


实现一个计时器 Future

:::code-tabs 
@tab timer_calc.rs
```rust
use std::{
    future::Future,
    pin::Pin,
    sync::{Arc, Mutex},
    task::{Context, Poll, Waker},
    thread,
    time::Duration,
};

#[derive(Default)]
pub struct SharedState {
    completed: bool,
    waker: Option<Waker>,
}

pub struct TimerFuture {
    shared_state: Arc<Mutex<SharedState>>,
}

impl TimerFuture {
    pub fn new(duration: Duration) -> Self {
        let shared_state = Arc::new(Mutex::new(SharedState::default()));
        let thread_state = shared_state.clone();

        thread::spawn(move || {
            thread::sleep(duration);
            let mut state = thread_state.lock().unwrap();
            state.completed = true;

            // 计时结束后唤醒任务；提前 take 掉避免持锁唤醒
            if let Some(w) = state.waker.take() {
                w.wake();
            }
        });

        Self { shared_state }
    }
}

impl Future for TimerFuture {
    type Output = ();

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        let mut state = self.shared_state.lock().unwrap();

        if state.completed {
            Poll::Ready(())
        } else {
            // 任务可能在不同执行器/线程间移动，因此需保存本次 poll 的最新 waker
            // 使用 will_wake 避免不必要的 clone
            let should_update = state
                .waker
                .as_ref()
                .map_or(true, |w| !w.will_wake(cx.waker()));
            if should_update {
                state.waker = Some(cx.waker().clone());
            }
            Poll::Pending
        }
    }
}
```

@tab main.rs 
```rust
#[tokio::main]
async fn main() {
    TimerFuture::new(Duration::from_secs(1)).await;
    println!("timer done");
}
```
:::

### Executor

## async

## await
