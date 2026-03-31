---
title: pnpm
createTime: 2025/12/23 21:04:04
permalink: /package-manager/gbkmogs1/
---

[+pnpm]: Performant npm，追求高性能与严格依赖管理的包管理器
[+内容寻址存储]: 文件按 hash 存储，相同内容只存一份，实现跨项目硬链共享

**pnpm**[+pnpm] 以 ==速度== 和 ==磁盘节省== 著称，采用内容寻址存储[+内容寻址存储]和严格的 `node_modules` 结构，避免幽灵依赖，适合 monorepo 与大型项目。

## 核心特性

:::table full-width

| 特性 | 说明 |
| --- | --- |
| 硬链接 + 内容寻址 | 全局 store 存包，项目通过硬链接引用，大幅节省磁盘 |
| 非扁平 node_modules | 只能访问声明的依赖，杜绝幽灵依赖 |
| 严格的依赖解析 | 未在 dependencies 中的包无法被 import |
| 原生 Workspaces | 对 monorepo 友好，与 npm/yarn 兼容 |
:::

::::card title="为什么选 pnpm？" icon="material-icon-theme:speed"

- **安装快**：并行下载 + 硬链接，避免重复写入
- **省空间**：多项目共享同一份包，磁盘占用明显下降
- **依赖干净**：非扁平结构，未声明即不可用，减少“能跑但实际缺依赖”的问题
- **Monorepo 友好**：Workspaces、filter、--filter 等对多包项目支持完善

::::

## 安装与初始化

:::code-tabs
@tab 安装 pnpm

```bash
# npm
npm install -g pnpm

# Corepack（Node 16.13+）
corepack enable
corepack prepare pnpm@latest --activate

# curl（Unix）
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

@tab 初始化项目

```bash
pnpm init
```

:::

## 基本使用

:::code-tabs
@tab 安装依赖

```bash
# 安装全部依赖
pnpm install
pnpm i

# 添加依赖
pnpm add vue
pnpm add -D vite
pnpm add -O eslint   # -O: optionalDependencies

# 全局安装
pnpm add -g pnpm
```

@tab 卸载与更新

```bash
pnpm remove vue
pnpm update
pnpm update vue
```

:::

## node_modules 结构对比

:::table full-width

| 包管理器 | node_modules 特点 |
| --- | --- |
| npm / Yarn 1 | 扁平化，可访问未声明依赖（幽灵依赖） |
| pnpm | 非扁平，`.pnpm` 存真实依赖，顶层只放声明过的包 |
:::

```
# pnpm 典型结构
node_modules/
├── .pnpm/           # 真实依赖，按 hash 存储
│   └── vue@3.x.../
├── vue              # 软链到 .pnpm 内对应版本
└── .modules.yaml    # 依赖关系记录
```

:::warning
项目若依赖“幽灵依赖”（未在 package.json 中声明但能从 node_modules 顶层访问），迁移到 pnpm 可能报错。需在 package.json 中显式补充依赖。
:::

## 常用命令速查

:::table full-width

| 命令 | 作用 |
| --- | --- |
| `pnpm i` | 安装依赖 |
| `pnpm add <pkg>` | 添加依赖 |
| `pnpm remove <pkg>` | 移除依赖 |
| `pnpm run <script>` | 运行脚本 |
| `pnpm exec <cmd>` | 在项目环境中执行命令（类似 npx） |
| `pnpm dlx <cmd>` | 临时下载并执行，不落盘到项目（类似 npx） |
| `pnpm store prune` | 清理未使用的 store 内容 |
:::

## Monorepo 与 Workspaces

::::details pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

定义工作区后，可用 `pnpm --filter` 精准操作子包：

```bash
# 只给 web 安装 lodash
pnpm --filter web add lodash

# 只构建 packages 下的包
pnpm --filter "./packages/*" build

# 安装时按依赖拓扑排序
pnpm install
```

::::

## 配置文件

:::code-tabs
@tab .npmrc

```ini
# 使用淘宝镜像
registry=https://registry.npmmirror.com

# 依赖链接方式：isolated（默认，严格非扁平）| hoisted（提升，兼容部分老工具）
# node-linker=isolated
node-linker=hoisted   # 若遇兼容问题可启用

# store 目录（默认 ~/.local/share/pnpm/store）
# store-dir=~/.pnpm-store
```

:::

## 与 npm / Yarn 的兼容性

:::table full-width

| 场景 | 建议 |
| --- | --- |
| 新项目 | 可直接使用 pnpm |
| 已有 npm 项目 | 删除 node_modules、package-lock.json，执行 `pnpm i` |
| CI / 协作 | 用 `packageManager` 字段锁定版本，配合 Corepack |
| 部分工具不兼容 | 可尝试 `pnpm config set node-linker hoisted` 改用提升模式 |
:::

:::code-tabs
@tab 在 package.json 中声明包管理器

```json
{
  "packageManager": "pnpm@9.0.0"
}
```

配合 `corepack enable`，他人 clone 后会自动使用对应版本的 pnpm。

::::

## 面试速记

::::info

1. **pnpm 如何解决幽灵依赖？**
   非扁平 `node_modules`：只有 `package.json` 里声明的包会出现在顶层，未声明的放在 `.pnpm` 内且无法被直接 `import`，从而 ==杜绝幽灵依赖==。

2. **pnpm 为什么快、为什么省空间？**
   - **快**：并行下载 + 多数包走硬链接，几乎不拷贝
   - **省空间**：全局 store 按内容寻址存一份，各项目通过硬链接引用，多项目共享同一份包

3. **硬链接和内容寻址是什么？**
   - 硬链接：多路径指向同一份磁盘数据，不占额外空间
   - 内容寻址：按 hash 存包，相同内容只存一份，跨项目复用

4. **pnpm 迁移报错“找不到模块”怎么处理？**
   多半是幽灵依赖：原先能用的未声明包在 pnpm 下不可见了。在 `package.json` 中显式添加该依赖即可。

5. **为什么很多 monorepo 选 pnpm？**
   原生 Workspaces、`--filter` 精准操作、严格依赖避免子包互相“蹭”依赖、安装快且省磁盘。

::::
