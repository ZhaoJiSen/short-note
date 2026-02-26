---
title: 块级绑定
createTime: 2026/02/26 11:30:00
permalink: /javascript/r4qjmosy/
---

ES6 在变量声明层面最关键的升级是 `let` 和 `const`。它们解决了 `var` 在大型代码中的三个典型问题：变量提升导致的误读、重复声明、全局污染。

## 为什么要引入块级绑定

`var` 只有函数作用域，没有块级作用域。在 `if/for` 里声明的变量仍会泄漏到外层。

```js
if (true) {
  var fromVar = 'I leak'
}

console.log(fromVar) // I leak
```

而 `let` / `const` 由最近的 `{}` 形成作用域边界。

```js
if (true) {
  const fromConst = 'only here'
}

// ReferenceError
console.log(fromConst)
```

## `let` 与暂时性死区（TDZ）

`let` 声明会在词法环境中注册，但在声明语句执行前不可访问，这段区间就是 TDZ（Temporal Dead Zone）。

```js
// ReferenceError: Cannot access 'count' before initialization
console.log(count)
let count = 1
```

## `const` 的语义

`const` 约束的是“绑定不可重新赋值”，不是“值绝对不可变”。

```js
const profile = { name: 'zs' }
profile.name = 'ls' // 允许：对象内容可变

// TypeError: Assignment to constant variable.
profile = {}
```

## `for` 循环中的块级作用域

`let` 在循环中会为每次迭代创建新的绑定，因此闭包拿到的是“当次迭代值”。

```js
const handlers = []

for (let i = 0; i < 3; i += 1) {
  handlers.push(() => i)
}

console.log(handlers[0]()) // 0
console.log(handlers[1]()) // 1
console.log(handlers[2]()) // 2
```

## 演示：`var` 与 `let` 在循环闭包中的差异

::: demo
```html
<!doctype html>
<html lang="zh-CN">
  <body>
    <pre id="out"></pre>
    <script>
      const out = document.getElementById('out')

      const fromVar = []
      for (var i = 0; i < 3; i += 1) {
        fromVar.push(() => i)
      }

      const fromLet = []
      for (let j = 0; j < 3; j += 1) {
        fromLet.push(() => j)
      }

      out.textContent = [
        'var: ' + fromVar.map(fn => fn()).join(', '),
        'let: ' + fromLet.map(fn => fn()).join(', ')
      ].join('\n')
    </script>
  </body>
</html>
```
:::

:::details 一句话总结
1. 默认优先 `const`，需要重新赋值时用 `let`。  
2. 避免继续使用 `var` 写新代码。  
3. 看到“声明前访问”报错时，优先检查 TDZ。  
:::
