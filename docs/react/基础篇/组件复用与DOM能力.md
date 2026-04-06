---
title: 组件复用与DOM能力
createTime: 2026/03/12 16:08:54
permalink: /react/ko6pub74/
---

[+HOC]: Higher-Order Component
[+Render Props]: 通过“把渲染函数作为参数传入”来复用逻辑的模式

基础篇解决的是“能把组件写出来”，补充篇开始处理“怎么让组件更可复用、更能控制 DOM 边界”。

## props 默认值与校验

课程里专门讲了属性默认值和类型验证，这一块的本质是在回答两个问题：

1. 组件没传值时怎么办？
2. 组件传错值时怎么尽早发现？

```jsx
import PropTypes from 'prop-types';

export default function Tag({ color = 'slateblue', children }) {
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 999,
        color: '#fff',
        backgroundColor: color,
      }}
    >
      {children}
    </span>
  );
}

Tag.propTypes = {
  color: PropTypes.string,
  children: PropTypes.node.isRequired,
};
```

:::table title="默认值与校验的现代实践" full-width
| 场景 | 推荐方案 |
| --- | --- |
| 纯 JavaScript 项目 | 参数默认值 + `PropTypes` |
| TypeScript 项目 | TypeScript 类型 + 参数默认值 |
| 设计系统组件 | 同时要有默认值、类型描述、文档说明 |
:::

## 复用逻辑的三种典型方式

::: table title="逻辑复用方案" full-width
| 方案 | 核心思路 | 现在的优先级 |
| --- | --- | --- |
| 自定义 Hook | 直接复用“状态 + 副作用 + 行为” | 最高 |
| HOC | 包一层新组件进行增强 | 中 |
| Render Props | 由调用方决定渲染结果 | 中 |
:::

:::details 为什么现在自定义 Hook 更常见
Hooks 让函数组件自己就能承载复用逻辑，因此很多过去必须用 HOC 或 Render Props 的场景，现在直接提取成 `useXxx` 会更自然，也更少嵌套。
:::

## HOC：横向抽离公共逻辑

高阶组件不是“一个高级组件”，而是==一个接收组件并返回新组件的函数==。

:::code-tabs
@tab withLogger.js
```jsx
import { useEffect } from 'react';

export default function withLogger(WrappedComponent) {
  return function LoggedComponent(props) {
    useEffect(() => {
      console.log(`[mount] ${WrappedComponent.name}`);

      return () => {
        console.log(`[unmount] ${WrappedComponent.name}`);
      };
    }, []);

    // 透传原组件需要的 props
    return <WrappedComponent {...props} />;
  };
}
```

@tab UserCard.jsx
```jsx
function UserCard({ name }) {
  return <div>当前用户：{name}</div>;
}

export default UserCard;
```

@tab App.jsx
```jsx
import { useState } from 'react';
import withLogger from './withLogger';
import UserCard from './UserCard';

const LoggedUserCard = withLogger(UserCard);

export default function App() {
  const [visible, setVisible] = useState(true);

  return (
    <div>
      <button onClick={() => setVisible((prev) => !prev)}>
        切换显示
      </button>
      {visible ? <LoggedUserCard name="ZhaoJisen" /> : null}
    </div>
  );
}
```
:::

## Render Props：逻辑给我，界面我来决定

如果某段逻辑需要复用，但不同使用方的渲染结果差异又很大，Render Props 会很合适。

```jsx
import { useEffect, useState } from 'react';

function MouseTracker({ children }) {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(event) {
      setPoint({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return children(point);
}

export default function App() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <p>
          鼠标位置：({x}, {y})
        </p>
      )}
    </MouseTracker>
  );
}
```

::: card title="Ref 相关能力已单独拆分" icon="material-icon-theme:folder-react"
`useRef`、`forwardRef`、`useImperativeHandle` 统一整理到了 [useRef](/react/t5qj4s1y/)，这里不再重复展开。
:::

## Portals：从 DOM 结构里“跳出去”

`createPortal` 适合做模态框、抽屉、浮层、Tooltip 等“视觉上应脱离父容器”的 UI。

:::code-tabs
@tab Modal.jsx
```jsx
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'grid',
        placeItems: 'center',
      }}
      onClick={onClose}
    >
      <section
        style={{
          width: 360,
          padding: 24,
          borderRadius: 16,
          background: '#fff',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>,
    document.getElementById('modal-root')
  );
}
```

@tab App.jsx
```jsx
import { useState } from 'react';
import Modal from './Modal';

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>打开模态框</button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3>React Portal</h3>
        <p>模态框被渲染到了 root 外部的 DOM 节点中。</p>
      </Modal>
    </div>
  );
}
```
:::

> [!NOTE]
> Portal 虽然改变了 DOM 挂载位置，但它仍然属于原来的 React 组件树，所以上下文传递和 React 事件冒泡规则依然成立。
