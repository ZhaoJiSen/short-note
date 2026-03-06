---
title: shared 与 layers 进阶
createTime: 2026/02/09 16:28:00
permalink: /vue/rxe54a2m/
---

> [!IMPORTANT]
> - `shared` 解决“**同一项目内** 的跨端代码复用”
> - `layers` 解决“**多个 Nuxt 项目之间** 的能力复用”
> - 两者不是二选一，而是不同层级的问题拆分

:::collapse expand
- 最佳实践

  1. `shared` 只放纯逻辑与类型，不放浏览器或 Node 专属副作用
  2. `layers` 用来复用“应用能力”（页面、布局、插件、配置），不要塞业务私有逻辑
  3. 有覆盖需求时优先用“项目自身代码”覆盖 layer，而不是在 layer 里做大量分支
  4. 多个 layer 同时存在时，显式写 `extends` 控制顺序，避免隐式行为
  5. 避免在 `shared` 顶层声明可变单例，防止 SSR 场景下状态串请求
:::

## 为什么要拆成两层

[+shared层]: 单项目内的“代码复用层”，目标是跨端复用类型、常量、纯函数  
[+layers层]: 多项目间的“应用复用层”，目标是复用 Nuxt 目录能力与配置

在 Nuxt 工程里，`shared`[+shared层] 与 `layers`[+layers层] 的职责不同：

- `shared` 更接近“代码组织问题”
- `layers` 更接近“工程复用与架构分层问题”

把它们混在一起会导致两个常见结果：  
要么 layer 里塞满业务细节不可复用，要么 shared 目录承担了不该承担的框架职责。

## `shared`：单项目跨端复用

### 适合放什么

- 类型定义：`types`、DTO、接口响应结构
- 常量与枚举：状态码、路由 key、事件名
- 纯函数工具：格式化、映射、校验函数
- 与框架无关的 schema（如 Zod schema）

:::code-tabs
@tab shared/types/user.ts
```ts
export interface UserProfile {
  id: number
  nickname: string
  email: string
}
```

@tab app/pages/profile.vue
```vue
<script setup lang="ts">
import type { UserProfile } from '~/shared/types/user'

const { data } = await useFetch<UserProfile>('/api/me')
</script>
```
:::

### 不适合放什么

- 直接依赖 `window/document/localStorage` 的代码
- 直接依赖 Node-only API（如 `fs`）的代码
- 顶层可变单例状态（SSR 下容易跨请求污染）

[+跨请求污染]: 同一服务进程会处理多个请求；若复用可变单例，会导致请求之间互相影响

```ts
// shared/cache.ts
// 不推荐：进程级可变单例
const memoryCache = new Map<string, unknown>()

export function setCache(key: string, value: unknown) {
  memoryCache.set(key, value)
}
```

上面这类写法在 SSR 下容易引发跨请求污染[+跨请求污染]。  
状态应放在请求上下文或 `useState` / Store 中，而不是共享单例里。

## `layers`：多项目能力复用

### 最小结构

::: file-tree
- layers
  - base
    - nuxt.config.ts
    - app
      - components
      - composables
      - layouts
      - middleware
      - plugins
    - server
:::

`layer` 本质是“可被合并的 Nuxt 子应用”，可复用的不只是函数，还包括页面结构、插件与构建配置。

### 接入方式

:::code-tabs
@tab 显式 extends（推荐）
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    './layers/base',
    './layers/ui',
  ],
})
```

@tab 本地自动扫描
```text
my-app/
  layers/
    base/
      nuxt.config.ts
    ui/
      nuxt.config.ts
```
:::

### 合并与覆盖优先级

[+覆盖优先级]:
1. 项目自身代码优先级最高  
2. 自动扫描的本地 layers：通常按名称顺序，后者覆盖前者（`Z > A`）  
3. `extends` 中显式声明的 layers：数组中靠前者优先级更高（`first > last`）

实际开发中只要出现“同路径同名文件”，就会触发覆盖优先级[+覆盖优先级]规则。

:::code-tabs
@tab layers/base/app/layouts/default.vue
```vue
<template>
  <div>
    <header>Base Header</header>
    <slot />
  </div>
</template>
```

@tab app/layouts/default.vue
```vue
<template>
  <div>
    <header>Project Header</header>
    <slot />
  </div>
</template>
```
:::

最终会使用项目自身的 `app/layouts/default.vue`，因为项目代码优先级最高。

## `shared` 与 `layers` 的协作建议

可以按“复用半径”来分层：

- 只在当前项目复用：放 `shared`
- 要跨多个 Nuxt 项目复用：抽为 `layer`
- 需要跨技术栈复用（不止 Nuxt）：优先独立 npm 包，再由 layer 或项目引用

一个常见实践是：

1. 在 layer 里复用 UI 布局、通用插件、鉴权中间件骨架
2. 在项目 `shared` 里维护业务领域类型和常量
3. 项目用自身 `app/*` 覆盖 layer 默认实现，做差异化定制

## 常见错误

1. 把业务私有页面直接放进公共 layer，导致其他项目难以复用
2. 在 `shared` 顶层保存可变状态，SSR 下请求互相污染
3. 同时使用自动扫描和 `extends`，却不明确顺序，导致“以为覆盖但没生效”
4. layer 中放了 `.client` 专属逻辑，却在服务端路径中被间接引用

## 小结

`shared` 关注的是“同一个项目里的代码复用边界”，`layers` 关注的是“多个项目之间的应用能力复用边界”。  
把这两个层次拆开，Nuxt 项目的目录会更稳定，扩展成本也会更可控。
