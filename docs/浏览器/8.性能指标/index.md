---
title: Web 性能指标
createTime: 2026/04/18 18:53:36
permalink: /浏览器/a7f3c9d2/
---

# Web 性能指标

Web 性能优化不是一句“页面要快”就能完成的工作。真正的性能优化需要把用户体验拆成可观测、可诊断、可验证的指标，再把指标背后的原因落到网络、渲染、脚本执行、资源加载和工程构建上。

本文以 Lighthouse 和 Core Web Vitals 为主线，系统梳理常见 Web 性能指标的含义、劣化原因、优化策略，以及在 Webpack 和 Vite 工程中的落地方式。

## 1. 什么是 Web 性能指标

前端性能不能只凭“感觉快”，原因有三个：

1. 不同用户的设备、网络、地理位置、浏览器状态不同，同一个页面在高端桌面设备上可能很快，在中低端 Android 设备上可能明显卡顿。
2. “快”本身不是单一体验。首屏是否尽快出现、主内容是否尽快可见、点击是否及时响应、页面是否跳动，分别对应不同的性能问题。
3. 没有指标就无法比较优化前后的收益，也无法在版本迭代中发现回退。

性能指标的价值在于把模糊体验拆成工程可处理的问题：

| 用户感受 | 典型指标 | 常见技术原因 |
| --- | --- | --- |
| 页面什么时候不再白屏 | FCP | HTML 慢、CSS 阻塞、字体阻塞、首屏资源过大 |
| 主体内容什么时候出现 | LCP | 大图慢、服务端慢、资源优先级低、CSR 渲染晚 |
| 首屏呈现是否平滑 | Speed Index | 首屏空壳、内容集中延后出现、关键 CSS 不合理 |
| 页面是否能及时响应 | TBT / INP | JS 执行过久、长任务、第三方脚本、hydration 成本高 |
| 页面是否稳定 | CLS | 图片无尺寸、广告异步插入、字体切换、动画触发布局 |
| 服务端第一字节是否及时 | TTFB | DNS / TCP / TLS / 服务端处理 / 缓存链路慢 |

Lighthouse 是一个实验室环境下的自动化性能分析工具。它会在受控网络和设备条件下加载页面，收集关键指标，并给出 Performance 分数、Opportunities、Diagnostics、Network、Main Thread 等诊断信息。

:::note
Lighthouse 分数不等于全部真实体验。它不能覆盖所有真实用户设备、网络、登录状态、个性化内容和完整交互路径，但它非常适合建立基线、发现明显瓶颈、做本地和 CI 中的性能回归检查。
:::

因此，性能优化应同时使用：

- Lighthouse：发现实验室环境中的加载与运行时瓶颈。
- Chrome DevTools Performance / Network：定位具体请求、长任务、布局与渲染问题。
- RUM（Real User Monitoring）：观察真实用户的 LCP、INP、CLS、TTFB 分布。
- Bundle Analyzer：分析构建产物体积、重复依赖和拆包策略。

## 2. Lighthouse 关注的核心指标

Lighthouse Performance 分数主要围绕加载速度、主线程阻塞和视觉稳定性展开。当前常见评分口径中，核心评分指标包括 FCP、Speed Index、LCP、TBT 和 CLS。Core Web Vitals 则更关注真实用户体验中的 LCP、INP、CLS。

### 2.1 FCP（First Contentful Paint）

FCP 表示用户导航到页面后，浏览器第一次渲染出有内容的 DOM 所用时间。这里的内容包括文本、图片、非白色 canvas、SVG 等，不包含 iframe 内部内容。

FCP 反映的是：==用户什么时候看到页面不是空白的==。

FCP 差时的常见表现：

- 页面打开后长时间白屏。
- HTML 已返回，但 CSS / JS 阻塞导致内容迟迟不绘制。
- 字体加载策略不当，文本不可见。
- SPA 首屏依赖 JS 执行完成后才生成内容。

常见劣化原因：

- TTFB 高，HTML 第一字节返回慢。
- 首屏 CSS 过大，或多个 CSS 文件串行阻塞渲染。
- 同步脚本阻塞 HTML 解析和渲染。
- 初始 JS 包过大，CSR 应用必须等 JS 下载、解析、执行后才有内容。
- Web Font 阻塞文本显示。
- 关键资源没有合理缓存或 CDN。

典型优化思路：

- 缩短服务端响应时间，降低 TTFB。
- 内联首屏 critical CSS，延迟非关键 CSS。
- 给非关键脚本加 `defer` / `async`，减少同步阻塞。
- 控制首屏 JS 包体积，避免首屏只返回空的 `#app`。
- 字体使用 `font-display: swap` 或合理的 fallback。
- 使用 `preconnect`、`preload` 提前建立连接或下载关键资源。

实战中优先关注：

1. Network 中 Document 请求是否慢。
2. 首屏前是否存在 render-blocking CSS / JS。
3. 页面是否 CSR 空壳，首屏内容是否必须等主包执行后才出现。

### 2.2 LCP（Largest Contentful Paint）

LCP 表示视口内最大的内容元素完成渲染的时间，通常用于近似判断页面主内容何时可见。LCP 元素常见于：

- 首屏大图、Banner、商品图。
- 文章标题或首段大文本。
- 视频封面图。
- 大块背景图或卡片图。

LCP 反映的是：==用户认为“页面主要内容已经加载出来”的时间点==。

LCP 差时的常见表现：

- 页面不是白屏，但最重要的主图或标题很晚出现。
- 首屏先出现骨架或导航，主体内容延迟很久。
- 图片请求很晚才开始，或者下载很慢。
- 主图已下载完成，但主线程忙，迟迟不能渲染。

常见劣化原因可以拆成四段：

| LCP 子阶段 | 问题含义 | 常见原因 |
| --- | --- | --- |
| TTFB | HTML 第一字节慢 | 服务端慢、SSR 慢、缓存未命中、跨地域访问 |
| Load Delay | LCP 资源发现晚 | 图片由 JS 注入、CSS 背景图、未 preload、懒加载误用 |
| Load Time | LCP 资源下载慢 | 图片过大、格式差、CDN 慢、未压缩 |
| Render Delay | 资源已就绪但渲染晚 | CSS 阻塞、JS 长任务、hydration、元素被隐藏 |

典型优化思路：

- 图片型 LCP：压缩、使用 AVIF / WebP、响应式图片、CDN、`preload`、`fetchpriority="high"`。
- 文本型 LCP：减少字体阻塞，确保 HTML 中已有文本内容，避免主标题由客户端晚生成。
- 服务端：缩短 TTFB，使用缓存、SSR 流式输出、边缘节点。
- 渲染链路：避免 LCP 元素被懒加载、动画延迟显示或依赖过重 JS。

实战中优先关注：

1. Lighthouse 是否标出 LCP element。
2. LCP 元素的请求是否足够早出现在 Network。
3. LCP 元素是图片、文本还是客户端渲染后的节点。
4. LCP 时间主要花在 TTFB、资源发现、下载还是渲染延迟。

### 2.3 Speed Index

Speed Index 衡量页面加载过程中可视区域内容显示的速度。它不是某一个单点时间，而是通过页面加载过程中的视觉进度计算得到。

Speed Index 反映的是：==用户看到页面逐步变完整的速度==。

Speed Index 差时的常见表现：

- 页面前几秒几乎没有有效内容。
- 首屏只有 loading、空白壳或大面积占位。
- 内容不是逐步出现，而是等 JS 完成后一次性出现。
- 首屏图片、字体、CSS、接口请求形成长链路。

常见劣化原因：

- SPA 首屏强依赖主包执行和接口返回。
- critical CSS 缺失，样式准备好之前无法展示。
- 首屏资源过多，浏览器下载队列拥塞。
- 骨架屏使用不当，只显示“假内容”，真实内容仍整体延迟。
- 大图、字体、第三方脚本抢占关键资源带宽。

典型优化思路：

- 让首屏可视区域尽早出现有意义内容，而不是只有空容器。
- 使用 SSR / SSG 或服务端直出关键 HTML。
- 内联关键 CSS，异步加载非首屏 CSS。
- 对首屏图片做尺寸、格式、优先级优化。
- 拆分非首屏模块，减少首屏执行成本。
- 骨架屏要接近真实布局，并配合真实内容尽快替换。

实战中优先关注：

Speed Index 不是单独优化的对象，它通常随 FCP、LCP、主线程阻塞和关键资源加载改善而改善。优化时应看 filmstrip：页面到底是逐步呈现，还是长时间空白后突然完成。

### 2.4 TBT（Total Blocking Time）

TBT 表示 FCP 到 TTI 之间，主线程被长任务阻塞的总时间。超过 50ms 的任务被视为 Long Task，超出 50ms 的部分会计入 TBT。例如一个 120ms 的任务会贡献 70ms TBT。

TBT 反映的是：==页面加载期间主线程有多长时间无法及时响应用户输入==。

TBT 差时的常见表现：

- 页面内容出现了，但点击、滚动、输入没有及时反馈。
- DevTools Performance 中长任务密集。
- Lighthouse 报告 `Reduce JavaScript execution time`、`Minimize main-thread work`。
- 移动端比桌面端明显更卡。

常见劣化原因：

- 首屏 JS 包过大，解析、编译、执行耗时长。
- 框架初始化、路由注册、状态恢复、埋点初始化集中执行。
- 大量同步计算、JSON 解析、列表渲染、复杂 diff。
- 第三方脚本过多，且在主线程执行。
- hydration 成本高，服务端 HTML 可见但客户端接管很慢。
- polyfill 或 Babel 转译过度，运行时代码膨胀。

典型优化思路：

- 代码分割，把首屏不需要的代码移出主包。
- 路由级懒加载和组件级懒加载。
- 拆分长任务，必要时使用 `requestIdleCallback`、`scheduler.postTask` 或分片执行。
- 重计算放入 Web Worker。
- 延迟非关键第三方脚本。
- 降低 hydration 成本，避免首屏一次性渲染超大 DOM。
- 删除重复依赖和大体积工具库。

实战中优先关注：

TBT 是实验室环境下诊断 INP 风险的重要代理指标。Lighthouse 不能真实测量用户完整生命周期中的 INP，但加载期的 TBT 高，通常意味着真实用户在页面加载期间更容易遇到响应延迟。

### 2.5 CLS（Cumulative Layout Shift）

CLS 衡量页面生命周期中非预期布局偏移的累积分数。它不是时间指标，而是根据视口中元素移动的影响范围和移动距离计算得到。

CLS 反映的是：==页面内容是否稳定，用户是否会因为布局跳动而误点或阅读中断==。

CLS 差时的常见表现：

- 图片加载后把下面内容顶下去。
- 广告、推荐位、弹窗、异步模块插入后页面跳动。
- 字体加载完成后文本宽高变化。
- 顶部提示条、Cookie 横幅、活动挂件突然插入。
- 动画使用 `top`、`left`、`height` 等布局属性导致周围内容重排。

常见劣化原因：

- 图片、视频、iframe 未声明尺寸或比例。
- 广告位、异步内容没有预留空间。
- Web Font fallback 与目标字体差异过大。
- 动态插入内容发生在已有内容上方。
- 使用会触发布局的 CSS 属性做动画。

典型优化思路：

- 给图片、视频、iframe 明确 `width` / `height` 或 `aspect-ratio`。
- 为广告、推荐、异步模块预留稳定占位。
- 字体使用合理 fallback，必要时用 `size-adjust` 降低字体切换差异。
- 新内容尽量在用户触发后出现，或插入到不影响当前阅读的位置。
- 动画优先使用 `transform` 和 `opacity`。

实战中优先关注：

Lighthouse 主要捕获加载阶段 CLS；真实用户数据还可能包含滚动、弹窗、异步刷新、广告竞价后的 post-load CLS。因此 CLS 必须结合 RUM 或 DevTools Live Metrics 观察。

### 2.6 TTI（Time to Interactive）

TTI 表示页面达到“可稳定交互”的时间。历史上它曾是 Lighthouse Performance 的评分指标，用来描述页面看起来可用到真正可交互之间的差距。

TTI 的问题在于对异常网络请求和长任务比较敏感，波动较大。Lighthouse 10 之后，TTI 不再作为 Performance 评分指标。现在更推荐关注：

- LCP：主内容是否尽快可见。
- TBT：加载期主线程是否被长任务阻塞。
- INP：真实用户交互是否及时反馈。

TTI 的工程价值仍然存在：它提醒我们不要只优化“看得见”，还要优化“点得动”。一个页面如果首屏很快出现，但主线程被 JS 长时间占用，用户仍然会觉得卡。

### 2.7 INP（Interaction to Next Paint）

INP 是 Core Web Vitals 中衡量交互响应性的稳定指标。它观察用户在页面生命周期内的点击、触摸、键盘交互延迟，并报告一个代表大多数交互体验的高延迟值。

INP 反映的是：==用户操作后，页面下一帧反馈是否及时出现==。

INP 与 TBT 的关系：

- TBT 是实验室指标，主要衡量加载阶段主线程阻塞。
- INP 是真实用户指标，覆盖页面整个生命周期中的交互。
- 优化 TBT 往往有助于改善 INP，但 TBT 好不代表 INP 一定好，因为用户可能在加载后触发复杂交互。

INP 差的常见原因：

- 交互事件回调中同步工作过多。
- 点击后触发大范围状态更新和 DOM 重排。
- 大列表渲染、复杂表格、富文本编辑器、图表计算阻塞主线程。
- 第三方脚本、埋点、A/B 实验在交互期间抢占主线程。
- 布局抖动、强制同步布局、复杂样式计算导致下一帧延迟。

优化 INP 的核心是减少一次交互的三段耗时：

1. Input Delay：交互开始到事件回调开始执行。
2. Processing Duration：事件回调本身执行耗时。
3. Presentation Delay：回调结束到下一帧绘制完成。

### 2.8 TTFB（Time to First Byte）

TTFB 表示从用户发起导航请求到浏览器收到 HTML 响应第一个字节的时间。

TTFB 影响所有后续加载指标。HTML 第一字节不回来，浏览器就无法发现 CSS、JS、图片、字体，也无法开始构建 DOM。因此 TTFB 高会直接拖慢 FCP、LCP 和 Speed Index。

TTFB 差的常见原因：

- DNS、TCP、TLS 建连耗时高。
- 服务端接口慢、数据库慢、SSR 渲染慢。
- HTML 没有缓存，每次都动态生成。
- 用户离源站太远，缺少 CDN 或边缘节点。
- 重定向链路过长。
- SSR 页面中存在接口瀑布流。

典型优化思路：

- CDN / 边缘缓存 HTML 或静态化页面。
- 使用 HTTP 缓存、反向代理缓存、服务端缓存。
- 减少重定向。
- 优化 SSR 数据获取，避免串行接口瀑布。
- 对可静态化页面使用 SSG / ISR。
- 使用压缩、HTTP/2 / HTTP/3、连接复用。

### 2.9 Core Web Vitals 与 Lighthouse 指标的关系

Core Web Vitals 当前核心指标是：

| 指标 | 体验维度 | 良好阈值 |
| --- | --- | --- |
| LCP | 加载体验 | ≤ 2.5s |
| INP | 交互响应 | ≤ 200ms |
| CLS | 视觉稳定性 | ≤ 0.1 |

Lighthouse Performance 评分指标中包含 LCP 和 CLS，但不直接测 INP。因为 Lighthouse 是一次自动加载实验，没有真实用户交互，所以它用 TBT 作为交互风险的实验室代理指标。

:::note
Core Web Vitals 更适合评价真实用户体验，Lighthouse 更适合本地诊断和回归检查。两者不是替代关系，而是互补关系。
:::

## 3. 如何正确理解 Lighthouse 报告

Lighthouse 的 Performance 分数是多个指标分数的加权平均。当前常见权重如下：

| 指标 | 权重 | 主要体验维度 |
| --- | ---: | --- |
| TBT | 30% | 主线程阻塞、交互风险 |
| LCP | 25% | 主内容加载 |
| CLS | 25% | 视觉稳定性 |
| FCP | 10% | 首次内容绘制 |
| Speed Index | 10% | 可视进度 |

这意味着：

- TBT、LCP、CLS 对总分影响更大。
- FCP 和 Speed Index 权重较低，但它们对首屏感知仍然重要。
- Opportunities 和 Diagnostics 本身不直接计入分数，但它们指出的问题会间接影响指标。

### 为什么同一个页面多次跑 Lighthouse 分数不同

Lighthouse 分数波动通常不一定是页面代码变化导致的，常见原因包括：

- 网络抖动、路由变化、DNS / TLS 状态不同。
- 服务器缓存是否命中。
- 第三方脚本、广告、A/B 实验返回不同内容。
- 本机 CPU 负载不同。
- 浏览器扩展注入脚本。
- 图片、字体、接口缓存状态不同。

因此不要用单次 Lighthouse 结果做绝对判断。更可靠的方式是：

- 同一环境跑多次，取中位数。
- 固定设备和网络条件。
- 在 CI 中使用 Lighthouse CI 观察趋势。
- 用真实用户数据验证线上收益。

### 实验室数据与真实用户数据的区别

| 类型 | 代表工具 | 优点 | 局限 |
| --- | --- | --- | --- |
| Lab Data | Lighthouse、WebPageTest、DevTools | 可复现、可调试、适合上线前检查 | 不能代表全部真实用户 |
| Field Data | CrUX、RUM、自建监控 | 真实设备和网络，反映线上体验 | 难定位，需要采样和上下文 |

实验室数据适合回答：“这个页面在受控环境下有哪些明显瓶颈？”

真实用户数据适合回答：“真实用户是否真的变快了？哪些用户、哪些页面、哪些设备最差？”

### 不要只盯总分

Lighthouse 90 分不等于没有性能问题。一个页面可能总分不错，但真实用户 INP 很差；也可能 Lighthouse CLS 很好，但线上广告导致 post-load CLS 很差。

正确看报告的顺序是：

1. 看 Metrics：确认是 FCP、LCP、TBT、CLS 还是 Speed Index 差。
2. 看 Opportunities：找到最可能影响指标的优化机会。
3. 看 Diagnostics：分析主线程、DOM、资源体积、第三方脚本等根因。
4. 看 Network：确认关键资源的发现时间、优先级、下载耗时、缓存状态。
5. 看 Main Thread：定位长任务、脚本执行、样式计算、布局、绘制成本。

例如：

- LCP 差，不要直接说“优化图片”，先看 LCP 元素是什么、请求何时开始、是不是被懒加载、下载慢还是渲染慢。
- TBT 差，不要只压缩 JS，先看长任务来自业务代码、框架初始化、第三方脚本还是 hydration。
- CLS 差，不要只给图片加宽高，还要检查广告位、字体、异步插入内容和 post-load 变化。

## 4. 各项指标的优化思路总览

Web 性能优化可以抽象成四个方向：

1. 更早返回 HTML。
2. 更快发现和下载关键资源。
3. 更少阻塞主线程。
4. 更稳定地完成布局和渲染。

这些方向与 Lighthouse 指标之间的关系如下：

| 优化方向 | 主要影响指标 | 本质 |
| --- | --- | --- |
| 减少关键渲染路径阻塞 | FCP、LCP、Speed Index | 让浏览器更早构建 DOM / CSSOM 并绘制 |
| 缩短资源下载时间 | FCP、LCP、Speed Index | 减少网络等待和传输体积 |
| 减少主线程阻塞 | TBT、INP、LCP | 降低 JS 解析、执行、渲染任务耗时 |
| 降低初始包体积 | FCP、TBT、Speed Index | 减少下载、解析、编译、执行成本 |
| 延迟非关键资源 | FCP、LCP、TBT | 把带宽和主线程让给首屏关键内容 |
| 优化首屏资源优先级 | LCP、FCP | 让关键图片、字体、CSS 更早开始 |
| 减少布局抖动 | CLS | 保持视觉稳定 |
| 提升缓存命中率 | TTFB、FCP、LCP | 减少重复传输和服务端计算 |
| 优化图片、字体、脚本、样式加载 | FCP、LCP、CLS、TBT | 控制资源体积、优先级与渲染副作用 |
| 合理选择 SSR / SSG / CSR | FCP、LCP、TTFB、TBT | 平衡首屏 HTML 直出、服务端成本和客户端接管成本 |

### SSR / SSG / CSR 的取舍

CSR 的问题不是“不能快”，而是它常常让首屏内容依赖 JS 主包。浏览器必须下载 JS、解析 JS、执行框架初始化、请求数据、渲染 DOM 后，用户才能看到主内容。这会影响 FCP、LCP、Speed Index，也会增加 TBT。

SSR / SSG 能让 HTML 直接包含首屏内容，通常有利于 FCP、LCP 和 Speed Index。但它也可能带来新的问题：

- SSR 服务端渲染慢会抬高 TTFB。
- hydration 成本高会拉高 TBT 和 INP 风险。
- SSR 接口串行请求会导致 HTML 返回慢。

所以工程判断不是“SSR 一定更快”，而是：

- 内容型、营销页、商品详情页、文档页，优先考虑 SSG / SSR。
- 强交互后台系统，重点优化拆包、缓存、懒加载、长任务和交互响应。
- 首屏必须 SEO 和快速可见时，避免纯 CSR 空壳。

## 5. 针对每个核心指标的专项优化

### 5.1 FCP 优化

FCP 的关键链路是：

```txt
导航请求 -> HTML 第一字节 -> HTML 解析 -> CSSOM 就绪 -> 首次内容绘制
```

#### 优化首屏 HTML 返回速度

HTML 返回慢会直接推迟所有资源发现。优化重点包括：

- CDN / 边缘缓存 HTML。
- 减少服务端重定向。
- SSR 中并行获取数据，避免接口瀑布。
- 对匿名用户页面做静态化或半静态化。
- 使用 `stale-while-revalidate` 在可接受场景下提升缓存命中。

```http
Cache-Control: public, max-age=60, stale-while-revalidate=300
```

这类优化影响的是 TTFB，也会连带改善 FCP 和 LCP。

#### 减少阻塞 CSS / JS

CSS 默认阻塞渲染，位于 HTML 中的同步脚本会阻塞解析。首屏不需要的 CSS 和 JS 不应进入关键路径。

```html
<!-- 当前页面首屏必须用到的样式可以保留 -->
<link rel="stylesheet" href="/assets/page-critical.css" />

<!-- 非关键脚本延迟执行 -->
<script src="/assets/app.js" defer></script>
```

`defer` 会让脚本下载与 HTML 解析并行，并在文档解析完成后执行，通常适合应用主脚本。`async` 适合独立脚本，例如部分统计脚本，但执行时机不可控，不适合有依赖顺序的业务代码。

#### 控制首屏关键资源体积

FCP 差经常不是一个资源特别慢，而是关键路径上资源太多：

- CSS 文件过大，包含大量非首屏样式。
- 主包包含图表、编辑器、国际化全量数据。
- 字体文件包含过多字重和字符集。
- 首屏图使用了未压缩原图。

优化目标是让首屏只加载“渲染第一屏必须的资源”。

#### 使用预连接与预加载

```html
<!-- 提前建立到 CDN 的连接 -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin />

<!-- 当前导航马上需要的关键字体 -->
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

`preconnect` 解决的是 DNS / TCP / TLS 连接准备问题。`preload` 解决的是关键资源发现太晚的问题。两者不能滥用，否则会抢占带宽和浏览器优先级。

#### 字体加载策略

字体会影响 FCP 和 CLS。常见策略：

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2");
  font-display: swap;
}
```

`font-display: swap` 可以避免文本长时间不可见，但可能带来字体切换时的布局变化。对标题和正文，应选择尺寸接近的 fallback 字体，必要时使用 CSS Fonts 的 `size-adjust` 控制差异。

#### 图片首屏策略

首屏图片不要无差别懒加载。首屏关键图如果被 `loading="lazy"` 延迟，可能直接拉低 LCP，也会影响视觉进度。

```html
<img
  src="/hero.avif"
  width="1200"
  height="630"
  alt="产品主图"
  fetchpriority="high"
/>
```

### 5.2 LCP 优化

LCP 优化要先识别 LCP 元素，而不是凭经验猜。

#### LCP 元素通常是什么

在 Lighthouse 或 DevTools Performance 中查看 LCP element。常见类型：

- `<img>`：首屏主图、商品图、封面图。
- CSS 背景图：Hero 背景。
- 文本块：文章标题、首屏大标题。
- 视频封面：`poster` 图。

不同类型对应不同优化策略。

#### 图片型 LCP 优化

图片型 LCP 最常见。优化顺序建议：

1. 使用合适尺寸，避免移动端下载桌面大图。
2. 使用 AVIF / WebP，保留 JPEG / PNG fallback。
3. 使用 CDN 图片裁剪、压缩、格式转换。
4. 使用 `srcset` / `sizes` 做响应式图片。
5. 对 LCP 图使用 `preload` 或 `fetchpriority="high"`。
6. 不要对首屏 LCP 图片使用懒加载。

```html
<link
  rel="preload"
  as="image"
  href="/images/hero-1200.avif"
  imagesrcset="/images/hero-640.avif 640w, /images/hero-1200.avif 1200w"
  imagesizes="100vw"
/>

<img
  src="/images/hero-1200.avif"
  srcset="/images/hero-640.avif 640w, /images/hero-1200.avif 1200w"
  sizes="100vw"
  width="1200"
  height="630"
  alt="首屏主图"
  fetchpriority="high"
/>
```

这里优化的是资源发现时间、下载时间和浏览器优先级。

#### 文本型 LCP 优化

文本型 LCP 常见于文章页和文档页。重点不是图片，而是：

- HTML 中直接包含标题和正文摘要，避免客户端晚生成。
- 减少阻塞 CSS，让文本尽早可绘制。
- 字体不要阻塞文本显示。
- 避免标题初始隐藏，等动画或 JS 完成后再显示。

错误示例：

```html
<h1 class="hero-title is-hidden">Web 性能指标</h1>
<script>
  initAnimation().then(() => {
    document.querySelector('.hero-title').classList.remove('is-hidden')
  })
</script>
```

这类“入场动画”可能把 LCP 推迟到动画开始或结束后。首屏主内容应优先可见，动画只能锦上添花。

#### 服务端响应速度

LCP 预算只有 2.5s。若 TTFB 已经 1.5s，剩给资源发现、下载、渲染的时间非常有限。

服务端侧重点：

- 对页面 HTML 做 CDN / 边缘缓存。
- SSR 数据并发请求。
- 避免 SSR 中等待非首屏数据。
- 首屏必要数据与非首屏数据分层。
- 对慢接口设置缓存、降级或异步补充。

#### 避免把 LCP 资源延后加载

常见错误：

- LCP 图写在 CSS 背景里，CSS 下载后才发现图片。
- LCP 图由 JS 运行后动态创建。
- 对 LCP 图使用 `loading="lazy"`。
- LCP 图在轮播组件初始化后才插入。
- LCP 元素被 `display: none` 或透明遮罩延迟显示。

优化 LCP 的关键是让浏览器尽早知道“首屏最大内容是什么，并尽早请求它”。

### 5.3 Speed Index 优化

Speed Index 关注可视区域的视觉完成速度。优化目标不是让所有资源都最快完成，而是让用户尽早看到稳定、有意义、逐步完整的界面。

#### 可视区域内容逐步呈现

不要让首屏完全依赖一个大型 JS 包。更好的方式是：

- HTML 直出导航、标题、首屏主体结构。
- 首屏 CSS 足够小。
- 非首屏模块异步加载。
- 图片按优先级加载。

#### 骨架屏、关键 CSS、分块加载

骨架屏不是万能优化。它能降低等待感，但如果真实内容仍然很晚出现，LCP 和 Speed Index 仍会差。

骨架屏应满足：

- 与真实布局尺寸接近，避免后续 CLS。
- 只用于数据短暂等待，不掩盖慢接口和慢主包。
- 首屏主内容能尽快替换，不长期停留在 loading 状态。

关键 CSS 的作用是让首屏结构先按正确样式绘制，非首屏样式可以延后：

```html
<style>
  .layout { max-width: 1120px; margin: 0 auto; }
  .hero { min-height: 420px; display: grid; align-items: center; }
</style>
<link rel="preload" href="/assets/non-critical.css" as="style" />
<link rel="stylesheet" href="/assets/non-critical.css" media="print" onload="this.media='all'" />
```

#### 避免首屏只有空白壳

典型 CSR 空壳：

```html
<div id="app"></div>
<script src="/assets/app.8fd3.js"></script>
```

这种结构对 Speed Index 不友好，因为视觉内容必须等 JS 完成后才出现。对于内容型页面，应考虑：

- SSG：构建时生成 HTML。
- SSR：请求时生成 HTML。
- Islands / Partial Hydration：只让交互组件接管。
- 服务端直出首屏核心内容，客户端补充非关键交互。

### 5.4 TBT / 主线程阻塞优化

主线程负责 JS 执行、样式计算、布局、绘制调度和用户输入处理。任何长任务都会让用户输入排队等待。

#### 长任务的本质

超过 50ms 的主线程任务会被视为 Long Task。浏览器一旦在执行一个长任务，就不能同时处理点击、输入、渲染下一帧。

常见长任务来源：

- 大 JS 文件解析、编译、执行。
- 框架初始化和 hydration。
- 一次性渲染大量 DOM。
- 大 JSON 解析。
- 复杂表格、图表、富文本编辑器初始化。
- 第三方脚本执行。

#### 大 JS 包的影响

JS 不是只影响下载。它还有解析、编译、执行成本。在移动端弱 CPU 上，一个 300KB gzip 的 JS 包可能产生远超下载时间的执行成本。

优化大 JS 包要同时考虑：

- 下载体积。
- 解析 / 编译耗时。
- 初始化执行耗时。
- 是否阻塞首屏渲染。
- 是否占用交互期间主线程。

#### 代码分割与懒加载

```js
const ChartPanel = () => import('./ChartPanel')
const RichEditor = () => import('./RichEditor')
```

适合懒加载的模块：

- 图表库。
- 富文本编辑器。
- 地图。
- 复杂表单。
- 管理后台低频页面。
- 登录后才需要的业务模块。

代码分割的收益是把“下载、解析、执行”从首屏关键路径中移走，直接影响 TBT、FCP 和 Speed Index。

#### 拆分同步逻辑

```js
button.addEventListener('click', () => {
  updateVisibleState()

  requestAnimationFrame(() => {
    setTimeout(() => {
      sendAnalytics()
      persistDraft()
      warmupNextData()
    }, 0)
  })
})
```

交互发生后，应该优先完成用户可见反馈。埋点、持久化、预取等非关键任务可以延后，避免阻塞下一帧。

#### 使用 Web Worker

CPU 密集型任务应从主线程移走：

```js
const worker = new Worker(new URL('./report.worker.js', import.meta.url), {
  type: 'module',
})

worker.postMessage({ type: 'calc', payload: largeData })
```

适合 Worker 的任务：

- 大数据计算。
- 复杂排序 / 过滤。
- 图片处理。
- 加密、压缩。
- 大 JSON 转换。

Worker 不能直接操作 DOM，因此要把它用于纯计算或可序列化任务。

#### 减少第三方脚本

第三方脚本常见问题：

- 下载域名多，连接成本高。
- 执行不可控，容易形成长任务。
- 与业务脚本抢占主线程。
- 加载广告、埋点、客服、A/B 实验后产生 CLS 和 TBT 问题。

治理策略：

- 建立第三方脚本清单。
- 区分首屏必须和非首屏可延迟。
- 使用 async / defer。
- 用户同意后再加载部分脚本。
- 对收益不明确的第三方脚本设定性能预算。

#### 降低 hydration / 初始化成本

SSR 页面如果 hydration 很重，会出现“看得见但点不动”。优化方式：

- 减少首屏需要 hydration 的组件数量。
- 对非首屏组件延迟 hydration。
- 避免首屏渲染超大列表。
- 使用虚拟列表。
- 拆分状态初始化逻辑。
- 避免全量注册大型组件库。

### 5.5 CLS 优化

CLS 优化的核心是：==任何异步出现的内容，都要提前为它留出稳定空间==。

#### 图片 / iframe 声明尺寸

```html
<img src="/cover.webp" width="800" height="450" alt="封面图" />
```

或者使用 CSS：

```css
.video-card {
  aspect-ratio: 16 / 9;
}
```

这可以让浏览器在资源下载前就计算布局，避免图片加载完成后把内容顶开。

#### 动态内容占位

广告、推荐模块、异步卡片必须预留空间：

```css
.ad-slot {
  min-height: 280px;
  background: #f5f5f5;
}
```

不要在文章正文顶部突然插入广告或推荐位。如果必须插入，应在初始布局中就包含占位。

#### 字体切换

字体导致 CLS 的原因是 fallback 字体与目标字体度量不同。处理方式：

- 使用 `font-display: swap` 避免 FOIT。
- 选择接近目标字体的系统 fallback。
- 控制字体字重数量。
- 对关键字体使用 preload。
- 必要时使用 `size-adjust` 调整 fallback 字体度量。

#### 动画属性选择

错误方式：

```css
.panel {
  transition: top 200ms ease;
}
```

更好的方式：

```css
.panel {
  transform: translateY(0);
  transition: transform 200ms ease, opacity 200ms ease;
}
```

`top`、`left`、`width`、`height` 等属性通常会触发布局变化；`transform` 和 `opacity` 通常只影响合成阶段，更适合动画。

### 5.6 TTFB / 网络链路优化

TTFB 由多段组成：

```txt
DNS 查询 -> TCP 连接 -> TLS 握手 -> 请求传输 -> 服务端处理 -> 响应首字节
```

#### DNS / TCP / TLS

优化方式：

- 使用 CDN 就近接入。
- 复用连接，启用 HTTP/2 或 HTTP/3。
- 对关键第三方域名使用 `preconnect`。
- 减少跨域关键资源数量。

#### SSR 与静态资源分发

SSR 能改善首屏内容可见性，但 SSR 过慢会恶化 TTFB。工程上应拆分：

- 首屏必须数据：阻塞 HTML。
- 次要数据：HTML 返回后客户端请求。
- 个性化低优先级数据：异步补充。

对于内容稳定页面，优先用 SSG 或缓存 SSR 结果。对于高动态页面，至少缓存不随用户变化的片段。

#### CDN、缓存、压缩、边缘节点

静态资源应使用长期缓存：

```http
Cache-Control: public, max-age=31536000, immutable
```

HTML 通常不能无限缓存，但可以使用短缓存、协商缓存或边缘缓存。资源文件名应带 hash，确保缓存与发布版本一致。

压缩策略：

- HTML / CSS / JS：Brotli 优先，gzip fallback。
- 图片：AVIF / WebP 优先，按设备尺寸裁剪。
- 字体：WOFF2，按字符集拆分。

#### 服务端接口瀑布流

SSR 中常见问题：

```txt
getUser -> getPermission -> getPageData -> getRecommend -> render HTML
```

如果这些接口可以并行却被串行执行，TTFB 会被放大。应改成：

```js
const [user, pageData, recommend] = await Promise.all([
  getUser(),
  getPageData(),
  getRecommend(),
])
```

同时要区分哪些数据必须阻塞首屏，哪些可以在 HTML 返回后再加载。

## 6. Webpack 环境下的性能优化实践

Webpack 优化 Lighthouse 指标的核心不是“让构建更快”，而是控制最终产物如何被浏览器加载和执行。构建结果会影响资源体积、请求数量、缓存命中、代码拆分、主线程执行时间，最终影响 FCP、LCP、TBT、Speed Index 和 CLS。

### 6.1 `splitChunks` 代码分割

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

- 抽离框架和第三方依赖，提升长期缓存命中。
- 避免业务代码变化导致 vendor 缓存失效。
- 减少重复依赖进入多个 chunk。
- 控制首屏包体积，降低下载和 JS 执行成本。

对应 Lighthouse 指标：

- 初始 JS 变小，有利于 FCP、Speed Index。
- 主线程执行减少，有利于 TBT。
- 缓存命中提升，有利于重复访问时的 LCP 和 FCP。

### 6.2 动态 `import()` 与路由级懒加载

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

路由级懒加载适合 SPA。它把非当前路由代码移出首包，减少首屏下载、解析、执行成本。

需要注意：

- 不要把首屏必须组件也懒加载到很深，导致 LCP 内容发现过晚。
- 对用户即将访问的路由可使用 prefetch。
- 大型依赖应结合业务路径拆包，而不是全部塞进 vendors。

### 6.3 Tree Shaking 与 `sideEffects`

Tree Shaking 依赖 ESM 静态结构，并且要求包声明副作用边界。

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

但要谨慎：全局样式、polyfill、注册逻辑、埋点初始化都可能是副作用。错误声明会导致代码被删除。

Tree Shaking 影响的是最终 JS 体积和执行量，主要改善 TBT、FCP 和 Speed Index。

### 6.4 生产模式构建优化

`mode: 'production'` 会启用默认压缩、作用域提升、Tree Shaking 等优化。不要用 development 产物上线。

```js
module.exports = {
  mode: 'production',
  devtool: 'source-map',
}
```

生产 source map 策略要平衡调试和体积：

- `source-map`：适合需要线上错误定位，可不对外暴露 map 文件。
- `hidden-source-map`：错误监控可用，但不在 bundle 中暴露引用。
- 不建议生产使用 `eval-*`，会影响安全和执行效率。

source map 本身不应被用户主流程下载，否则会浪费带宽。

### 6.5 CSS 抽离与压缩

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

- 首屏关键 CSS 小而稳定。
- 异步路由的 CSS 跟随对应 chunk 加载。
- 删除未使用 CSS。

### 6.6 图片资源处理策略

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

- 小图标内联可减少请求。
- 大图片内联会膨胀 JS / CSS，推迟解析和渲染。
- LCP 大图通常应作为独立资源，让浏览器单独调度优先级。

图片优化应结合构建插件、CDN 图片服务或上传链路完成，Webpack 只负责产物引用和 hash 不是全部。

### 6.7 长期缓存与 contenthash

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

长期缓存的关键是文件名内容变才变。否则用户可能拿到旧资源或缓存频繁失效。

### 6.8 preload / prefetch

Webpack 支持通过魔法注释生成资源提示：

```js
import(
  /* webpackChunkName: "chart" */
  /* webpackPrefetch: true */
  './ChartPanel'
)
```

`prefetch` 适合未来可能访问的资源，浏览器空闲时下载。`preload` 适合当前导航马上需要的资源，优先级更高。

不要滥用 preload。过多高优先级资源会挤占 LCP 图片、关键 CSS、字体等真正关键资源。

### 6.9 第三方依赖拆分

不要简单把所有 `node_modules` 打成一个巨大的 vendors。问题是：

- 任一依赖变化可能导致整个 vendors hash 变化。
- 首屏可能下载当前页面不需要的大依赖。
- 大 vendors 执行成本高，拉高 TBT。

更合理的策略：

- 框架核心单独拆。
- 大型低频依赖按业务路由懒加载。
- 图表、编辑器、地图不要进入首页首包。
- 重复依赖通过 `npm ls`、`pnpm why`、bundle analyzer 检查。

### 6.10 Bundle Analyzer 分析包体积

```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  plugins: [
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
}
```

分析时重点看：

- 首屏入口 chunk 多大。
- vendors 中是否有低频大依赖。
- 是否存在重复版本依赖。
- moment、lodash、echarts、monaco、地图 SDK 等是否按需加载。
- polyfill 是否过量。

### 6.11 Babel 转译范围与 polyfill 控制

过度转译会增加代码体积和运行时成本。

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

- 明确 browserslist，不要盲目兼容过老浏览器。
- `useBuiltIns: 'usage'` 避免全量 polyfill。
- 对现代浏览器可考虑 differential serving。
- 不必要时不要转译整个 `node_modules`。

### 6.12 Webpack 如何服务 Lighthouse 指标

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

Webpack 优化不是为了配置漂亮，而是为了让浏览器更快下载关键资源、更少执行无用代码、更稳定命中缓存。

## 7. Vite 环境下的性能优化实践

Vite 的开发服务器快，主要来自原生 ESM、依赖预构建和按需转换；但线上性能取决于 `vite build` 产物。Vite 生产构建通常通过 Rollup 生成 bundle，因此线上优化仍然要回到资源体积、chunk 粒度、资源优先级、缓存和运行时成本。

### 7.1 Rollup 产物优化思路

Vite 默认会：

- 以 HTML 作为入口分析依赖。
- 对生产代码做压缩。
- 对静态资源加 hash。
- 对动态导入生成异步 chunk。
- 对 CSS 进行抽取和代码分割。
- 对模块 preload 依赖做处理。

但默认策略不一定适合所有业务。大型应用仍需要主动控制 chunk 粒度。

### 7.2 `manualChunks` 控制拆包

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

- 框架依赖稳定缓存。
- 大型低频依赖独立出来。
- 避免首页被 `vendor` 巨包拖慢。
- 让缓存失效范围更小。

但 chunk 不是越碎越好。过多 chunk 会增加请求调度成本，尤其在首屏关键路径上。拆包要结合 Network waterfall 和真实页面路径验证。

### 7.3 动态导入与路由懒加载

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

- 首屏 JS 变小，改善 FCP、Speed Index。
- 解析和执行减少，改善 TBT。
- 大型页面模块延后加载，降低首页压力。

需要避免：

- 把首屏 LCP 内容所在组件懒加载得过深。
- 首页为了懒加载切出过多小 chunk，导致请求瀑布。
- 所有第三方依赖仍进入首屏 vendor。

### 7.4 第三方库拆包

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

这里的优化点是并行化：chunk 下载和数据请求同时进行，避免“先请求数据，再下载图表库”的瀑布。

### 7.5 资源预加载行为

Vite 会为部分动态导入依赖生成 modulepreload，以减少异步 chunk 的加载瀑布。工程上需要理解：

- modulepreload 有助于提前下载当前异步 chunk 依赖。
- 过多预加载可能抢占首屏关键资源。
- 对首屏关键图片和字体，仍应显式设置 preload / fetchpriority。

```html
<link rel="preload" as="image" href="/images/hero.avif" />
```

Vite 的 modulepreload 主要服务 JS chunk 依赖，不会自动判断你的 LCP 图片。

### 7.6 静态资源处理

Vite 默认会对小于阈值的资源做 base64 内联。可以通过 `assetsInlineLimit` 控制：

```ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,
  },
})
```

原则：

- 小图标、小装饰资源可以内联，减少请求。
- 大图片不要内联到 JS / CSS 中，否则会膨胀关键资源。
- LCP 图片应保持独立文件，便于浏览器调度优先级和 CDN 缓存。

### 7.7 图片压缩与现代格式

Vite 不会自动把所有图片压成最佳格式。工程中通常结合：

- CDN 图片服务。
- 构建期图片压缩插件。
- 上传链路生成多尺寸、多格式图片。
- `<picture>` 提供 AVIF / WebP fallback。

```html
<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" width="1200" height="630" alt="首屏主图" />
</picture>
```

这主要影响 LCP、Speed Index 和流量成本。

### 7.8 CSS 分包与按需加载

Vite 默认支持 CSS code splitting。异步 JS chunk 引用的 CSS 会跟随拆分。

```ts
export default defineConfig({
  build: {
    cssCodeSplit: true,
  },
})
```

开启 CSS 分包通常有利于避免首页加载全站样式。但要注意：

- 首屏关键 CSS 如果分散在多个异步组件里，可能导致样式延后。
- 大型组件库样式应按需引入。
- 未使用 CSS 需要配合框架插件或样式治理删除。

### 7.9 `import.meta.glob`

`import.meta.glob` 适合文件路由、文档、组件按需导入等场景。

```ts
const pages = import.meta.glob('./pages/**/*.vue')

export async function loadPage(path: string) {
  const loader = pages[`./pages/${path}.vue`]
  return loader?.()
}
```

默认是懒加载。不要为了方便使用 `{ eager: true }` 把所有页面同步打进首包。

```ts
// 谨慎使用：会把匹配模块同步引入
const pages = import.meta.glob('./pages/**/*.vue', { eager: true })
```

这会直接增加首屏 JS，影响 FCP、TBT 和 Speed Index。

### 7.10 依赖预构建与线上性能的区别

Vite 的依赖预构建主要服务开发环境：

- 把 CommonJS / UMD 依赖转换为 ESM。
- 合并大量小模块，减少开发时浏览器请求。
- 提升 dev server 冷启动和 HMR 体验。

它不等于线上自动优化。线上仍由 Rollup 打包，最终性能取决于生产构建产物、资源部署和运行时执行成本。

不要把“Vite dev 很快”误认为“线上页面一定快”。

### 7.11 SSR 场景下的性能思路

Vite SSR 要关注两条链路：

1. 服务端渲染链路：影响 TTFB、FCP、LCP。
2. 客户端 hydration 链路：影响 TBT、INP。

优化建议：

- SSR 数据并发获取。
- 对页面片段或完整 HTML 做缓存。
- 使用 streaming SSR 尽早返回头部和首屏内容。
- 非首屏组件延迟 hydration。
- 避免首屏一次性序列化巨大状态。
- 对大型交互组件做客户端懒加载。

SSR 的目标不是把所有事情都提前到服务端，而是让首屏关键内容更早可见，同时控制客户端接管成本。

### 7.12 分析 Vite 构建产物

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

- 首页入口 chunk 是否过大。
- `vendor` 是否包含低频大依赖。
- 某些库是否因导入方式错误导致全量打包。
- 是否存在重复版本。
- CSS 是否被全量引入。
- 动态导入是否符合路由和交互路径。

### 7.13 Vite 如何服务 Lighthouse 指标

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

## 8. Webpack 与 Vite 的优化思路对比

Webpack 和 Vite 的差异经常被简化成“Webpack 慢，Vite 快”，但这主要是在开发体验层面。线上性能不是由开发服务器速度决定的，而是由最终交付给浏览器的 HTML、CSS、JS、图片、字体和服务端响应共同决定的。

### 开发体验快慢不等于线上性能

Vite 开发环境快，是因为它利用浏览器原生 ESM，按需转换源码，并对依赖做预构建。Webpack 开发环境通常需要先构建较完整的依赖图。

但线上环境中，两者都会输出静态资源：

- 浏览器仍要下载资源。
- JS 仍要解析、编译、执行。
- CSS 仍可能阻塞渲染。
- 图片和字体仍会影响 LCP、CLS。
- 第三方脚本仍可能阻塞主线程。

因此，工具不会自动解决所有线上性能问题。

### 产物控制差异

Webpack 的产物控制能力非常细，生态成熟，适合复杂历史项目、多入口、多 loader、多兼容目标和深度定制场景。它的代价是配置复杂，错误拆包也容易制造巨大的 vendors 或请求碎片。

Vite 的默认体验更简洁，生产构建基于 Rollup 思路，ESM 语义清晰，动态导入自然拆包。它适合现代前端项目，但大型应用仍要通过 `manualChunks`、路由懒加载、可视化分析来治理产物。

### 分包方式差异

Webpack 常通过 `splitChunks.cacheGroups` 控制依赖拆分；Vite 常通过 Rollup 的 `manualChunks` 控制拆分。

两者语法不同，但目标一致：

- 首屏少加载。
- 低频模块延后加载。
- 高频稳定依赖长期缓存。
- 避免重复打包。
- 避免 chunk 过大或过碎。

### 插件生态与分析方式

Webpack 有成熟的 loader / plugin 生态，适合处理复杂资源管线。Vite 插件体系更贴近 Rollup 和现代 ESM，开发体验更轻。

分析工具也不同：

- Webpack：`webpack-bundle-analyzer`、`stats.json`。
- Vite：`rollup-plugin-visualizer`、构建输出、浏览器 Network。

但最终都要回到同一组问题：

1. 首页到底下载了什么？
2. 哪些资源阻塞 FCP / LCP？
3. 哪些 JS 长任务拉高 TBT？
4. 哪些图片、字体、异步内容导致 CLS？
5. 缓存是否稳定命中？

性能优化的核心不是选择某个构建工具后就结束，而是围绕资源加载与运行时成本持续治理。

## 9. 一套完整的 Web 性能优化流程

性能优化应遵循“测量、定位、优化、验证、监控”的闭环。

### 9.1 先测量

不要先改配置。先建立基线：

- Lighthouse 跑移动端和桌面端。
- PageSpeed Insights 看真实用户数据。
- DevTools Performance 录制首屏加载。
- DevTools Network 查看关键资源 waterfall。
- Bundle Analyzer 查看首屏 chunk。
- RUM 收集线上 LCP、INP、CLS、TTFB。

### 9.2 找瓶颈

根据指标判断瓶颈类型：

| 指标差 | 优先排查 |
| --- | --- |
| FCP 差 | TTFB、render-blocking CSS / JS、字体、CSR 空壳 |
| LCP 差 | LCP 元素、资源发现时间、图片体积、服务端响应、渲染延迟 |
| Speed Index 差 | 首屏是否空白壳、内容是否逐步出现、关键 CSS |
| TBT 差 | JS 体积、长任务、第三方脚本、hydration |
| CLS 差 | 图片尺寸、广告位、字体、异步插入、动画属性 |
| TTFB 差 | CDN、缓存、SSR、接口瀑布、服务端处理 |
| INP 差 | 真实交互路径、事件回调、渲染更新、长任务 |

### 9.3 分类问题

把问题分为四类：

1. 网络问题：TTFB、资源下载慢、缓存差、CDN 缺失。
2. 资源问题：图片大、字体大、CSS / JS 大、第三方资源多。
3. 运行时问题：长任务、hydration、复杂渲染、大 DOM。
4. 稳定性问题：CLS、异步插入、尺寸缺失、动画触发布局。

分类后才能选择正确方案。TBT 差时只压缩图片没有意义；CLS 差时只拆包也没有意义。

### 9.4 建立优化优先级

优先级建议：

1. 先处理影响最大、风险最低的问题，例如 LCP 图片尺寸、图片格式、明显长任务、缺失尺寸。
2. 再处理工程结构问题，例如路由懒加载、拆包、第三方脚本治理。
3. 最后处理架构级问题，例如 SSR / SSG 改造、接口聚合、边缘渲染。

不要为了 Lighthouse 总分做无意义优化。性能优化应服务真实用户体验和业务目标，例如：

- 商品详情页：优先 LCP、图片、TTFB。
- 内容站：优先 FCP、LCP、CLS。
- 后台系统：优先 TBT、INP、大表格交互。
- 活动页：优先图片、动画、首屏和稳定性。

### 9.5 小步验证

每次只改一类问题，并记录优化前后数据。否则多个改动混在一起，很难判断收益来源。

建议记录：

- Lighthouse 指标变化。
- Network 请求数量和传输体积。
- JS 总体积和首屏 chunk 体积。
- Long Task 数量和总耗时。
- LCP element 和 LCP 子阶段。
- 真实用户 75 分位指标变化。

### 9.6 对比优化前后数据

优化要看分布，不只看平均值。

- Core Web Vitals 通常关注 75 分位。
- 移动端和桌面端分开看。
- 新用户和老用户分开看，因为缓存状态不同。
- 不同地区、网络、设备分层看。

一个优化如果只改善高端设备，对低端设备无效，可能不是最优先的工程投入。

### 9.7 建立持续监控

性能不是一次性项目。版本迭代、依赖升级、第三方脚本增加、业务功能膨胀都会导致回退。

建议建立：

- Lighthouse CI：PR 或主干构建时做性能预算检查。
- Bundle size check：限制入口 chunk 和新增依赖体积。
- RUM：线上采集 LCP、INP、CLS、TTFB。
- 告警：核心页面指标超过阈值时通知。
- 性能看板：按页面、设备、地区、版本查看趋势。

### 9.8 长期治理组合

完整工具组合：

- Lighthouse：定期审计和发现方向。
- DevTools Performance：定位长任务、布局、渲染问题。
- DevTools Network：分析请求瀑布、优先级、缓存。
- WebPageTest：观察更细粒度的网络和视觉进度。
- RUM：衡量真实用户体验。
- Webpack / Vite Analyzer：治理包体积。
- 错误和日志平台：关联版本、设备、接口耗时。

性能优化的成熟流程不是“跑一次 Lighthouse，然后把分数刷高”，而是建立可持续的性能预算和回归机制。

## 10. 总结

Web 性能指标的意义，是把用户对“快、稳、可交互”的感受拆成可分析的工程信号。

Lighthouse 的 FCP、LCP、Speed Index、TBT、CLS 分别覆盖首次内容绘制、主内容可见、视觉进度、主线程阻塞和布局稳定性。Core Web Vitals 则从真实用户角度强调 LCP、INP、CLS。TTFB 虽然不是 Core Web Vitals，但它位于所有加载指标之前，是首屏性能的重要基础。

Webpack 和 Vite 的优化，本质都不是“调构建工具参数”，而是控制浏览器最终拿到什么资源、何时拿到、以什么优先级拿到、执行多久、是否能稳定缓存。`splitChunks`、`manualChunks`、动态导入、Tree Shaking、CSS 分包、图片优化、contenthash、polyfill 控制和产物分析，都应该服务于 Lighthouse 指标和真实用户体验。

性能优化的核心可以概括为四句话：

- 更小的资源。
- 更短的阻塞。
- 更稳定的布局。
- 更快的首屏响应。

真正有效的性能治理不是一锤子买卖，而是持续测量、持续约束、持续验证。只有把指标、原因、方案和工程落地连接起来，性能优化才不会停留在口号层面。

## 参考资料

- [Lighthouse performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [First Contentful Paint](https://developer.chrome.com/docs/lighthouse/performance/first-contentful-paint)
- [Largest Contentful Paint](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint)
- [Speed Index](https://developer.chrome.com/docs/lighthouse/performance/speed-index)
- [Total Blocking Time](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time)
- [Time to Interactive](https://developer.chrome.com/docs/lighthouse/performance/interactive)
- [Web Vitals](https://web.dev/articles/vitals)
- [Optimize Time to First Byte](https://web.dev/articles/optimize-ttfb)
- [Optimize Interaction to Next Paint](https://web.dev/articles/optimize-inp)
- [Optimize Cumulative Layout Shift](https://web.dev/optimize-cls)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Webpack SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/)
- [Vite Build Options](https://vite.dev/config/build-options.html)
- [Vite Production Build](https://vite.dev/guide/build)
