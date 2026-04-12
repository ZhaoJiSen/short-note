---
title: Rust
createTime: 2025/07/26 12:03:00
permalink: /rust/
---

## 安装
在 MacOS、Linux 等类 Unix 系统下安装 Rust 可以直接使用安装命令

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

执行后可通过命令 `rustc --version` 查看 Rust 版本检查 Rust 是否安装成功

其他的一些 Rust 命令：
1. 更新 Rust: `rustup update`
2. 卸载 Rust : `rustup uninstall`
4. 查看 Rust 安装位置: `rustc --print sysroot`
5. 添加组件: `rustup component add <component>`[+command]


[+command]:
  该命令用于安装 Rust **工具链的可选组件（不是添加依赖库）** 的命令，如格式化工具、文档、分析器、调试工具等

## rustc
Rust 默认提供的官方编译器是 `rustc`，用于将 Rust 代码编译为==可执行文件==或==库文件==

::: code-tabs
@tab main.rs
```rust
fn main() {
    println!("Hello, world!");
}
```

@tab 编译
```shell
rustc main.rs
```
:::

编译后，会生成可执行文件 main，可通过 `./main` 直接运行

## Cargo

`Cargo` 是 Rust 的包管理工具，创建一个 Rust 项目可通过 `cargo new <project_name>` 

```bash
cargo new <project_name>
```

通过 `cargo new` 创建项目时，会自动生成一个用于管理项目依赖的 `Cargo.toml` 文件。该文件包含以下内容:

```toml
# 项目配置
[package]
name = "project_name"
version = "0.1.0"
edition = "2021"

# 依赖配置
[dependencies]

# 构建依赖（较少使用）
[build-dependencies]

# 开发依赖
[dev-dependencies]
```

::: details `cargo` 常见的命令有
1. 创建新项目: `cargo new <project_name>`
2. 添加依赖: `cargo add <package_name>`
3. 移除依赖: `cargo remove <package_name>`
4. 创建一个库项目: `cargo new --lib <project_name>`
5. 构建项目: `cargo build --release`
6. 运行项目: `cargo run`（包含两部分：构建和执行二进制文件）
7. 查看依赖: `cargo tree`
8. 发布项目: `cargo publish`
9. 查看版本: `cargo --version`
:::

## Rust 库

Rust 第三方库网站：[crates.io](https://crates.io/)，通过 `cargo add` 命令即可添加依赖库

```bash
cargo add serde
```









