---
title: Go
createTime: 2026/01/18 15:15:14
permalink: /go/
---

Go 是一门强调简单、并发与工程效率的编译型语言，常用于后端、云原生与基础设施领域。

## 快速命令

- 查看版本：`go version`
- 初始化模块：`go mod init <module>`，会生成 `go.mod`
- 运行单文件：`go run main.go`
- 构建二进制：`go build`（默认输出当前目录下与模块同名的可执行文件）
- 格式化代码：`go fmt ./...`（等价于 `gofmt -w` 批量格式化）

> [!NOTE]
> Go 推荐保持标准工具链与默认格式，这能减少在团队协作中的非必要差异。
