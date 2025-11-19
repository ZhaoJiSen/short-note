---
title: ES Module
createTime: 2025/11/05 22:26:29
permalink: /engineering/laegs7pa/
---

ECMA 在参考了众多模块化规范后，在 2015 年，在 ES6 中发布的官方的模块化标准，也就是 **ES Module**。

:::details ES6 模块化的特点
1. 使用依赖 ==预声明== 的方式导入和导出模块
2. 多种导入导出方式
3. 规范的路径表示方法（相对路径）
:::

## 浏览器对模块化的支持

目前，主流浏览器使用如下方式，引入一个 ES6 模块
```html
 <script type="module" src="entryFile"></script>
```

> [!INFO]
> 但是这种方式并非官方标准
 
### 基本导入与导出

**基本导出**可以有多个，但每个必须有名称。导出一个模块使用关键字 `export`

::: code-tabs
@tab 写法 1
```js
export 声明语句
```

@tab 写法 2
```ts
export {
  具名符号
}

```
:::

> [!IMPORTANT]
> 由于基本导入必须具有名称，因此要求导出的内容必须是 ==声明表达式== 或 ==具名符号==

--- - - - ---------------------------------------

**基本导入**使用关键字 `import` 

:::code-tabs

@tab 基本导入
```js
import {} form "模块路径"
```

@tab 别名导入
```js
import { a as b } from "模块路径"
```

@tab * 导入
```js
import * as customModule from "模块路径"
```
:::

> [!IMPORTANT]
> 1. 导入时使用的符号是常量，不可修改
> 2. 使用 * 会将所有基本导出进行导入，形成一个对象

在开头阐述过，ES6 的模块化属于 ==预声明==，这也就意味着，`import` 关键字不管声明在文件中的何处，在浏览器处理时，都会将其 “提升到顶部”

```js
console.log(foo)  // 依然可以正常被输出

import { foo } from "./foo.js"
```

### 默认导入于导出
