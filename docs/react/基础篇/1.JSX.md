---
title: JSX
createTime: 2026/03/12 16:08:54
permalink: /react/xp46o97u/
---

[+表达观点]: UI 和逻辑天然有耦合，既然前端本来就在写 JS，那不如就直接扩展 JS 来描述界面

React 用 `JSX` 来描述 UI，它长得像 HTML，但==本质仍然是 JavaScript 表达式[+表达观点]=={.important}

```jsx
function App() {
  return <h1>Hello React</h1>;
}
```

::: table  full-width

| 规则 | 说明 | 示例 |
| --- | --- | --- |
| 只能有一个根节点 | 多个并列节点要包裹起来 | `<>...</>` |
| 插值用 `{}` | 只能放表达式，不能放语句 | `{count + 1}` |
| 类名用 `className` | 避免和 JS `class` 冲突 | `<div className="box" />` |
| 行内样式是对象 | 键名通常使用驼峰 | `style={{ fontSize: 16 }}` |
| 列表渲染要有 `key` | 帮助 React 稳定复用节点 | `{list.map(...)}` |
| 注释写在 `{/* */}` 中 | 普通 HTML 注释不能直接用 | `{/* comment */}` |

:::

`JSX` 只是语法糖。编译之后，它会变成 `jsx` / `jsxs` 或早期的 `React.createElement` 调用

:::code-tabs
@tab JSX 写法

```jsx
const element = <button className="primary">保存</button>;
```

@tab 编译后（简化理解）

```js
import { jsx } from 'react/jsx-runtime';

const element = jsx('button', {
  className: 'primary',
  children: '保存',
});
```

:::

通过 `JSX` 最终描述出来的是一个普通对象，也就是 React 内部所说的 React Element。它属于 `VDOM` 的一种具体实现
