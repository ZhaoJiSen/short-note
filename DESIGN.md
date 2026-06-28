---
version: 1.0
name: short-note 设计规范
description: 弟弟森的编程小笔记 —— 基于 Vitesse Dark 色系、苹果系统字体的深色阅读站设计规范。强调内敛、克制、安静的长文阅读体验,所有视觉决策服务于"读得舒服"这一目标。
---

# short-note 设计规范

这是「弟弟森的编程小笔记」的设计规范,记录站点当前的视觉语言。所有样式集中在 `docs/.vuepress/theme/styles/custom.css`,首页组件在 `docs/.vuepress/theme/components/HomeLanding.vue`。新增组件或调整样式时,优先复用本文定义的设计令牌(CSS 变量),不要硬编码数值。

## 设计理念

站点定位是**中文编程学习笔记的深色阅读站**,不是工具产品落地页。一切以"长时间阅读不累"为准则:

- **内敛克制** —— 装饰最少化,没有网格、光晕、花哨动效。版面安静,让文字本身说话。
- **低对比护眼** —— 背景不用纯黑、正文不用纯白,降低明暗对比烈度。强调色低饱和,只在链接、当前项、关键标记处轻点一下。
- **暖调中性** —— 采用 Vitesse Dark 的暖灰基调,比冷蓝科技风更适合阅读。
- **系统原生** —— 字体走苹果系统字体栈,与读者的 macOS 阅读环境浑然一体,无 webfont 加载与闪烁。

> 配色灵感来自 Anthony Fu 的 [Vitesse](https://github.com/antfu/vscode-theme-vitesse) 主题,代码高亮也统一使用 `vitesse-dark` / `vitesse-light`,做到正文与代码同源。

## 颜色

所有颜色定义为 `--sn-*` 设计令牌,再映射到 VuePress / Plume 主题的 `--vp-*` 变量。改色只需改 `--sn-*` 源头。

### 强调色(Vitesse 墨绿)

| 令牌 | 值 | 用途 |
|---|---|---|
| `--sn-accent` | `#5bb992` | 主强调色。链接、当前项、主按钮、`==高亮==`、代码块强调 |
| `--sn-accent-strong` | `#6fc7a2` | 悬停态、行内代码文字 |
| `--sn-accent-soft` | `rgb(91 185 146 / 0.18)` | 当前项背景、软底色 |
| `--sn-accent-faint` | `rgb(91 185 146 / 0.1)` | 最淡的点缀(hover 背景、首屏微光) |

> 原版 Vitesse 墨绿偏暗(`#4d9375`),本站提亮到 `#5bb992` 让链接更醒目。调整强调色时三个衍生值需同步。

### 表面(背景层级)

由深到浅的五级表面,营造层次而不靠重阴影:

| 令牌 | 值 | 用途 |
|---|---|---|
| `--sn-bg` | `#121212` | 页面底色 |
| `--sn-bg-alt` | `#181818` | 次级背景 |
| `--sn-panel` | `#1e1e1e` | 卡片、callout、表格 |
| `--sn-panel-soft` | `#242424` | 稍浅的面板 |
| `--sn-panel-warm` | `#2a2a2a` | 最浅的暖面板 |
| 代码块底色 | `#1a1a1a` | 比正文略深,让代码块自然浮起 |

### 文字(由亮到暗四级)

| 令牌 | 值 | 用途 |
|---|---|---|
| `--sn-text` | `#ece9e0` | 标题、强调文字 |
| `--sn-text-2` | `#cdc9bd` | 正文主体 |
| `--sn-text-3` | `#969188` | 次要信息、meta、摘要 |
| `--sn-text-4` | `#6b6862` | 最弱信息、占位符 |

### 边框与分隔

| 令牌 | 值 | 用途 |
|---|---|---|
| `--sn-border` | `rgb(255 255 255 / 0.08)` | 默认边框 |
| `--sn-border-strong` | `rgb(255 255 255 / 0.13)` | 强调边框 |

边框统一用**白色低透明度**而非实色,这样在任何深度的表面上都能自适应融合。

### 语义色(callout / badge)

低饱和、与暖调协调,而非鲜艳的系统色:

| 语义 | 主色 | 用途 |
|---|---|---|
| tip / important | `#5bb992` 墨绿 | 提示、重点 |
| info | `#6394bf` 蓝灰 | 信息 |
| warning / caution | `#bd8a57` 暖橙 | 警告 |
| danger | `#cb7676` 柔红 | 危险、错误 |
| note | `--sn-text-3` 中性灰 | 普通备注 |

## 字体

### 字体栈

```css
--sn-font-sans:
  -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', 'Noto Sans CJK SC', system-ui, sans-serif;
--sn-font-mono:
  'SF Mono', 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
  'PingFang SC', monospace;
```

- **正文/标题**:macOS 上即 San Francisco,中文回退 PingFang SC。
- **代码/等宽**:SF Mono / Menlo。
- **不引入任何 webfont**:无网络请求、无字体闪烁(FOUT),首屏更快。

### 字号层级

正文基准 **16px / 行高 1.8**,适合中文长段阅读。标题用 `clamp()` 做响应式,负字距收紧但**不过紧**(`-0.01em`,中文负字距过大会显挤)。

| 元素 | 字号 | 说明 |
|---|---|---|
| 正文 `.vp-doc` | `16px` / 1.8 | 中文阅读基准 |
| h1 | `clamp(1.6rem, 2.4vw, 2rem)` | 文档主标题 |
| h2 | `clamp(1.3rem, 1.8vw, 1.55rem)` | 上边距 2.4rem |
| h3 | `clamp(1.08rem, 1.3vw, 1.22rem)` | |
| h4 | `1.04rem` | |
| 页面大标题 `.page-title` | `clamp(1.8rem, 3vw, 2.3rem)` | 字距 -0.02em |
| 行内代码 | `0.86em` | 墨绿文字 + 淡绿底 + 细边 |

- **标题字重统一 600**,不用更粗,保持系统的平静感。
- **标题字距 `-0.01em`**,页面大标题 `-0.02em`。中文场景下负字距要克制。

### 根字号说明

`html { font-size: 15px }`(非默认 16px),整体把 rem 缩放 6.25%。这是历史设定,影响所有 rem 单位(导航、徽章等)。调整正文大小请改 `.vp-doc` 的 px 值,**不要动根字号**,以免牵连全局。

## 布局

### 阅读宽度

正文列限宽 **760px**(`.content-container`),中文约 42 字/行,接近理想阅读区间。有/无右侧大纲的页面都受此约束。

```css
.vp-doc-container:not(.is-posts) .content-container {
  max-width: 760px;
}
```

### 留白哲学

- 段落间距 `1rem`,h2 上方留 `2.4rem` 制造章节呼吸感。
- 卡片内边距克制(博客卡 `1.1rem 1.3rem`),不留大片空白。
- 首屏 Hero 居中,大量留白,只放核心信息。

## 圆角

统一的圆角令牌,避免散落硬编码值。新组件一律引用令牌:

| 令牌 | 值 | 用途 |
|---|---|---|
| `--sn-radius-xs` | `5px` | 行内代码 |
| `--sn-radius-sm` | `7px` | 小元素 |
| `--sn-radius-md` | `9px` | 按钮、输入框、封面图 |
| `--sn-radius-lg` | `12px` | 代码块、callout、表格、卡片 |
| `--sn-radius-xl` | `14px` | 大容器 |
| `--sn-radius-pill` | `999px` | 标签、徽章、圆点 |

## 阴影与动效

- **阴影极克制**:`--sn-shadow-sm`(1px 描边)、`--sn-shadow-md`(大柔和投影)。卡片默认无阴影,hover 才浮现淡阴影 + 上移 1px。
- **过渡令牌**:`--vp-t-color: 180ms ease`(颜色)、`--vp-t-transform: 220ms cubic-bezier(0.22, 1, 0.36, 1)`(位移)。
- **尊重 `prefers-reduced-motion`**:动效在该模式下全部关闭。

## 组件

### 按钮(`.hero-action`)

首屏按钮两种形态:

- **主按钮 `.primary`**:墨绿实底、白字,hover 加深 + 箭头微移。
- **次按钮**:透明底 + 细边,hover 边框转墨绿 + 上移 1px。
- 圆角 `--sn-radius-md`,最小高度 42px,图标 16px。

### 卡片(博客列表 `.vp-post-item`)

- 单色背景 `color-mix(... 92%)`,圆角 `lg`,默认无阴影。
- hover:边框转墨绿、淡阴影、上移 1px。
- 内边距收紧到 `1.1rem 1.3rem`,标题 `1.1rem`,hover 标题变墨绿。

### 标签(tag)

**统一覆盖主题的彩虹标签**(主题默认按名字哈希分配 12 种颜色,与本站克制调性冲突):

- 默认:中性灰底 `rgb(255 255 255 / 0.04)` + 细边 + 灰字。
- hover:文字与边框转墨绿。
- 圆角 `pill`。

### 三层引述语言(重要)

普通引用、GitHub 报警、Plume 容器是三种不同"出身"的引述元素,本站刻意给它们**三套互不相同的视觉**,一眼可辨,各司其职:

| 元素 | 语法 | 视觉 | 适用 |
|---|---|---|---|
| 普通引用 | `> 文字` | 透明底 + 3px 中性灰竖线 + 弱化文字 | 低调引文、旁注 |
| GitHub 报警 | `> [!NOTE]` | 透明底、无边框、仅左侧 3px 彩色粗条 + 彩色标题 | 正文中随手一提的轻量批注 |
| Plume 容器 | `:::note` | 实底色卡片 + 完整边框 + 圆角 | 需明确圈起来的大段提示 |

- **区分机制**:GitHub 报警由本地插件 `github-alert-source-class` 加上 `.github-alert-source` 类,CSS 据此区分;Plume 容器不带此类。
- **GitHub 报警左条/标题配色**按类型:note 灰、tip 墨绿、info 蓝灰、important 强调绿、warning 暖橙、danger 柔红。
- **Plume 容器配色**已映射到上文语义色(实底卡片形态)。
- 设计意图:轻(批注)→ 重(卡片)的层次,避免三者混作一团失去区分意义。

### 高亮(`==文字==` / mark)

下划线式高亮动画(`mark-highlight` keyframe 由主题提供),颜色随语义变化:默认墨绿,note/tip 绿、important 强调绿、warning/caution 橙、danger 红。`.important` 的文字色补全由本站添加(主题原版遗漏)。

## 首页 Hero(`HomeLanding.vue`)

居中极简、突出身份,无大卡片、无花哨动效:

```
        Aaron
  全栈工程师,正深入 AI 方向,JumpServer 开源前端贡献者
  用 Vue / React 雕琢前端…在 LangChain…之间寻找答案。

      [ GitHub ]  [ JumpServer ]
```

- 结构:大字名 `.hero-name` → 一句话定位 `.hero-role` → 补充描述 `.hero-desc` → 行动按钮 `.hero-actions`。
- 容器 `.landing-hero` 限宽 640px,垂直居中占满首屏(`100svh - 导航高`)。

## Do's and Don'ts

### 应当

- 复用 `--sn-*` 令牌(颜色、圆角)和 `--vp-t-*`(过渡),不硬编码。
- 新增语义色时沿用低饱和、暖调的取向。
- 保持标题字重 600、字距克制。
- 边框用白色低透明度,自适应任意表面。
- 改色从 `--sn-*` 源头改,让映射自动生效。

### 不应

- 不要引入纯黑背景 / 纯白文字(破坏低对比护眼)。
- 不要把强调色用成大面积色块(它只用于点缀)。
- 不要恢复彩虹标签、网格背景、光晕等装饰。
- 不要给标题用过大的负字距(中文会显挤)。
- 不要引入 webfont(破坏系统原生与加载速度)。
- 不要动 `html` 根字号(牵连全局 rem)。
- 不要使用中文引号 —— 作者刻意用直角 ASCII 引号(见 CLAUDE.md)。
