---
title: Vim 
createTime: 2026/03/15 10:47:02
permalink: /blog/8mk7ddsn/
tags: 
 - vim
---

normal 模式、 insert 模式、 visual 模式、 command 模式

从 normal 模式切换到 insert 模式的方式是按 `i` 键
从 insert 模式切换到 normal 模式的方式是按 `Esc` 键或者 `Ctrl + [` 键

移动光标 h 向左移动，j 向下移动，k 向上移动，l 向右移动

使用 i 键插入文本到光标之前，使用 a 键插入文本到光标之后，使用 o 键插入新行，使用 A 键插入文本到行末

行移动

- 移动到行尾: $ 还可以使用 g_ 移动到本行最后一个不是 blank 的字符位置
- 移动到行首: 0 还可以使用 ^ 移动到本行第一个不是 blank 的字符位置

按着别扭，将 ^ 改键为 将 g_ 改键为

```json
vim.normalModeKeyBindings: [
 {
   "before": ["H"],
   "after": ["^"],
 },
 {
   "before": ["L"],
   "after": ["g", "_"]
 } 
]
```

行插入

- 插入到行尾: A
- 插入到行首: I
- 插入到行前: O
- 插入到行后: o
  
复制当前行: yy
删除当前行: dd
粘贴: p
