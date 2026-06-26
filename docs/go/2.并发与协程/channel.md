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

### 关闭 channel 与接收的"逗号 ok"

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
