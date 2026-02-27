---
title: yarn
createTime: 2025/12/23 21:03:58
permalink: /package-manager/8wjw67zx/
---

[+Yarn]: Yet Another Resource Negotiator，由 Meta（原 Facebook）于 2016 年发布
[+Plug'n'Play]: 零 node_modules，依赖解析后写入 .pnp 文件，由 loader 在运行时解析

**Yarn**[+Yarn] 是 ==npm 的替代品==，在速度、离线缓存、锁文件等方面做了改进，曾被视为更稳的包管理方案。Yarn 2+（Berry）引入 Plug'n'Play[+Plug'n'Play]、Workspaces 等能力。

## npm vs Yarn 对比

:::table full-width

| 特性 | npm | Yarn (Classic) |
| --- | --- | --- |
| 锁文件 | package-lock.json | yarn.lock |
| 安装速度 | 较慢 | 并行下载，更快 |
| 离线 | 支持有限 | 本地缓存强 |
| 校验 | 无 | 完整性校验 |
| Workspaces | 有（较晚） | 原生支持 |
:::

## 安装与初始化

:::code-tabs
@tab 安装 Yarn

```bash
# 通过 npm 全局安装
npm install -g yarn

# 通过 Corepack 启用（Node 16.10+）
corepack enable
corepack prepare yarn@stable --activate
```

@tab 初始化项目

```bash
# 创建 package.json
yarn init

# 跳过交互
yarn init -y
```

:::

## 基本使用

:::code-tabs
@tab 安装依赖

```bash
# 安装全部依赖
yarn
yarn install

# 添加生产依赖
yarn add vue
yarn add lodash@4.17.21

# 添加开发依赖
yarn add -D vite typescript

# 全局安装
yarn global add pnpm
```

@tab 卸载与更新

```bash
yarn remove vue
yarn upgrade vue
yarn upgrade-interactive  # 交互式选择要升级的包
```

:::

:::info
Yarn 的 `yarn add` 等价于 npm 的 `npm install <pkg>`，语义更直观。
:::

## 常用脚本

:::code-tabs
@tab 执行脚本

```bash
# 运行 scripts 中的命令
yarn run build
yarn build          # run 可省略
yarn dev
yarn test
```

:::

## Yarn 1 (Classic) vs Yarn 2+ (Berry)

:::table full-width

| 维度 | Yarn 1 (Classic) | Yarn 2+ (Berry) |
| --- | --- | --- |
| node_modules | 有，类似 npm | 可选 PnP，可零 node_modules |
| 配置方式 | 全局/项目 .yarnrc | 项目 .yarnrc.yml |
| 插件系统 | 无 | 支持插件扩展 |
| 默认行为 | 与 npm 相近 | PnP 需适配 |
:::

::::details 何时使用 Yarn 2 (Berry)？

- **适合**：新项目、对安装速度/磁盘占用敏感、需要 Workspaces 的 monorepo
- **慎用**：依赖原生 node_modules 的旧项目、部分构建工具尚未支持 PnP 时
- **建议**：团队统一选择，避免 npm / yarn / pnpm 混用
::::

## 常用配置

:::code-tabs
@tab .yarnrc 或 .yarnrc.yml

```yaml
# .yarnrc.yml (Yarn 2+)
nodeLinker: node-modules  # 使用传统 node_modules，兼容性更好

# 换源
npmRegistryServer: "https://registry.npmmirror.com"
```

```bash
# .yarnrc (Yarn 1)
registry "https://registry.npmmirror.com"
```

:::

## Workspaces（Monorepo）

Yarn 原生支持 Workspaces，可在根目录管理多个子包：

```json
// package.json (根目录)
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

::::collapse

- **优势**：依赖提升、统一版本、一次 install 装全项目
- **命令**：`yarn workspace <pkg-name> add xxx` 给指定子包安装依赖
- **详细用法** 可参考 [Monorepo](/package-manager/ubsba9hj/) 章节

::::

::::info

1. **Yarn 比 npm 快在哪？**
   并行下载、离线缓存强、完整性校验后复用缓存；早期 npm 是串行且缓存策略较弱。

2. **yarn.lock 和 package-lock.json 能混用吗？**
   不能。同一项目应只用一种锁文件，混用会导致依赖版本不一致。迁移时删除旧的 lock 再重新安装。

3. **Workspaces 的依赖提升是什么？**
   多包时公共依赖提升到根 `node_modules`，避免重复安装；但要注意子包是否误用了“被提升”的依赖（幽灵依赖）。

::::
