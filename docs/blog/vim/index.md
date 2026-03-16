---
title: Vim
createTime: 2026/03/15 10:47:02
permalink: /blog/8mk7ddsn/
tags:
  - vim
---

## 常见模式

:::table full-width

| 模式 | 作用 | 常用进入方式 | 退出方式 |
| --- | --- | --- | --- |
| Normal | 移动、删除、复制等编辑操作 | 打开文件默认进入 | `i` / `a` / `o` 等进入插入 |
| Insert | 输入文本 | `i` / `a` / `o` / `I` / `A` / `O` | `Esc` 或 `Ctrl + [` |
| Visual | 选中一段文本 | `v` / `V` / `Ctrl + v` | `Esc` |
| Command | 执行命令 | `:` | `Esc` 或回车后回到 Normal |

:::

## 核心语法

### 光标与行内移动

:::table full-width

| 目标 | 命令 |
| --- | --- |
| 左 / 下 / 上 / 右 | `h` / `j` / `k` / `l` |
| 行首（含空白） | `0` |
| 行首第一个非空白字符 | `^` |
| 行尾（含换行前位置） | `$` |
| 行尾最后一个非空白字符 | `g_` |

:::

::::details 自定义配置

:::table title="额外配置映射说明" full-width

| 模式 | 按键 | 映射到 | 效果 |
| --- | --- | --- | --- |
| `normalModeKeyBindings` | `H` | `^` | 跳到行首第一个非空白字符 |
| `normalModeKeyBindings` | `L` | `g_` | 跳到行尾最后一个非空白字符 |
| `operatorPendingModeKeyBindings` | `H` | `^` | 在操作符等待态中使用同样范围 |
| `operatorPendingModeKeyBindings` | `L` | `g_` | 在操作符等待态中使用同样范围 |

:::

```json
"vim.normalModeKeyBindings:": [
  {
    "before": ["H"],
    "after": ["^"]
  },
  {
    "before": ["L"],
    "after": ["g", "_"]
  }
],
"vim.operatorPendingModeKeyBindings:": [
  {
    "before": ["H"],
    "after": ["^"]
  },
  {
    "before": ["L"],
    "after": ["g", "_"]
  }
]
```

::::

### 插入

:::table full-width

| 命令 | 含义 |
| --- | --- |
| `i` | 在光标前插入 |
| `a` | 在光标后插入 |
| `I` | 在行首第一个非空白字符前插入 |
| `A` | 在行尾插入 |
| `o` | 在当前行后新开一行并进入插入 |
| `O` | 在当前行前新开一行并进入插入 |

:::

### 操作

Vim 的常见编辑可以抽象成：`操作符 + 动作(范围)`。例如 `dL` 可以理解为 "删除到行尾最后一个非空白字符"

:::table full-width

| 操作 | 命令 |
| --- | --- |
| `yy` | 复制当前行 |
| `dd` | 删除当前行 |
| `p` | 粘贴 |
| `d` | 删除 |
| `c` | 删除并进入插入模式（change） |
| `y` | 复制（yank） |

:::

#### 单词级移动与组合

:::table full-width

| 命令 | 作用 |
| --- | --- |
| `w` | 移动到==下一个单词开头== |
| `e` | 移动到==当前/下一个单词结尾== |
| `b` | 移动到上一个单词开头 |
| `ge` | 移动到上一个单词结尾 |
| `W` / `E` / `B` | 按空白分隔的大词移动 |

:::

#### 常见组合

练习文本：

```ts
const profileName = currentUser.profile.name
const count = total + extraValue
```

:::table title="命令应用示例（光标默认在 profileName 或 total 上）" full-width
| 命令 | 作用结果 | 说明 |

| --- | --- | --- |
| `cw` | 删除从光标到当前单词结尾并进入插入 | 适合 "改单词后半段" |
| `ea` | 先移动到当前单词结尾再进入追加输入 | 适合 "在词尾补内容" |
| `ce` | 删除光标处到单词结尾并进入插入 | 适合 "改单词后半段" |
| `ciw` | 删除整个当前单词并进入插入 | 不管光标在单词中间还是两侧都稳定 |
| `diw` | 删除整个当前单词 | 只删除，不进入插入 |
| `daw` | 删除当前单词和后面的空格 | 常用于“整词连空格一起删” |
| `dw` | 从光标删到下一个单词开头 | 删除范围通常比 `diw` 小 |
| `de` | 从光标删到当前单词结尾 | 不跨到下一个单词开头 |
| `db` | 向左删除到上一个单词开头 | 反向删除时高频使用 |
| `d$` | 删除到行尾（如 `total + extraValue`） | 适合快速截断本行后半段 |
| `c$` | 删除到行尾并进入插入 | 常用于“重写本行尾部表达式” |
| `yiw` | 复制当前单词（如 `profileName`） | 复制后可用 `p` 粘贴 |
:::
