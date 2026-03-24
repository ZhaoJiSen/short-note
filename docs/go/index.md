---
title: Go
createTime: 2026/01/18 15:15:14
permalink: /go/
---

## 安装与环境

:::code-tabs

@tab brew 安装

```bash
brew install go
```

:::

也可从官网进行下载，地址: <https://go.dev/dl/>

> [!TIP]
> 推荐使用 Go Modules（Go 1.16+ 默认开启），无需手动管理 `GOPATH/src`，在项目根目录用 `go mod init <module>` 即可。

## 快速命令

- 查看版本：`go version`
- 初始化模块：`go mod init <module>`，会生成 `go.mod`
- 运行单文件：`go run main.go`
- 构建二进制：`go build`（默认输出当前目录下与模块同名的可执行文件）
- 格式化代码：`go fmt ./...`（等价于 `gofmt -w` 批量格式化）

> [!NOTE]
> Go 推荐保持标准工具链与默认格式，这能减少在团队协作中的非必要差异。

## 命名风格

go 语言中函数、变量、常量等命名通常使用驼峰式（camelCase），包名则推荐使用全小写且不带下划线的形式。对于导出（public）的标识符，首字母必须大写；非导出（private）的标识符则以小写字母开头
