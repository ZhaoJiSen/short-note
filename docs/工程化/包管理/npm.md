---
title: npm
createTime: 2025/12/23 21:03:51
permalink: /package-manager/ghjscjaz/
---

**npm**（Node Package Manager）Node.js 自带的官方包管理器，通过 npm 可安装、发布、管理依赖包

::::details 基本命令使用

:::code-tabs
@tab 初始化项目

```bash
# 创建 package.json
npm init

# 跳过提问，使用默认值
npm init -y
```

@tab 安装依赖

```bash
# 生产依赖（写入 dependencies）
npm install <pkg>
npm i vue

# 开发依赖（写入 devDependencies）
npm install -D vite
npm i -D typescript

# 全局安装
npm install -g pnpm

# 安装某版本
npm i lodash@4.17.21
npm i lodash@^4.17.0  # 兼容 ^4.17 的最新版
```

@tab 卸载与更新

```bash
npm uninstall <pkg>    # npm un vue
npm update <pkg>       # 更新到允许范围内的最新版
npm outdated           # 查看可更新的包
```

:::

::::

## npx

npx 随 npm 5.2+ 自带，用于执行未全局安装的包。当执行 `npx <pkg>` 且本地 `node_modules/.bin` 中无该命令时，npx 会走 "临时拉取" 流程：

:::note 执行流程

1. **解析包**：从 registry 查询包信息，确定要下载的版本
2. **缓存检查**：先查本地缓存目录 `~/.npm/_npx/`，按包名 + 版本建子目录（如 `create-vue@7.x`），若已存在则直接复用
3. **临时安装**：若缓存无，则下载 tarball 解压到 `~/.npm/_npx/<hash>/node_modules/`，不写入项目 `node_modules`
4. **执行命令**：在临时目录的 `node_modules/.bin/` 中找对应可执行文件并执行
5. **缓存保留**：执行完不删除，下次同版本命中缓存，加速执行

:::

:::: file-tree

- ~/.npm/_npx
  - a1b2c3d4e5f6        hash 目录
    - node_modules
      - create-vue
      - .bin
        - create-vue
  - ...
::::

## 幽灵依赖

幽灵依赖指项目 ==未在 package.json 中声明== 某包，却能显示的通过 `import` 使用它

```txt
# 示例：你只装了 vue，vue 内部依赖 @vue/shared
node_modules/
├── vue/
├── @vue/
│   └── shared/     # vue 的依赖，被提升到顶层
└── ...

# 你未声明 @vue/shared，但可以：
import { isObject } from '@vue/shared'  // 能跑！这就是幽灵依赖
```

> [!IMPORTANT]
> 产生幽灵依赖的原因是
>
> 在 `npm` 安装时会做 **依赖提升的扁平化处理**：若 A 依赖 B，B 会被提升到 `node_modules/B`，以便减少重复安装、简化路径。==结果是：==任何被某依赖声明的包，都可能出现在顶层==，代码就能 `import` 到

### npm install 流程
