---
title: path 模块
createTime: 2026/01/14 17:13:50
permalink: /node/m4tkcgr5/
---

# path 模块

## path 模块是做什么的

`path` 是 Node.js 内置的路径处理模块，用于处理文件路径和目录路径的拼接、解析、格式化等操作。它本身不读写文件，只操作字符串。

在 Node.js 开发中，路径处理是最常见的基础操作之一。`path` 模块帮助开发者写出跨平台的路径代码——Windows 的路径分隔符是 `\`，Unix 系统是 `/`，`path` 模块会自动处理这些差异。

::: tip
路径操作是文件操作的基础。建议始终使用 `path` 模块拼接路径，而不是手动拼接字符串。
:::

---

## 核心能力概览

`path` 模块的核心能力可分为以下几类：

**路径解析**：`parse`、`format`、`resolve` 用于解析路径各组成部分或合并多个路径

**路径拼接**：`join`、`resolve` 用于将多个路径片段合并为一个完整路径

**路径格式化**：`normalize` 规范化路径（处理 `../`、`./` 等），`format` 将对象转换为路径字符串

**路径信息**：`basename`、`dirname`、`extname` 用于获取文件名、目录名、扩展名

**判断方法**：`isAbsolute` 判断是否为绝对路径，`sep` 获取当前平台的分隔符

---

## 常用 API

### 路径解析

`parse` 将一个路径解析为各组成部分：

```javascript
import { parse } from 'node:path'

parse('/home/user/project/src/index.js')
// {
//   root: '/',
//   dir: '/home/user/project/src',
//   base: 'index.js',
//   ext: '.js',
//   name: 'index'
// }
```

`format` 与 `parse` 相反，将各组成部分合并为路径：

```javascript
import { format } from 'node:path'

format({
  dir: '/home/user/project',
  name: 'index',
  ext: '.js'
})
// '/home/user/project/index.js'
```

### 获取路径各部分

```javascript
import { dirname, basename, extname } from 'node:path'

const filePath = '/home/user/project/src/index.js'

dirname(filePath)   // '/home/user/project/src'
basename(filePath)  // 'index.js'
basename(filePath, '.js')  // 'index'
extname(filePath)   // '.js'
```

`basename` 的第二个参数可以移除文件扩展名，这在处理文件类型时很有用。

### 路径拼接

`join` 将多个路径片段用平台分隔符连接：

```javascript
import { join } from 'node:path'

join('/home', 'user', 'project', 'src')
// '/home/user/project/src' (Unix)
// 'home\user\project\src' (Windows)
```

`resolve` 将相对路径解析为绝对路径：

```javascript
import { resolve } from 'node:path'

resolve('./config.json')
// '/Users/zhaojisen/project/config.json' (当前目录的绝对路径)

resolve('/home', 'user', '../user')
// '/home/user' (会处理 ..)
```

`join` 和 `resolve` 的区别：

- `join`：简单拼接，不解析 `..`、`.` 之外的逻辑
- `resolve`：将参数从左到右依次解析为绝对路径，最终返回一个绝对路径

### 路径规范化

`normalize` 将路径规范化，处理多余的 `/`、`../`、`./` 等：

```javascript
import { normalize } from 'node:path'

normalize('/home//user/project/../src')
// '/home/user/src'

normalize('./src/../index.js')
// 'index.js'
```

### 判断路径类型

```javascript
import { isAbsolute, sep } from 'node:path'

isAbsolute('/home/user')  // true
isAbsolute('./src')      // false

sep  // '/' (Unix) 或 '\\' (Windows)
```

### 平台路径差异

```javascript
import { sep, delimiter, posix, win32 } from 'node:path'

sep           // 平台路径分隔符
delimiter     // 环境变量路径分隔符 (; Windows, : Unix)
posix.sep     // 始终为 '/'
win32.sep     // 始终为 '\\'
```

在需要跨平台处理路径时，可以直接使用 `posix` 或 `win32` 模块强制指定行为：

```javascript
import { win32 } from 'node:path'

win32.join('C:\\Users', 'project')
// 'C:\\Users\\project'
```

---

## 常见开发场景

### 构建静态资源路径

```javascript
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicPath = join(__dirname, '../public')
```

### 处理文件扩展名

```javascript
import { extname, basename } from 'node:path'

function getFileType(filepath) {
  const ext = extname(filepath).toLowerCase()
  const types = {
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.pdf': 'document',
    '.txt': 'text'
  }
  return types[ext] || 'unknown'
}
```

### 统一跨平台路径

```javascript
import { normalize, sep } from 'node:path'

function toSlash(path) {
  return normalize(path).split(sep).join('/')
}
```

### 解析命令行传入的路径

```javascript
import { resolve, basename } from 'node:path'

const filePath = process.argv[2]
const absolutePath = resolve(filePath)
const filename = basename(absolutePath)
```

---

## 易错点与注意事项

::: warning

1. **跨平台分隔符**：不要手动拼接路径，使用 `join` 方法。手动拼接 `\ 或 `/` 会导致代码在其他平台失效。

2. **相对路径基准**：相对路径是相对于当前工作目录（`process.cwd()`），而不是文件所在目录。在生产环境中，优先使用 `__dirname` 或 `import.meta.url` 构建绝对路径。

3. **ES Module 兼容**：`__dirname` 和 `__filename` 在 ES Module 中不可直接使用，需要通过 `import.meta.url` 转换。

4. **路径不存在**：`path` 模块只处理字符串，不检查路径是否真实存在。不要假设解析后的路径对应一个实际文件。

5. **Windows 反斜杠**：Windows 路径中的反斜杠在字符串中需要转义，如 `\\path\\file`。

:::

---

## 总结

`path` 模块是 Node.js 文件操作的基础设施。核心使用原则：

- 始终使用 `path.join()` 拼接路径，避免手动处理分隔符
- 使用 `__dirname` 或 `import.meta.url` 构建绝对路径，避免相对路径歧义
- 跨平台项目中使用 `normalize` 确保路径格式统一
- 处理路径时注意平台差异，必要时使用 `posix` 或 `win32` 强制指定行为

掌握 `path` 模块的使用，能够避免大多数路径相关的跨平台问题，是 Node.js 开发的基本功。