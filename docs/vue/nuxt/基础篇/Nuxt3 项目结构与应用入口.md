---
title: Nuxt3 项目结构与应用入口
createTime: 2026/01/25 14:54:44
permalink: /vue/u9k2p8rq/
---

## 大纲

- App.vue 入口职责：布局、路由占位、全局样式、全局路由监听
- Nuxt3 目录结构：核心目录与文件角色
- 常用脚本：dev/build/generate/preview/prepare
- nuxt.config 与配置体系：runtimeConfig / appConfig / 环境变量

## 1.App.vue：应用入口

在 Nuxt3 中，`app.vue` 会被视为应用的根入口。默认情况下 Nuxt 会为每个路由渲染页面内容，而 `app.vue` 负责决定“页面被包在什么结构里”以及“入口处要做哪些全局事情”。

常见用途：

- 定义页面布局（`NuxtLayout`）或自定义布局骨架
- 定义路由占位（`NuxtPage`）以渲染页面
- 编写全局样式或引入全局样式
- 监听全局路由事件（如 `beforeEach`）

:::details 示例：App.vue 的最小骨架
```vue
<template>
  <NuxtLayout>
    <!-- 页面内容 -> vue-router -->
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
const router = useRouter()

router.beforeEach((to, from) => {
  console.log('beforeEach', to, from)
})
</script>

<style scoped></style>
```
:::

> [!INFO]
> 如果创建了 `app.vue`，一定要保留 `NuxtPage`，否则页面不会渲染。全局路由守卫在 Nuxt 中更推荐用 `middleware/*.global.ts`，这样 SSR/CSR 逻辑更一致。

关联知识点：

- `NuxtPage` 相当于 `vue-router` 的 `RouterView`
- `NuxtLayout` 会根据页面的 `definePageMeta({ layout })` 切换布局，默认使用 `layouts/default.vue`
- 全局样式除了写在 `app.vue`，也可以通过 `nuxt.config.ts` 的 `css` 字段统一引入

## 2.Nuxt3 目录结构

一个典型的 Nuxt3 项目结构如下（与图一致，补充了少量说明）：

::: file-tree

- hello-nuxt # Nuxt3 项目名称
  - assets # 资源目录（参与打包处理，如 scss、图片）
  - components # 组件目录（自动导入）
  - composables # 组合式 API 目录（自动导入）
  - layouts # 布局目录（部分资料写 layout）
  - pages # 页面目录，基于文件结构自动生成路由
    - index.vue # 项目首页
  - plugins # 插件目录（defineNuxtPlugin）
  - public # 静态资源目录（不参与打包，原样输出）
  - app.vue # 应用入口
  - app.config.ts # 应用配置（defineAppConfig）
  - nuxt.config.ts # Nuxt 框架配置（css、ssr、vite、app、modules 等）
  - package-lock.json # 依赖锁文件（npm）
  - package.json # 项目描述与脚本
  - README.md # 项目说明
  - tsconfig.json # TypeScript 配置
  :::

> [!NOTE]
> 目录之外还常见 `middleware/`（路由中间件）与 `server/`（Nitro 服务端路由/API）。它们不在图里，但在真实项目中非常常见。

## 3.常用脚本

图中脚本来自 `package.json`：

```json
{
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  }
}
```

- `nuxt dev`：启动开发服务，支持 HMR 与调试
- `nuxt build`：生成生产构建产物
- `nuxt generate`：生成静态站点（SSG）产物
- `nuxt preview`：本地预览生产构建或静态产物
- `nuxt prepare`：生成类型与自动导入（常用于 postinstall）

## 4.nuxt.config 与配置体系

`nuxt.config.ts` 位于项目根目录，用于配置框架能力，例如 `css`、`ssr`、`vite`、`app`、`modules` 等。配置的重点通常集中在 `runtimeConfig` 与 `appConfig`。

### 4.1 runtimeConfig（运行时配置）

`runtimeConfig` 主要用于“运行时可变”的配置，默认仅服务端可读；只有 `public` 字段会暴露到客户端。

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: 'aabbcc', // 仅服务端
    public: {
      baseURL: 'https://api.example.com',
    },
  },
})
```

在组件或服务端代码中使用：

```vue
<script lang="ts" setup>
const config = useRuntimeConfig()

if (process.server) {
  console.log('API secret:', config.apiSecret)
}
</script>
```

#### 客户端 / 服务端判断与可访问范围

在 Nuxt 中，最常用的环境判断是：

- `process.server`：服务端为 true
- `process.client`：客户端为 true
- `import.meta.server` / `import.meta.client`：在 Vite 环境中也可用

`runtimeConfig` 的访问范围是：  
服务端可以读取全部字段；客户端只能读取 `runtimeConfig.public`。这也是为什么密钥只放在非 public 部分。

```ts
const config = useRuntimeConfig()

if (process.client) {
  // 仅能访问 public
  console.log(config.public.baseURL)
}

if (process.server) {
  // 可访问完整配置
  console.log(config.apiSecret)
}
```

> [!INFO]
> `runtimeConfig` 可以被环境变量覆盖。常见约定是使用 `NUXT_` 与 `NUXT_PUBLIC_` 前缀，例如：`NUXT_API_SECRET`、`NUXT_PUBLIC_BASE_URL`。

### 4.2 appConfig（应用配置）

`appConfig` 用于“构建时确定”的公共配置，例如主题、品牌色、功能开关等。它可以写在 `nuxt.config.ts`，也可以独立放在 `app.config.ts`：

```ts
// app.config.ts
export default defineAppConfig({
  theme: 'light',
})
```

```vue
<script lang="ts" setup>
const appConfig = useAppConfig()
</script>
```

> [!NOTE]
> `appConfig` 会暴露给客户端，不适合存放密钥。需要保密或随环境变化的配置请使用 `runtimeConfig`。

### 4.3 在 env 定义环境变量

Nuxt 会读取项目根目录的 `.env` 文件。你可以把环境变量放在这些文件里，按环境拆分：  
`.env`、`.env.local`、`.env.development`、`.env.production` 等。

```bash
# .env
NUXT_API_SECRET=server_secret
NUXT_PUBLIC_BASE_URL=https://api.example.com
```

对应规则：  

- `NUXT_` 前缀：写入 `runtimeConfig`（仅服务端可读）
- `NUXT_PUBLIC_` 前缀：写入 `runtimeConfig.public`（客户端可读）

> [!INFO]
> 生产环境中通常通过部署平台注入环境变量，而不是在仓库中提交真实的 `.env` 文件。
