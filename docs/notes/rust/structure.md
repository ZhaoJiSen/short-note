---
title: 结构体
createTime: 2025/07/27 15:42:45
permalink: /rust/e68jmm5c/
---

结构体是由多种类型组合而成的复合类型，可以包含多个字段，每个字段可以有不同的类型。定义一个结构体使用关键字 `struct`，结构体名使用大驼峰命名法。

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
```

## 创建结构体实例

创建结构体实例使用 `{}` 包裹字段值，字段名与值之间使用 `:` 分隔，字段之间使用 `,` 分隔

::: code-tabs
@tab 创建结构体实例.rs
```rust
let user1 = User {
    active: true,
    username: String::from("someusername123"),
    email: String::from("someone@example.com"),
    sign_in_count: 1,
};
:::

> [!IMPORTANT] 
> - 实例化结构体时，每个字段都需要进行初始化
> - 初始化时的字段顺序==不需要==和结构体定义时的顺序保持一致
> - 在创建结构体实例时，如果字段名与字段值一致，可以直接将其简写（与 JavaScript 中的对象字面量类似）

## 访问结构体字段

访问结构体字段通过 `.` 操作符即可访问结构体内部实例的字段值，也可以修改字段值

::: code-tabs
@tab 访问结构体字段.rs
```rust
let user1 = User {
    active: true,
    username: String::from("someusername123"),
    email: String::from("someone@example.com"),
    sign_in_count: 1,
};

user1.email = String::from("anotheremail@example.com");
```
:::

> [!IMPORTANT]
> ==要修改结构体的字段值，必须要将结构体实例声明为可变的==，Rust 不支持将某个结构体某个字段标记为可变

## 更新结构体

更新结构体时，可以使用 `...` 语法，将结构体中的一部分字段值进行更新，其他字段值保持不变

::: code-tabs
@tab 更新结构体.rs
```rust
let user2 = User {
    email: String::from("another@example.com"),
    ..user1
};
```
:::

::: details 所有权的转移
上述代码中，`user1` 中的 `username` 字段的所有权被转移到了 `user2` 中，因此作为结果 `user1.username` 无法再被使用。原因在于 `bool` 和 `u64` 类型实现了 `Copy trait` 而实现了 `Copy trait` 的类型无需所有权转移，可以直接在赋值时进行==数据拷贝==
:::


> [!IMPORTANT]
> 这里与 JavaScript 不同的是 Rust 中需要更新的值是需要放在 `..` 之前的

## 元组结构体与单元结构体

结构体必须要有名称，但是结构体的字段可以没有名称，这种结构体长得很像元组，因此被称为元组结构体

::: code-tabs
@tab 元组结构体.rs
```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```
:::

单元结构体没有任何字段和属性，当只关心该类型的行为时，就可以使用单元结构体，后续再为其实现某个特征

::: code-tabs
@tab 单元结构体.rs
```rust
struct AlwaysEqual;

let subject = AlwaysEqual;

// 我们不关心 AlwaysEqual 的字段数据，只关心它的行为，
// 因此将它声明为单元结构体，然后再为它实现某个特征
impl SomeTrait for AlwaysEqual {}
```
:::


## 结构体数据的所有权
