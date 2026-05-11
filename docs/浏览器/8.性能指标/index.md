---
title: Web 性能指标
createTime: 2026/04/18 18:53:36
permalink: /浏览器/a7f3c9d2/
---

## Lighthouse 核心指标

### FCP

FCP（First Contentful Paint）表示 **用户导航到页面后，浏览器第一次渲染出有内容的 DOM 所用时间**

:::details FCP 差通常表现为：

- 页面打开后长时间白屏
- HTML 已返回，但 CSS / JS 阻塞导致内容迟迟不绘制
- 字体加载策略不当，文本不可见
- SPA 首屏依赖 JS 执行完成后才生成内容

:::

### LCP

LCP（Largest Contentful Paint）表示 **视口内最大的内容元素完成渲染的时间**。通常为首屏大图、Banner、首段大文本等

:::details LCP 差通常表现为：

- 页面不是白屏，但最重要的主图或标题很晚出现
- 首屏先出现骨架或导航，主体内容延迟很久
- 图片请求很晚才开始，或者下载很慢
- 主图已下载完成，但主线程忙，迟迟不能渲染

:::

### TTI

TTI（Time to Interactive）表示 **页面达到可稳定交互的时间**

:::info
历史上它曾是 Lighthouse Performance 的评分指标，用来描述页面看起来可用到真正可交互之间的差距。TTI 对异常网络请求和长任务比较敏感，波动较大。Lighthouse 10 之后，TTI 不再作为 Performance 评分指标
:::

### CLS

CLS（Cumulative Layout Shift）==累计布局偏移=={.important}，用于衡量 **页面加载过程中，元素有没有突然移动，导致用户视觉位置变化**

:::details CLS 差时的常见表现：

- 图片加载后把下面内容顶下去
- 广告、推荐位、弹窗、异步模块插入后页面跳动
- 字体加载完成后文本宽高变化
- 顶部提示条、Cookie 横幅、活动挂件突然插入
- 动画使用 `top`、`left`、`height` 等布局属性导致周围内容重排

:::

### INP

INP（Interaction to Next Paint）表示 ==交互到下一次绘制耗时=={.important}，用于衡量 **用户点击、输入、按键之后，页面多久能给出视觉反馈**

:::details INP 差的常见原因：

- 交互事件回调中同步工作过多
- 点击后触发大范围状态更新和 DOM 重排
- 大列表渲染、复杂表格、富文本编辑器、图表计算阻塞主线程
- 布局抖动、强制同步布局、复杂样式计算导致下一帧延迟

:::

### TTFB

TTFB（Time to First Byte）表示 **从用户发起导航请求到浏览器收到 HTML 响应第一个字节的时间**

> [!IMPORTANT]
> TTFB 影响所有后续加载指标。HTML 第一字节不回来，浏览器就无法发现 CSS、JS、图片、字体，也无法开始构建 DOM。因此 TTFB 高会直接拖慢 FCP、LCP 和 Speed Index

### TBT

TBT（Total Blocking Time）表示 **FCP 到 TTI 之间，主线程被长任务阻塞的总时间**

:::details TBT 差时的常见表现：

- 页面内容出现了，但点击、滚动、输入没有及时反馈
- DevTools Performance 中长任务密集
- Lighthouse 报告 `Reduce JavaScript execution time`、`Minimize main-thread work`

:::

:::note
超过 50ms 的任务被视为 Long Task，超出 50ms 的部分会计入 TBT。一个 120ms 的任务会贡献 70ms TBT
:::

### Speed Index

Speed Index 用于衡量 **用户视觉上看到内容逐渐出现的速度**。Speed Index 会通过每一帧页面可见内容占比，计算一个综合分数

:::details Speed Index 差时的常见表现：

- 页面前几秒几乎没有有效内容
- 首屏只有 loading、空白壳或大面积占位
- 内容不是逐步出现，而是等 JS 完成后一次性出现
- 首屏图片、字体、CSS、接口请求形成长链路

:::

## Core Web Vitals 与 Lighthouse

Core Web Vitals 当前核心指标是：

:::table full-width

| 指标 | 体验维度 | 良好阈值 |
| --- | --- | --- |
| LCP | 加载体验 | ≤ 2.5s |
| INP | 交互响应 | ≤ 200ms |
| CLS | 视觉稳定性 | ≤ 0.1 |

:::

Lighthouse Performance 评分指标中包含 LCP 和 CLS，但不直接测 INP。因为 Lighthouse 是一次自动加载实验，没有真实用户交互，所以它用 TBT 作为交互风险的实验室代理指标。Lighthouse 的 Performance 分数是多个指标分数的加权平均。当前常见权重如下：

:::table full-width

| 指标 | 权重 | 主要体验维度 |
| --- | ---: | --- |
| TBT | 30% | 主线程阻塞、交互风险 |
| LCP | 25% | 主内容加载 |
| CLS | 25% | 视觉稳定性 |
| FCP | 10% | 首次内容绘制 |
| Speed Index | 10% | 可视进度 |

:::

:::note
Core Web Vitals 适合评价真实用户体验，Lighthouse 适合本地诊断和回归检查。两者是互补关系
:::

## 优化思路

浏览器性能指标优化，核心可以抽象成四个方向：更早返回 HTML、更快发现和下载关键资源、更少阻塞主线程、更稳定地完成布局和渲染

:::table full-width

| 核心优化方向 | 具体优化手段 | 主要影响指标 | 本质 |
| --- | --- | --- | --- |
| 更早返回 HTML | 合理选择 SSR / SSG / CSR、提升缓存命中率、减少服务端计算 | TTFB、FCP、LCP | 让浏览器更早拿到可解析的 HTML，缩短首屏等待时间 |
| 更快发现和下载关键资源 | 优化首屏资源优先级、减少关键渲染路径阻塞、缩短资源下载时间、延迟非关键资源 | FCP、LCP、Speed Index | 让关键 CSS、字体、图片、脚本更早被发现、下载和使用 |
| 更少阻塞主线程 | 降低初始包体积、减少 JS 解析和执行、拆分长任务、延迟非关键脚本 | TBT、INP、LCP、Speed Index | 减少 JS 下载、解析、编译、执行和渲染任务对主线程的占用 |
| 更稳定地完成布局和渲染 | 图片设置宽高、字体加载优化、预留广告/异步内容空间、避免动态插入导致重排 | CLS、LCP、Speed Index | 减少布局抖动，让页面稳定、连续地完成视觉呈现 |

:::

### 更早返回 HTML

浏览器只有拿到 HTML 后，才能开始解析页面结构，并发现 CSS、JS、图片、字体等资源。如果返回 HTML 速度较慢，那么后面资源的发现和渲染都会被推迟

```txt
HTML 返回慢
↓
资源发现推迟
↓
DOM / CSSOM 构建推迟
↓
FCP 推迟
↓
LCP 推迟
↓
Speed Index 变差
```

> [!IMPORTANT]
>
> 能更早的返回 HTML 主要影响 TTFB、FCP、LCP 和 Speed Index

#### 减少服务端耗时处理

服务端耗时处理主要来自于：`数据库查询慢`、`接口调用串行`、``SSR 阶段等待过多数据``、`数据返回体积过大`、`缓存命中低`

> [!IMPORTANT] 常见优化
>
> - 只查询首屏必要字段
> - 接口并行请求（Promise.all 等），避免瀑布流
> - SSR 中只等待首屏必要数据，非首屏数据异步补充
> - 热点数据使用 Redis/内存缓存
> - 接口做缓存、降级或异步补充

#### 减少重定向

[+HSTS]: HTTP Strict Transport Security，HTTP 严格传输安全，是一种 web 安全策略机制，帮助网站抵御协议降级攻击和 cookie 劫持攻击。启用 HSTS 后，浏览器会自动将 HTTP 请求升级为 HTTPS，避免不必要的重定向

:::details 重定向会增加额外的网络往返，例如：

```txt
http://example.com
↓ 301
https://example.com
↓ 301
https://www.example.com
↓ 200
```

:::

> [!IMPORTANT] 常见优化
>
> - 内部链接直接使用最终地址
> - 开启 HSTS[+HSTS]
> - 避免 http -> https -> www 多级跳转

#### 使用 CDN / 边缘缓存 HTML

[+stale-while-revalidate]: HTTP 缓存策略，含义是：缓存过期后，先返回旧缓存，后台再偷偷更新

让 CDN 节点缓存 HTML，而不是每次都回源服务器。这样可以降低 TTFB，也会间接改善 FCP、LCP、Speed Index

:::code-tabs

@tab 没有边缘缓存：

```txt
用户
↓
源站服务器 SSR
↓
返回 HTML
```

@tab 有边缘缓存：

```txt
用户
↓
最近的 CDN 节点
↓
直接返回 HTML
```

:::

> [!IMPORTANT]
> 核心是让响应头告诉 CDN：
>
> ```http
> Cache-Control: public, s-maxage=60, stale-while-revalidate=300
> ```
>
> 其中：
>
> - `public`：允许 CDN 缓存
> - `s-maxage=60`：CDN 缓存 60 秒
> - `stale-while-revalidate`[+stale-while-revalidate]：过期后可以先返回旧缓存，同时后台更新

#### 对匿名用户页面做静态化或半静态化

匿名用户页面指未登录用户访问的页面，例如：官网、博客、商品详情页等。因为这类页面通常所有用户看到的内容差不多，所以没必要每次请求都实时 SSR

静态化就是构建时提前生成 HTML。半静态化就是介于 SSR 和 SSG 之间，页面不是每次都请求实时生成，而是间隔一段时间生成一次

### 更快解析 HTML

HTML 解析过程中，如果遇到同步脚本，浏览器会暂停解析 HTML，先下载、解析并执行脚本，之后才继续解析 HTML

```js
<script src="/assets/app.js"></script>
```

> [!IMPORTANT]
>
> 能够更快的解析 HTML 主要影响 FCP、LCP 和 Speed Index

#### 使用 defer

`defer` 会让脚本下载与 HTML 并行执行，并在 HTML 解析之后执行，且多个 `defer` 脚本会按顺序执行，适合应用主脚本以及有依赖顺序的业务代码

```html
<script src="/assets/app.js" defer></script>
```

#### 使用 async

`async` 也会让脚本下载与 HTML 并行，但它会在下载后立即执行，就会导致 HTML 解析阻塞，且执行先后顺序时机不可控，不适合有依赖顺序的业务代码

```html
<script src="/assets/analytics.js" async></script>
```

#### 减少 HTML 体积和 DOM 规模

HTML 过大也会影响解析速度。例如：表格一次性渲染大量行、输出大量非首屏 DOM

> [!IMPORTANT] 常见优化
>
> - 非首屏内容延迟加载
> - 大量列表使用分页或虚拟列表
> - 首屏只输出必要 DOM

### 更快构建 CSSOM

[+为什么阻塞渲染]: CSS 阻塞渲染 != CSS 阻塞 HTML 解析。浏览器渲染页面需要构建 DOM 树、计算样式、布局、绘制等步骤，浏览器必须先知道元素的大小、位置等才能够布局和绘制

CSS 会阻塞渲染[+为什么阻塞渲染]，浏览器需要拿到并解析关键 CSS，才能完成首次绘制

```txt
HTML -> DOM
CSS -> CSSOM
DOM + CSSOM -> Render Tree -> Layout -> Paint
```

> [!IMPORTANT]
>
> 能够更快的构建 CSSOM 主要影响 FCP、LCP 和 Speed Index、CLS

#### 提取首屏关键 CSS 和减少阻塞 CSS 体积

[+例如]: UI 组件库样式全量引入、非首屏模块样式过早加载等

首屏需要的 CSS 尽早加载，非首屏 CSS 延后加载。且关键路径的 CSS 体积应尽量小[+例如]，以减少渲染阻塞时间

> [!IMPORTANT] 常见优化
>
> - 提取首屏关键 CSS
> - 按页面拆分 CSS
> - 组件样式按需加载
> - 压缩 CSS
> - 使用 CSS Tree Shaking 移除未使用 CSS

#### 注意 CSS 和 JS 的相互影响

CSS 也可能阻塞同步 JS 执行。因为在 JS 中可能会访问样式信息（例如：`getComputedStyle`），如果 CSS 没有加载完成，浏览器就无法正确计算样式，就会阻塞 JS 执行，直到关键 CSS 加载完成

### 更早发现关键资源

有些资源虽然首屏需要，但是浏览器发现的太晚。例如字体藏在 CSS 里、首屏图由 JS 渲染后才出现

> [!IMPORTANT]
>
> 能更早发现关键资源主要影响 FCP、LCP 和 Speed Index

#### 使用 preconnect

`preconnect` 用来提前建立 DNS/TCP/TLS 连接

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
```

#### 使用 preload

`preload` 用来提前告诉浏览器这些资源的存在，让它们更早被发现和下载

:::code-tabs

@tab 提前加载字体

```html
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

@tab 提前加载图片

```html
<link
  rel="preload"
  as="image"
  href="/images/hero.avif"
/>
```

:::

#### 使用 fetchpriority

[+fetchpriority]: `fetchpriority` 是一个新的 HTML 属性，用于控制资源的加载优先级。对于首屏关键资源，可以设置 `fetchpriority="high"`，让浏览器优先加载这些资源

对于首屏关键图片，可以使用 `fetchpriority`：

```html
<img
  src="/images/hero.avif"
  width="1200"
  height="630"
  alt="首屏主图"
  fetchpriority="high"
/>
```

FCP 差经常不是单个资源特别慢，而是首屏关键路径上资源太多，导致下载和解析时间过长

> [!IMPORTANT] 常见优化
>
> - 首屏图片压缩，使用合适的图片格式，例如：WebP、AVIF；设置明确的宽高
> - 非首屏模块使用动态导入、懒加载

### 更快下载关键资源

资源下载慢会影响渲染，但资源下载完成后还会继续产生后续成本。例如：图片下载完成后还要解码、JS 下载完成后还要解析和执行、字体下载完成后还要进行字体交换等等

> [!IMPORTANT]
>
> 更快下载关键资源主要影响 FCP、LCP、Speed Index、TBT

#### 图片优化

> [!IMPORTANT] 常见优化
>
> - 使用合适尺寸
> - 使用 AVIF / WebP 等现代格式
> - 明确设置宽高
> - 使用 CDN 图片裁剪、压缩、格式转换

#### 字体优化

字体会影响：FCP、LCP、CLS。常见的问题就是：字体文件过大、字符加载导致文本不可变、fallback 字体和正式字体尺寸差异过大导致 CLS

:::tip
对于字体资源可以使用 `font-display: swap`，避免文本长时间不可见。但可能带来字体切换时的布局变化，所以要选择尺寸接近的 fallback 字体。必要时可以使用 CSS Fonts 的 size-adjust 来减少字体切换导致的布局变化
:::

#### JS 资源优化

JS 资源不仅仅是下载成本，还包括了解析、编译、执行、触发渲染更新的成本

> [!IMPORTANT] 常见优化
>
> - 路由懒加载（代码分割）
> - 组件动态导入
> - Tree Shaking 移除未使用代码
> - 减少 Polyfill
> - 减少三方依赖
> - 避免首屏加载图标等大型库

#### 压缩和传输优化

> [!IMPORTANT] 常见优化
>
> - Gzip
> - CDN
> - HTTP/2 或 HTTP/3
> - 静态资源长缓存，配合 hash 版本控制

## Vite 环境下的性能优化实践

:::::steps

1. Rollup 产物优化思路

    Vite 默认会：

    :::details Vite 生产构建默认能力

    - 以 HTML 作为入口分析依赖
    - 对生产代码做压缩
    - 对静态资源加 hash
    - 对动态导入生成异步 chunk
    - 对 CSS 进行抽取和代码分割
    - 对模块 preload 依赖做处理

    :::

2. `manualChunks` 控制拆包

    ```ts
    // vite.config.ts
    import { defineConfig } from 'vite'

    export default defineConfig({
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (!id.includes('node_modules')) return

              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'framework'
              }

              if (id.includes('echarts')) {
                return 'echarts'
              }

              if (id.includes('monaco-editor')) {
                return 'monaco'
              }

              return 'vendor'
            },
          },
        },
      },
    })
    ```

    这类配置的目标：

    :::details manualChunks 配置目标

    - 框架依赖稳定缓存
    - 大型低频依赖独立出来
    - 避免首页被 `vendor` 巨包拖慢
    - 让缓存失效范围更小

    :::

    > [!IMPORTANT]
    > 但 chunk 不是越碎越好。过多 chunk 会增加请求调度成本，尤其在首屏关键路径上。拆包要结合 Network waterfall 和真实页面路径验证

3. 动态导入与路由懒加载

    ```ts
    const routes = [
      {
        path: '/',
        component: () => import('./pages/Home.vue'),
      },
      {
        path: '/report',
        component: () => import('./pages/Report.vue'),
      },
    ]
    ```

    Vite 会把动态导入拆成异步 chunk。它影响 Lighthouse 的方式与 Webpack 类似：

    :::details 对 Lighthouse 指标的影响

    - 首屏 JS 变小，改善 FCP、Speed Index
    - 解析和执行减少，改善 TBT
    - 大型页面模块延后加载，降低首页压力

    :::

    需要避免：

    :::details 需要避免的问题

    - 把首屏 LCP 内容所在组件懒加载得过深
    - 首页为了懒加载切出过多小 chunk，导致请求瀑布
    - 所有第三方依赖仍进入首屏 vendor

    :::

4. 第三方库拆包

    对于图表、编辑器、地图等大依赖，最好按业务场景加载：

    ```ts
    async function openChart() {
      const [{ initChart }, data] = await Promise.all([
        import('./chart/initChart'),
        fetch('/api/chart').then(res => res.json()),
      ])

      initChart(data)
    }
    ```

    :::note
    这里的优化点是并行化：chunk 下载和数据请求同时进行，避免"先请求数据，再下载图表库"的瀑布
    :::

5. 资源预加载行为

    Vite 会为部分动态导入依赖生成 modulepreload，以减少异步 chunk 的加载瀑布。工程上需要理解：

    :::details modulepreload 需要理解的点

    - modulepreload 有助于提前下载当前异步 chunk 依赖
    - 过多预加载可能抢占首屏关键资源
    - 对首屏关键图片和字体，仍应显式设置 preload / fetchpriority

    :::

    ```html
    <link rel="preload" as="image" href="/images/hero.avif" />
    ```

    > [!IMPORTANT]
    > Vite 的 modulepreload 主要服务 JS chunk 依赖，不会自动判断你的 LCP 图片

6. 静态资源处理

    Vite 默认会对小于阈值的资源做 base64 内联。可以通过 `assetsInlineLimit` 控制：

    ```ts
    export default defineConfig({
      build: {
        assetsInlineLimit: 4096,
      },
    })
    ```

    原则：

    :::details 内联与外链取舍原则

    - 小图标、小装饰资源可以内联，减少请求
    - 大图片不要内联到 JS / CSS 中，否则会膨胀关键资源
    - LCP 图片应保持独立文件，便于浏览器调度优先级和 CDN 缓存

    :::

7. 图片压缩与现代格式

    Vite 不会自动把所有图片压成最佳格式。工程中通常结合：

    :::details 图片优化组合

    - CDN 图片服务
    - 构建期图片压缩插件
    - 上传链路生成多尺寸、多格式图片
    - `<picture>` 提供 AVIF / WebP fallback

    :::

    ```html
    <picture>
      <source srcset="/hero.avif" type="image/avif" />
      <source srcset="/hero.webp" type="image/webp" />
      <img src="/hero.jpg" width="1200" height="630" alt="首屏主图" />
    </picture>
    ```

    :::note
    这主要影响 LCP、Speed Index 和流量成本
    :::

8. CSS 分包与按需加载

    Vite 默认支持 CSS code splitting。异步 JS chunk 引用的 CSS 会跟随拆分

    ```ts
    export default defineConfig({
      build: {
        cssCodeSplit: true,
      },
    })
    ```

    开启 CSS 分包通常有利于避免首页加载全站样式。但要注意：

    :::details CSS 分包注意点

    - 首屏关键 CSS 如果分散在多个异步组件里，可能导致样式延后
    - 大型组件库样式应按需引入
    - 未使用 CSS 需要配合框架插件或样式治理删除

    :::

9. `import.meta.glob`

    `import.meta.glob` 适合文件路由、文档、组件按需导入等场景

    ```ts
    const pages = import.meta.glob('./pages/**/*.vue')

    export async function loadPage(path: string) {
      const loader = pages[`./pages/${path}.vue`]
      return loader?.()
    }
    ```

    默认是懒加载。不要为了方便使用 `{ eager: true }` 把所有页面同步打进首包

    ```ts
    // 谨慎使用：会把匹配模块同步引入
    const pages = import.meta.glob('./pages/**/*.vue', { eager: true })
    ```

    > [!IMPORTANT]
    > 这会直接增加首屏 JS，影响 FCP、TBT 和 Speed Index

10. 依赖预构建与线上性能的区别

    Vite 的依赖预构建主要服务开发环境：

    :::details 依赖预构建服务开发环境

    - 把 CommonJS / UMD 依赖转换为 ESM
    - 合并大量小模块，减少开发时浏览器请求
    - 提升 dev server 冷启动和 HMR 体验

    :::

    :::note
    它不等于线上自动优化。线上仍由 Rollup 打包，最终性能取决于生产构建产物、资源部署和运行时执行成本
    :::

    > [!IMPORTANT]
    > 不要把"Vite dev 很快"误认为"线上页面一定快"

11. SSR 场景下的性能思路

    Vite SSR 要关注两条链路：

    :::details Vite SSR 的两条链路

    1. 服务端渲染链路：影响 TTFB、FCP、LCP
    2. 客户端 hydration 链路：影响 TBT、INP

    :::

    优化建议：

    :::details Vite SSR 优化建议

    - SSR 数据并发获取
    - 对页面片段或完整 HTML 做缓存
    - 使用 streaming SSR 尽早返回头部和首屏内容
    - 非首屏组件延迟 hydration
    - 避免首屏一次性序列化巨大状态
    - 对大型交互组件做客户端懒加载

    :::

    :::note
    SSR 的目标不是把所有事情都提前到服务端，而是让首屏关键内容更早可见，同时控制客户端接管成本
    :::

12. 分析 Vite 构建产物

    可以使用 `rollup-plugin-visualizer`：

    ```ts
    import { defineConfig } from 'vite'
    import { visualizer } from 'rollup-plugin-visualizer'

    export default defineConfig({
      plugins: [
        visualizer({
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    })
    ```

    分析重点：

    :::details Vite 构建产物分析重点

    - 首页入口 chunk 是否过大
    - `vendor` 是否包含低频大依赖
    - 某些库是否因导入方式错误导致全量打包
    - 是否存在重复版本
    - CSS 是否被全量引入
    - 动态导入是否符合路由和交互路径

    :::

13. Vite 如何服务 Lighthouse 指标

    | Vite 手段 | 影响链路 | 主要指标 |
    | --- | --- | --- |
    | `manualChunks` | 控制首屏和缓存粒度 | FCP、TBT、Speed Index |
    | 动态导入 | 延迟非关键代码 | FCP、TBT、INP 风险 |
    | CSS code splitting | 避免全站 CSS 阻塞首页 | FCP、LCP |
    | 静态资源 hash | 提升长期缓存 | FCP、LCP |
    | `assetsInlineLimit` | 控制内联与请求取舍 | FCP、LCP |
    | `import.meta.glob` | 批量模块按需加载 | TBT、Speed Index |
    | SSR / SSG | 首屏 HTML 直出 | FCP、LCP、TTFB |
    | visualizer | 定位大包和重复依赖 | 所有加载与执行相关指标 |

:::::

## Webpack 环境下的性能优化实践

:::::steps

1. `splitChunks` 代码分割

    ```js
    // webpack.config.js
    module.exports = {
      mode: 'production',
      optimization: {
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 20 * 1024,
          cacheGroups: {
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|vue)[\\/]/,
              name: 'framework',
              priority: 30,
              enforce: true,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      },
    }
    ```

    这类配置的影响：

    :::details splitChunks 配置影响

    - 抽离框架和第三方依赖，提升长期缓存命中
    - 避免业务代码变化导致 vendor 缓存失效
    - 减少重复依赖进入多个 chunk
    - 控制首屏包体积，降低下载和 JS 执行成本

    :::

    对应 Lighthouse 指标：

    :::details 对应 Lighthouse 指标

    - 初始 JS 变小，有利于 FCP、Speed Index
    - 主线程执行减少，有利于 TBT
    - 缓存命中提升，有利于重复访问时的 LCP 和 FCP

    :::

2. 动态 `import()` 与路由级懒加载

    ```js
    const routes = [
      {
        path: '/dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ './pages/Dashboard'),
      },
      {
        path: '/editor',
        component: () => import(/* webpackChunkName: "editor" */ './pages/Editor'),
      },
    ]
    ```

    路由级懒加载适合 SPA。它把非当前路由代码移出首包，减少首屏下载、解析、执行成本

    需要注意：

    :::details 路由级懒加载注意点

    - 不要把首屏必须组件也懒加载到很深，导致 LCP 内容发现过晚
    - 对用户即将访问的路由可使用 prefetch
    - 大型依赖应结合业务路径拆包，而不是全部塞进 vendors

    :::

3. Tree Shaking 与 `sideEffects`

    Tree Shaking 依赖 ESM 静态结构，并且要求包声明副作用边界

    ```json
    {
      "sideEffects": [
        "*.css",
        "*.scss"
      ]
    }
    ```

    如果项目代码没有副作用，可以更激进：

    ```json
    {
      "sideEffects": false
    }
    ```

    > [!IMPORTANT]
    > 但要谨慎：全局样式、polyfill、注册逻辑、埋点初始化都可能是副作用。错误声明会导致代码被删除

    :::note
    Tree Shaking 影响的是最终 JS 体积和执行量，主要改善 TBT、FCP 和 Speed Index
    :::

4. 生产模式构建优化

    `mode: 'production'` 会启用默认压缩、作用域提升、Tree Shaking 等优化。不要用 development 产物上线

    ```js
    module.exports = {
      mode: 'production',
      devtool: 'source-map',
    }
    ```

    生产 source map 策略要平衡调试和体积：

    :::details 生产 source map 策略

    - `source-map`：适合需要线上错误定位，可不对外暴露 map 文件
    - `hidden-source-map`：错误监控可用，但不在 bundle 中暴露引用
    - 不建议生产使用 `eval-*`，会影响安全和执行效率

    :::

    :::note
    source map 本身不应被用户主流程下载，否则会浪费带宽
    :::

5. CSS 抽离与压缩

    ```js
    const MiniCssExtractPlugin = require('mini-css-extract-plugin')
    const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

    module.exports = {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].css',
        }),
      ],
      optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
      },
    }
    ```

    CSS 抽离可以让 CSS 与 JS 并行加载，并利用浏览器缓存。但如果抽离出一个巨大 CSS 文件，也会阻塞 FCP。更好的策略是：

    :::details CSS 抽离策略

    - 首屏关键 CSS 小而稳定
    - 异步路由的 CSS 跟随对应 chunk 加载
    - 删除未使用 CSS

    :::

6. 图片资源处理策略

    Webpack 5 可以使用 Asset Modules：

    ```js
    module.exports = {
      module: {
        rules: [
          {
            test: /\.(png|jpe?g|webp|avif|svg)$/i,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 4 * 1024,
              },
            },
            generator: {
              filename: 'images/[name].[contenthash:8][ext]',
            },
          },
        ],
      },
    }
    ```

    资源内联与外链取舍：

    :::details 资源内联与外链取舍

    - 小图标内联可减少请求
    - 大图片内联会膨胀 JS / CSS，推迟解析和渲染
    - LCP 大图通常应作为独立资源，让浏览器单独调度优先级

    :::

    :::note
    图片优化应结合构建插件、CDN 图片服务或上传链路完成，Webpack 只负责产物引用和 hash 不是全部
    :::

7. 长期缓存与 contenthash

    ```js
    module.exports = {
      output: {
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].[contenthash:8].js',
        clean: true,
      },
    }
    ```

    配合服务端缓存：

    ```http
    Cache-Control: public, max-age=31536000, immutable
    ```

    > [!IMPORTANT]
    > 长期缓存的关键是文件名内容变才变。否则用户可能拿到旧资源或缓存频繁失效

8. preload / prefetch

    Webpack 支持通过魔法注释生成资源提示：

    ```js
    import(
      /* webpackChunkName: "chart" */
      /* webpackPrefetch: true */
      './ChartPanel'
    )
    ```

    :::note
    `prefetch` 适合未来可能访问的资源，浏览器空闲时下载。`preload` 适合当前导航马上需要的资源，优先级更高
    :::

    > [!IMPORTANT]
    > 不要滥用 preload。过多高优先级资源会挤占 LCP 图片、关键 CSS、字体等真正关键资源

9. 第三方依赖拆分

    不要简单把所有 `node_modules` 打成一个巨大的 vendors。问题是：

    :::details vendors 巨包的问题

    - 任一依赖变化可能导致整个 vendors hash 变化
    - 首屏可能下载当前页面不需要的大依赖
    - 大 vendors 执行成本高，拉高 TBT

    :::

    更合理的策略：

    :::details 更合理的依赖拆分策略

    - 框架核心单独拆
    - 大型低频依赖按业务路由懒加载
    - 图表、编辑器、地图不要进入首页首包
    - 重复依赖通过 `npm ls`、`pnpm why`、bundle analyzer 检查

    :::

10. Bundle Analyzer 分析包体积

    ```js
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

    module.exports = {
      plugins: [
        process.env.ANALYZE && new BundleAnalyzerPlugin(),
      ].filter(Boolean),
    }
    ```

    分析时重点看：

    :::details Bundle Analyzer 分析重点

    - 首屏入口 chunk 多大
    - vendors 中是否有低频大依赖
    - 是否存在重复版本依赖
    - moment、lodash、echarts、monaco、地图 SDK 等是否按需加载
    - polyfill 是否过量

    :::

11. Babel 转译范围与 polyfill 控制

    过度转译会增加代码体积和运行时成本

    ```js
    module.exports = {
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    targets: '>0.5%, not dead, not op_mini all',
                    useBuiltIns: 'usage',
                    corejs: 3,
                  }],
                ],
              },
            },
          },
        ],
      },
    }
    ```

    优化点：

    :::details Babel 与 polyfill 优化点

    - 明确 browserslist，不要盲目兼容过老浏览器
    - `useBuiltIns: 'usage'` 避免全量 polyfill
    - 对现代浏览器可考虑 differential serving
    - 不必要时不要转译整个 `node_modules`

    :::

12. Webpack 如何服务 Lighthouse 指标

    | Webpack 手段 | 影响链路 | 主要指标 |
    | --- | --- | --- |
    | `splitChunks` | 减少重复代码，稳定缓存 | FCP、TBT、Speed Index |
    | 动态 `import()` | 移出非首屏代码 | FCP、TBT、Speed Index |
    | Tree Shaking | 删除未使用代码 | TBT、FCP |
    | CSS 抽离与压缩 | CSS 并行加载，减少阻塞体积 | FCP、LCP |
    | contenthash | 提升缓存命中 | FCP、LCP、TTFB 间接受益 |
    | 图片资源策略 | 控制图片发现与体积 | LCP、CLS |
    | Babel / polyfill 控制 | 降低 JS 体积和执行成本 | TBT、INP 风险 |
    | analyzer | 找到大包和重复依赖 | 所有加载与执行相关指标 |

:::::
