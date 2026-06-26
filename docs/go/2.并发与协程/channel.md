---
title: channel
createTime: 2026/01/18 20:55:10
permalink: /go/gfaf8k44/
---

`channel` 是 `goroutine` 之间的通信管道，用于传递数据和同步。它是 Go 并发哲学的落地：不要通过共享内存来通信，而要通过通信来共享内存（Don't communicate by sharing memory; share memory by communicating.）

`channel` 是有类型的：`chan int` 只能传 `int`，`chan string` 只能传 `string`

## 基本使用

`channel` 是引用类型，用 `make` 创建

```go
ch := make(chan int)        // 无缓冲 channel
ch := make(chan int, 3)     // 有缓冲 channel，容量 3
```

缓冲指的是 channel 内部可以存放的元素个数。无缓冲 channel 的容量为 0，发送方必须等待接收方接收数据后才能继续发送；有缓冲 channel 的容量大于 0，发送方可以在缓冲区未满时继续发送数据

三个基本操作：

```go
ch <- v          // 发送：把 v 送进 channel
v := <-ch        // 接收：从 channel 取出，赋给 v
close(ch)        // 关闭 channel
```

:::go-repl title="示例"

```go
package main

import "fmt"

func main() {
    ch := make(chan string)

    go func() {
        ch <- "hello from goroutine"
    }()

    msg := <- ch
    fmt.Println(msg)
}

```

:::

## 核心特性

### 同步交接

同步交接指的是无缓冲 `channel`，==发送和接收必须同时就绪，否则先到的一方阻塞等待对方==

:::go-repl title="同步交接"

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan int)

    go func() {
        fmt.Println("goroutine: 准备发送")
        ch <- 42    // 阻塞，直到 main 来接收
        fmt.Println("goroutine: 发送完成")
    }()

    time.Sleep(time.Second)  // 让 main 晚点接收
    fmt.Println("main: 准备接收")

    v := <- ch
    fmt.Println("main: 接收完成，值为", v)
}

```

:::

> goroutine 会卡在 "准备发送" 后面整整 1 秒，直到 main 接收，"发送完成" 才打印。无缓冲 channel 的发送 = 一次同步点（握手）

### 异步缓冲

异步缓冲指的是有缓冲的 `channel`，==发送和接收不必同时就绪，缓冲没满，发送不阻塞；缓冲非空，接收不阻塞==

:::go-repl title="异步缓冲"

```go
package main

import "fmt"

func main() {
    ch := make(chan int, 2)

    ch <- 1
    ch <- 2
    // ch <- 3 // 若放开这行，缓冲满了，这里会死锁阻塞

    fmt.Println(<-ch) // 1
    fmt.Println(<-ch) // 2
}
```

:::

### 关闭与 ok 检测

`close` 表示发送方不再发送数据了，接收方可以用第二个返回值判断 `channel` 是否已关闭且取空：

:::go-repl title="示例"

```go
package main

import "fmt"

func main() {
    ch := make(chan int, 2)
    ch <- 10
    ch <- 20
    close(ch)

    v, ok := <-ch
    fmt.Println(v, ok) // 10 true
    v, ok = <-ch
    fmt.Println(v, ok) // 20 true
    v, ok = <-ch
    fmt.Println(v, ok) // 0 false  ← 已关闭且取空，返回零值 + false
}
```

:::

> [!IMPORTANT]
>
> - 关闭后仍能接收已缓冲的值；取空后再收得到 `零值 + ok=false`
> - 重复 `close` 会 panic
> - 向已关闭的 `channel` 发送会 panic
> - 由发送方负责 close，接收方不要 close

### 用 range 遍历 channel

`for range` 会持续接收，直到 channel 被关闭：

:::go-repl title="示例"

```go
package main

import "fmt"

func main() {
    ch := make(chan int)

    go func() {
            for i := 0; i < 3; i++ {
                    ch <- i
            }
            close(ch) // 不 close，下面的 range 会永远阻塞 → 死锁
    }()

    for v := range ch { // 自动接收，close 后循环结束
            fmt.Println(v)
    }
}
```

:::

> [!IMPORTANT]
> range 一个永不关闭的 channel，会在没数据时永久阻塞。发送方必须在发完后 `close`，否则 range 端死锁

### 单向 channel

函数参数里可以把 channel 限定为只发或只收，用类型表达意图、防止误用：

> [!IMPORTANT]
>
> 只能发送（send-only）：`chan<- int`
> 只能接收（receive-only）：`<-chan int`

```go
package main

import "fmt"

// 只负责生产，参数声明为只发
func produce(out chan<- int) {
    for i := 0; i < 5; i++ {
        out <- i
    }

    close(out)
}

// 只负责消费，参数声明为只收
func consume(in <-chan int) {
    for v := range in {
        fmt.Println(v)
    }
}

func main() {
    ch := make(chan int)
    go produce(ch)
    consume(ch)
}
```

## 延伸阅读

为什么 Go 用 `<-`，而 Rust 用 `tx.send()` / `rx.recv()`？

Go 把 channel 做成了**语言内置的一等公民**，所以能给它一套专属语法；Rust 把 channel 做成了**标准库里的普通类型**，只能用普通方法调用

:::table full-width

| 维度 | Go `ch <- v` / `<-ch` | Rust `tx.send(v)` / `rx.recv()` |
| --- | --- | --- |
| channel 的地位 | **语言内置类型** + 关键字 | **标准库类型**（`std::sync::mpsc`） |
| 收发语法 | 专属操作符 `<-` | 普通方法调用 |
| 收发端 | **同一个 channel 值**，双向 | **拆成两个值** tx/rx |
| 失败处理 | 阻塞/panic/`ok` 布尔 | 返回 `Result`，强制处理 |

:::

`<-` 不是某个库设计的，它是 **Go 语言规范里的运算符**，和 `+` `*` 一个级别。正因为 channel 内置，Go 才有资格给它发明专属语法。Rust 的 channel 只是 `std` 里一个普通结构体，没有任何语言特权，自然只能 `.send()` / `.recv()`

**Go 选 `<-` 操作符，有三个原因。**

:::steps

1. channel 是 Go 并发模型的核心，值得一等公民待遇。Go 的设计信条是 "通过通信共享内存"，channel 是这套哲学的主角。`go` 关键字、`chan` 类型、`select` 语句、`<-` 操作符——这一整套都是语言级的，浑然一体。

2. `<-` 是个 "会说话" 的符号，方向即语义。箭头本身就表达了数据流向：

   ```go
   ch <- v      // 数据流进 channel：发送
   v := <-ch    // 数据从 channel 流出：接收
   ```

   这个直觉还延伸到了类型层面（单向 channel）：

   ```go
   chan<- int   // 箭头朝里，只能发
   <-chan int   // 箭头朝外，只能收
   ```

   类型签名和操作语法用的是同一个符号、同一个方向直觉，这是 `.send()/.recv()` 给不了的统一性。

3. 配合 `select` 才成立。Go 真正离不开操作符的地方是 `select`——同时等待多个 channel：

   ```go
   select {
   case v := <-ch1:
       // ch1 可读
   case ch2 <- x:
       // ch2 可写
   case <-time.After(time.Second):
       // 超时
   }
   ```

   `select` 是语言关键字，它的每个 `case` 必须是一个 channel 操作。如果收发是普通方法调用 `ch1.recv()`，编译器没法把它识别成 "一个可被多路选择的通信操作"。正是因为 `<-` 是语言内置操作符，`select` 才能在语法层面把它们组织起来。

:::

**Rust 选 tx/rx + 方法，同样有三个原因。**

:::steps

1. Rust 不想给 channel 语言特权。Rust 的设计原则是 "语言核心尽量小，能用库实现的就放进库"。channel 用 `mpsc`（标准库）或 `tokio::mpsc`（第三方库）实现。发明一个 `<-` 操作符就把 channel 焊死进了语言，违背 "机制归库" 的原则。

2. 拆成 tx/rx 是所有权模型的要求。这是最关键的点：

   ```rust
   let (tx, rx) = mpsc::channel();
   ```

   - `mpsc` = **m**ulti-**p**roducer **s**ingle-**c**onsumer。`tx` 可以 `clone` 给多个线程（多生产者），`rx` 不可 clone（单消费者）。这个约束直接编码在**类型**里。
   - `tx` 全部被 drop 时，`rx.recv()` 会自动返回 `Err`——靠所有权/生命周期天然实现了 "关闭"，不需要 Go 那样手动 `close(ch)`，也就没有 Go 里 "向已关闭 channel 发送会 panic" "谁负责 close" 那些坑。

   Go 的 channel 是一个双向的值，发送方关闭、接收方误用都可能在运行时 panic。Rust 把收发拆开 + 用所有权管生死，是把这类错误搬到编译期消灭掉。

3. 返回 `Result`，强制处理失败。

   ```rust
   tx.send(v)?;            // send 返回 Result，对端关了就是 Err
   let v = rx.recv()?;     // recv 返回 Result，发送端全没了就是 Err
   ```

   方法调用能自然地返回 `Result`，操作符 `<-` 就很难塞进一个 "返回可能失败的值" 的语义。

:::

所以不是 Go "没采用" Rust 的写法，而是两者在 "该把并发的复杂性放在语言里还是类型系统里" 这个根本问题上做了相反的选择。有意思的是 `select` 这个反例：Go 因为 channel 内置才有 `select` 关键字；Rust 想多路等待 channel 反而得靠宏（`tokio::select!`）或 `crossbeam` 的 `Select`，写起来比 Go 啰嗦——这正是 "机制归库" 的代价。两种哲学各有得失，没有谁绝对更优。
