---
title: 代理与反射
createTime: 2026/02/26 10:46:57
permalink: /javascript/pm6r5fvv/
---

## Reflect

Reflect 是一个内置的 JavaScript 对象，它提供了一系列方法，让开发者通过调用这些方法，访问 JavaScript 一些底层功能。它可以实现诸如对象属性的读取、写入、删除、函数调用等操作，并且这些方法的行为与 JavaScript 内置的操作一致

:::note 为什么还要用 Reflect 实现一次

很多 `Reflect` 方法，其实都能在 JavaScript 中找到对应能力。只是这些能力过去分散在运算符、语法和对象方法里，使用方式并不统一。ES6 引入 `Reflect`，就是为了把这些底层操作收拢成一套统一的函数式接口。这样不仅调用起来更一致，也更方便在 `Proxy` 等元编程场景中复用默认行为

:::

:::table full-width

| API | 对应行为 | 返回值 |
| --- | --- | --- |
| `Reflect.get(target, key, receiver?)` | 读取属性 | 属性值 |
| `Reflect.set(target, key, value, receiver?)` | 写入属性 | `boolean` |
| `Reflect.has(target, key)` | `in` 判断 | `boolean` |
| `Reflect.deleteProperty(target, key)` | 删除属性 | `boolean` |
| `Reflect.ownKeys(target)` | 取所有键 | `Array<PropertyKey>` |
| `Reflect.apply(fn, thisArg, args)` | 函数调用 | 任意值 |
| `Reflect.construct(Ctor, args)` | 构造调用 | 对象 |

:::

## Proxy

Proxy 用来为目标对象建立一层代理，从而拦截并自定义这个对象上的基础操作。Proxy 是一个构造函数，因此创建一个代理对象需要使用 `new` 来创建

Proxy 接收两个参数：`target` 和 `handler`。其中 `target` 是需要代理的原始对象，而 `handler` 是一个对象，定义了哪些操作将被拦截以及如何重定义拦截操作的对象

:::table full-width

| Trap | 触发时机 | 返回值 |
| --- | --- | --- |
| `get` | 读取属性：`obj.foo` | 任意值 |
| `set` | 设置属性：`obj.foo = v` | `boolean` |
| `has` | `key in obj` | `boolean` |
| `deleteProperty` | `delete obj.foo` | `boolean` |
| `ownKeys` | `Object.keys()` / `Reflect.ownKeys()` | 键数组 |
| `apply` | 代理函数被调用 | 任意值 |
| `construct` | 代理函数被 `new` 调用 | 对象 |

:::
