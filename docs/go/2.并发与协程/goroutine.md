---
title: goroutine
createTime: 2026/01/18 20:55:01
permalink: /go/v1eschlh/
---

[+轻量级]: 初始栈只有 2KB（操作系统线程通常是 1~8MB），栈会按需自动扩缩容。所以一个程序里开几十万个 goroutine 很正常

goroutine 是 Go 语言运行时管理的 **轻量级线程[+轻量级]**，不由操作系统进行调度，Go 运行时会把大量 goroutine 复用到少量 OS 线程上（GMP 模型）

## 启动方式

在任意一个函数调用前加 `go`，这个函数就将在一个新的 goroutine 里并发执行

:::code-tabs

@tab 启动 goroutine

```go
go funcName(args)   // 启动一个 goroutine 执行具名函数
go func() {}()      // 启动一个 goroutine 执行匿名函数
```

@tab 示例

```go
package main

import (
    "fmt"
    "time"
)

func say(s string) {
    for i := 0; i < 3; i++ {
            fmt.Println(s)
            time.Sleep(100 * time.Millisecond)
    }
}

func main() {
    go say("world") // 新 goroutine 里执行
    say("hello")    // 当前(main) goroutine 里执行
}
```

:::

## 核心特性

### `main goroutine`

`main` 函数本身运行在一个 goroutine 中，称为 main goroutine。当 `main goroutine` 返回时，整个程序立即退出，不等待任何其它 `goroutine`

```go
func main() {
    go say("world")
    // main 立即结束 → world 可能一行都没打印  //[!code highlight]
}
```

### 执行顺序无保证

并发的 `goroutine` 之间没有顺序保证，需要顺序必须用同步手段显式协调

:::go-repl title="goroutine 执行顺序无保证"

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 5; i++ {
            wg.Add(1)
            go func(n int) {
                    defer wg.Done()
                    fmt.Println(n)
            }(i)
    }
    wg.Wait() // 阻塞，直到 5 个 goroutine 全部 Done
}
```

:::

> 多次运行，0~4 的输出顺序每次都可能不同

## 协作与控制

### goroutine 如何返回结果

goroutine 不能像普通函数那样直接返回值给调用方。通常有三种做法：

:::table full-width

| 方式 | 适用场景 | 说明 |
| --- | --- | --- |
| `channel` | 最常见 | 用于结果传递、错误传递、同步 |
| 共享变量 + 锁 | 多 goroutine 共享状态 | 需要自己保证并发安全 |
| 回调 / 闭包写入外部对象 | 特定框架或任务模型 | 可读性和同步控制要额外注意 |

:::

最典型的是通过 `channel` 返回结果：

```go
package main

import "fmt"

func main() {
    resultCh := make(chan int)

    go func() {
        resultCh <- 1 + 2
    }()

    result := <-resultCh
    fmt.Println(result)
}
```

### 常见控制方式

goroutine 本身只是 "并发执行" 的载体，实际项目里通常还要配合这些能力：

:::table full-width

| 配套机制 | 作用 |
| --- | --- |
| `channel` | 传递数据、做同步 |
| `select` | 多路等待、超时控制 |
| `context` | 取消、超时、链路控制 |
| `sync.WaitGroup` | 等待一组 goroutine 结束 |
| `sync.Mutex` / `sync.RWMutex` | 保护共享状态 |

:::

## 常见陷阱

### 循环变量捕获问题

在循环中启动 `goroutine` 并直接引用循环变量，行为因 Go 版本而异

```go
for i := 0; i < 5; i++ {
    go func() {
        fmt.Println(i) // 直接捕获循环变量 i
    }()
}
```

:::table full-width

| Go 版本 | 循环变量作用域 | 典型输出 |
| --- | --- | --- |
| <1.22 | 整个循环共享同一变量 | 3 3 3（多数情况） |
| >=1.22 | 每次迭代创建新的变量 | 0 1 2（顺序不定） |

:::

:::details 推荐写法：将循环变量作为参数显式传入，让每个 goroutine 持有独立副本

```go
for i :=0; i < 5; i++ {
    go func(n int) {
        fmt.Println(n)
    }(i)
}
```

:::
