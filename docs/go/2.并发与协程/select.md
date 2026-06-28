---
title: select
createTime: 2026/01/18 21:02:37
permalink: /go/select/
---

要理解 select，得先回到 channel 的一个限制上

channel 的收发是阻塞的，意味着 `v := <-ch`，如果 `ch` 没有数据，这一行就会一直卡着，goroutine 停在这里什么都做不了，直到有程序往 `ch` 里发送了东西。平时这里没有问题，但很多场景下，程序要等待的不止有一件事

例如：一个后台工作协程，它要同时关心三件事：有没有新任务来、要不要超时、是不是被通知退出了。这三件事各自对应一个 channel。如果用阻塞接收，只能写成

```go
job := <-jobCh
```

问题就是：卡在等任务的时候，退出信号来了程序根本收不到。反过来如果先等退出信号,任务又处理不了。单个阻塞接收一次只能盯一个 channel，这就是矛盾所在

==select 就是为了解决这个矛盾出现的。它让一个 goroutine 同时盯住多个 channel，哪个先就绪就处理哪个==

```go
select {
    case job := <-jobCh:
        fmt.Println("有任务：", job)
    case <-time.After(time.Second):
        fmt.Println("超时了")
    case <-quitCh:
        fmt.Println("收到退出信号")
        return
}
```

这三个 case 是同时在等的。谁先来，就走谁的分支。这就是 select 的全部意义：多路等待，就绪即执行

## 用法

### 基本语法

每个 `case` 必须是一个 channel 操作（收或发）

```go
select {
    case <-ch1:        // 接收
    case v := <-ch2:   // 接收并赋值
    case ch3 <- v:     // 发送
    default:           // 可选的 default 分支
}
```

### 核心场景

#### 多路监听

这是 select 最本质的用途，也是其他场景的基础。

所谓多路监听，就是有好几个数据源，它们各自在自己的 channel 上送数据，而程序不知道谁先来、谁后来。因此不能挨个去阻塞接收——因为一旦卡在第一个上，后面就绪的就处理不了了。select
把这几个源摆在一起同时等,谁先送到就先处理谁

:::go-repl title="多路监听示例"

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    fast := make(chan string)
    slow := make(chan string)

    // 快的源:200ms 后送一条
    go func() {
            time.Sleep(200 * time.Millisecond)
            fast <- "来自 fast 的数据"
    }()

    // 慢的源:500ms 后送一条
    go func() {
            time.Sleep(500 * time.Millisecond)
            slow <- "来自 slow 的数据"
    }()

    // 两个源各送一条,所以要循环收两次
    for i := 0; i < 2; i++ {
            select {
            case v := <-fast:
                    fmt.Println("收到:", v)
            case v := <-slow:
                    fmt.Println("收到:", v)
            }
    }
}
```

:::

> 第一次 select 时,两个 channel 都还没数据，select 就阻塞着等。200ms 时 fast 先就绪，走 fast 分支;循环回来第二次 select，继续等,500ms 时 slow
  就绪，走 slow 分支

#### 非阻塞收发

前面说过，没有就绪 case 时 select 会阻塞，但有时候不想等待。例如：现在有数据就拿数据，没有数据就去执行别的，不卡在这里等待

给 select 加一个 `default` 分支就可以了。没有 case 就绪时，直接走 `default`

:::go-repl title="非阻塞收发示例"

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan int)

    // 这个 goroutine 过 300ms 才送数据
    go func() {
            time.Sleep(300 * time.Millisecond)
            ch <- 42
    }()

    // 主协程每 100ms 探一次,没数据就报告"还没好"
    for i := 0; i < 5; i++ {
            select {
            case v := <-ch:
                    fmt.Println("拿到数据:", v)
            default:
                    fmt.Println("还没数据,先干别的")
            }
            time.Sleep(100 * time.Millisecond)
    }
}
```

:::

::::details 发送方同理

比如一个限流场景：缓冲区满了就直接丢弃，绝不阻塞等待

:::go-repl title="限流场景示意"

```go
package main

import "fmt"

func main() {
    ch := make(chan int, 2) // 缓冲区只有 2

    for i := 0; i < 5; i++ {
            select {
            case ch <- i:
                    fmt.Println("发送成功:", i)
            default:
                    fmt.Println("缓冲区满,丢弃:", i)
            }
    }
}
```

:::

::::

#### 控制超时

控制超时就是：让 "正常结果" 和 "一个定时器" 竞争，谁先就绪就走谁。定时器可以用 `time.After(d)`，它会在指定时间后返回一个可读 channel

:::go-repl title="超时控制示例"

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    resultCh := make(chan string)

    // 模拟一个要 2 秒才返回的慢操作
    go func() {
            time.Sleep(2 * time.Second)
            resultCh <- "操作完成"
    }()

    select {
    case res := <-resultCh:
            fmt.Println("拿到结果:", res)
    case <-time.After(1 * time.Second):
            fmt.Println("超时了,不等了")
    }
}
```

:::

#### 取消与退出

取消与退出指的是：一个 goroutine 在等待某些结果的同时，也要能响应外部的取消信号

最原始的做法是用一个专门的 `quit` channel

:::go-repl title="quit channel 示例"

```go
package main

import (
    "fmt"
    "time"
)

func worker(jobCh <-chan int, quit <-chan struct{}) {
    for {
            select {
            case job := <-jobCh:
                    fmt.Println("处理任务:", job)
            case <-quit:
                    fmt.Println("收到退出信号,worker 结束")
                    return // 退出 for 循环,goroutine 结束
            }
    }
}

func main() {
    jobCh := make(chan int)
    quit := make(chan struct{})

    go worker(jobCh, quit)

    jobCh <- 1
    jobCh <- 2
    jobCh <- 3

    close(quit) // 关闭 quit,通知 worker 退出
    time.Sleep(100 * time.Millisecond)
}
```

:::

> [!TIP]
> 这里有个常用技巧：用 `close(quit)` 而不是往里发值。因为关闭一个 channel 后，所有对它的接收都会立即就绪，这样哪怕有十个 worker 都在 `case <-quit` 上等着,一个 `close` 就能让它们全部同时收到信号退出。这比挨个发值优雅得多

在真实项目中，这个 `quit`  通常会被 `context.Context` 取代，写成 `case <-ctx.Done()`。语义一样，但 context 还能携带取消原因、做超时、在调用链上层层传递:

:::go-repl title="context 示例"

```go
package main

import (
    "context"
    "fmt"
    "time"
)

func worker(ctx context.Context, jobCh <-chan int) {
    for {
            select {
            case job := <-jobCh:
                    fmt.Println("处理任务:", job)
            case <-ctx.Done():
                    fmt.Println("退出,原因:", ctx.Err())
                    return
            }
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())
    jobCh := make(chan int)

    go worker(ctx, jobCh)

    jobCh <- 1
    jobCh <- 2

    cancel() // 通知退出,ctx.Done() 随即就绪
    time.Sleep(100 * time.Millisecond)
}
```

:::

## 核心特性

### 执行规则

select 的核心规则可以概括为：

::::steps

1. 检查所有 `case` 中的 channel 操作
2. 如果有一个或多个已经就绪
3. 从已就绪的分支中选择一个执行
4. 如果没有任何分支就绪：
   - 有 `default`：立即执行 `default`
   - 没有 `default`：阻塞等待

::::

:::note
当多个 case 同时就绪时，Go 会从中选一个执行。不能依赖某个固定优先级顺序
:::

### 求值时机

==进入 select 时，所有 `case` 的 channel 表达式、发送语句要发的值，都会从上到下被求值一次——不管最后选不选中它==

:::go-repl title="求值时机示例"

```go
package main

import "fmt"

func pick(ch chan int, name string) chan int {
    fmt.Println("求值:", name)
    return ch
}

func main() {
    a := make(chan int, 1)
    b := make(chan int, 1)
    a <- 1 // 只有 a 就绪

    select {
    case v := <-pick(a, "a"):
            fmt.Println("选中 a:", v)
    case v := <-pick(b, "b"):
            fmt.Println("选中 b:", v)
    }
}
```

:::

> `b` 分支虽然没被选中，但 `pick(b,"b")` 照样执行了

### 随机就绪

runtime 会主动把就绪 `case` 的检查顺序伪随机打乱，目的是防饥饿（否则排在前面的 channel 在高频下会饿死后面的）

> [!IMPORTANT]
> 永远不要依赖 `case` 的书写顺序当优先级

:::go-repl title="随机就绪示例"

```go
package main

import "fmt"

func main() {
    count := map[string]int{}
    for i := 0; i < 10000; i++ {
            a := make(chan int, 1)
            b := make(chan int, 1)

            a <- 1
            b <- 1 // 两个都就绪

            select {
            case <-a:
                    count["a"]++
            case <-b:
                    count["b"]++
            }
    }
    fmt.Println(count) // a、b 各约 5000
}
```

:::

### nil channel

nil channel 指的是没有初始化、值为 `nil` 的 channel。对它收发会永久阻塞，所以在 select 里，它对应的分支永远不会就绪

==把一个 channel 置为 `nil`，就等于临时关掉了它在 select 里的那条分支==

它常和已关闭的 channel 配合。已关闭的 channel 接收会一直就绪、不停返回零值，如果不管它，select 会在这条分支上空转。置为 `nil` 就能把它排除出竞争

:::go-repl title="用 nil 关掉已耗尽的分支"

```go
package main

import "fmt"

func main() {
    a := make(chan int, 1)
    b := make(chan int, 1)
    a <- 1
    b <- 2
    close(a)
    close(b)

    // 谁先取完就把谁置 nil，两个都 nil 时退出
    for a != nil || b != nil {
            select {
            case v, ok := <-a:
                    if !ok {
                            a = nil
                            continue
                    }
                    fmt.Println("a:", v)
            case v, ok := <-b:
                    if !ok {
                            b = nil
                            continue
                    }
                    fmt.Println("b:", v)
            }
    }
}
```

:::

> 不置 `nil` 的话，关闭后的 `case v, ok := <-a` 会一直命中，select 就在这条分支上空转

### 空 select

空 select 指的是没有任何 `case` 的 `select{}`。==它会让当前 goroutine 永久阻塞，且不占用 CPU==。典型用途是 `main` 把活儿都交给后台 goroutine 之后，自己需要永久挂起、不让程序退出

```go
select {} // 永远阻塞当前 goroutine
```

> [!WARNING]
> `select{}` 只在确实有别的 goroutine 在干活时才合理。如果所有 goroutine 都阻塞了，runtime 会检测到并 panic：`all goroutines are asleep - deadlock!`

## 补充内容

### for + select

一次 select 只会选中一个 case，执行完就结束。要持续处理事件，就把它套进 `for` 里，形成一个事件循环。`for { select {} }` 是 Go 后台 goroutine 的标准骨架：一个循环、若干业务分支、一个退出分支

:::go-repl title="for + select 事件循环"

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    tick := time.NewTicker(500 * time.Millisecond)
    defer tick.Stop()

    done := time.After(2 * time.Second)

    for {
            select {
            case t := <-tick.C:
                    fmt.Println("tick:", t.Format("15:04:05.000"))
            case <-done:
                    fmt.Println("到时间了，退出循环")
                    return
            }
    }
}
```

:::

> [!WARNING]
> select 里的 `break` 只会跳出 select 本身，不会跳出外层 `for`。要结束循环得用 `return`，或给 for 加标签后 `break 标签名`

### `time.After`

`time.After` 单次用在一次性超时里没问题，但放进高频 `for` 循环就有坑。`time.After` 每次调用都会新建一个 `Timer`，而它在到期前不会被 GC 回收。循环频繁、又总走别的分支时，这些 Timer 会不断堆积

```go
// 反例：每轮都新建一个 timer，1 分钟内不释放
for {
    select {
    case v := <-ch:
            handle(v)
    case <-time.After(time.Minute):
    }
}
```

正确做法是复用同一个 `time.NewTimer`，每轮用 `Reset` 重置

```go
timer := time.NewTimer(time.Minute)
defer timer.Stop()

for {
    select {
    case v := <-ch:
            handle(v)
            if !timer.Stop() {
                    // timer.C 是一个 timer.Timer 结构体的一个字段
                    <-timer.C // 排空旧信号，防止上一轮残留
            }
            timer.Reset(time.Minute)
    case <-timer.C:
            fmt.Println("超时")
            timer.Reset(time.Minute)
    }
}
```

> [!NOTE]
> Go 1.23 起改进了 Timer 的回收（未 `Stop` 也能更早被 GC），但 "复用 + Reset" 依然是推荐写法
