---
title: ES Module
createTime: 2026/02/27 23:53:58
permalink: /modularization/0xn4bq3b/
---



ECMA 在参考了众多模块化规范后，在 2015 年，在 ES6 中发布的官方的模块化标准，也就是 **ES Module**。ESM 使用依赖 ==预声明== 的方式导入和导出模块

在 HTML 中使用模块化方式引入 JavaScript 文件时，需要在 `<script>` 标签中添加 `type="module"` 属性，来告诉浏览器这是一个模块化的 JavaScript 文件

```html
 <script type="module" src="entryFile"></script>
```

## 基本导入与导出

**基本导出** 可以有多个，但每个必须有名称。导出一个模块使用关键字 `export`

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

**基本导入**使用关键字 `import`，导入必须具有名称，因此要求导出的内容必须是 ==声明表达式== 或 ==具名符号==

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
>
> 1. ==导入时使用的符号是常量，不可修改=={.important}
> 2. 使用 * 会将所有基本导出进行导入，形成一个对象
>

ES6 的模块化属于 ==预声明==，这也就意味着，`import` 关键字不管声明在文件中的何处，在浏览器处理时，都会将其 "提升到顶部"。且是静态的，这也是 Tree Shaking 的前提条件

```js
console.log(foo)  // 依然可以正常被输出
import { foo } from "./foo.js"
```

## 默认导入与导出

每个模块，除了允许存在多个默认导出之外，还允许存在一个默认导出，语法为：

:::code-tabs

@tab 常规写法

```js
export default 导出的数据
```

@tab 不常见写法

```js
export { 导出的数据 as default }
```

:::

> [!NOTE]
> 由于每个模块只有一个默认导出，因此每个模块不能出现多个默认导出语句

默认导如依然是使用 `import` 关键字，但默认导入无需再使用对象的方式获取导出项

```js
import 变量名 from "模块路径"
```
