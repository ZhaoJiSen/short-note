---
title: Webpack 搭建 TS 运行环境
createTime: 2026/02/09 21:42:00
permalink: /typescript/webpack-ts/
---

## 目标

使用 `webpack + ts-loader` 搭建一个可运行 TypeScript 的前端工程。

## 1. 安装依赖

```bash
pnpm add -D webpack webpack-cli webpack-dev-server
pnpm add -D typescript ts-loader
pnpm add -D html-webpack-plugin
```

## 2. 初始化 tsconfig

```bash
pnpm exec tsc --init
```

推荐最小配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "Bundler",
    "sourceMap": true
  },
  "include": ["src"]
}
```

## 3. 编写 webpack 配置

`webpack.config.js`

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    port: 5173,
    open: true,
  },
  devtool: 'source-map',
}
```

## 4. package.json 脚本

```json
{
  "scripts": {
    "dev": "webpack serve",
    "build": "webpack --mode production"
  }
}
```

## 5. 目录示例

```text
.
├─ src/
│  └─ index.ts
├─ index.html
├─ package.json
├─ tsconfig.json
└─ webpack.config.js
```

## 常见问题

### `Cannot find name 'document'`
- 原因：`lib` 没有包含 DOM
- 解决：在 `tsconfig` 的 `compilerOptions.lib` 中添加 `DOM`

### 第三方包没有类型
- 优先安装 `@types/xxx`
- 没有现成类型时，新建 `types/*.d.ts` 自行声明
