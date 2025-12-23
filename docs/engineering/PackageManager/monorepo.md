---
title: Monorepo
createTime: 2025/12/23 21:03:43
permalink: /engineering/ubsba9hj/
---

## 基本概念

Monorepo（单一代码库）指==把多个相关项目或包放在同一个仓库中统一管理==。它强调共享依赖与配置、统一的构建与发布流程，便于跨包协作、代码复用与一致性治理，同时也需要更完善的依赖管理与构建工具来控制规模与效率

在 Monorepo 管理中常用的工具包括 **`pnpm`**、`yarn`、`Lerna` 等，通常会采用如下的目录组织方式

::: file-tree

- docs  文档类型的包
- apps  通常放可独立运行/部署的应用项目
  - backend
  - frontend
    - mobile
    - web
- packages 通常放可被复用的库/组件/工具包
  - cli
    - release.sh
  - utils
    - request.ts
  - components
    - Input.vue
    - Form.vue
    - Table.vue
- package.json
- pnpm-workspace.yaml

:::

## 基本使用

如果要用 pnpm 进行工程管理，那么首选需要创建 `pnpm-workspace.yaml`

```bash
touch pnpm-workspace.yaml 
```

该文件主要用来定义工作区范围

```yaml title="pnpm-workspace.yaml"
packages:
  - "packages/*"
  - "apps/*"
  - "docs/*"
```

::: details 常见的 monorepo 命令
1. `pnpm -w install` 在根目录安装并链接所有工作区依赖
2. `pnpm -w init` 在工作区根目录初始化 `package.json`
3. `pnpm -r run build` 在所有包中执行 build 脚本
4. `pnpm -F <pkg> dev` 在指定包中执行脚本（如 `pnpm -F web dev`）
5. `pnpm add <dep> -w` 把依赖添加到根工作区
6. `pnpm add <dep> -F <pkg>` 把依赖添加到指定包
7. `pnpm list -r` 查看所有包的依赖树
:::

### 环境版本锁定

为避免不同开发机/CI 的 Node 与 pnpm 版本不一致，通常会在仓库中固定版本：

1. 在 `package.json` 声明 `engines` 与 `packageManager`
2. 在 `.nvmrc` 或 `.node-version` 固定 Node 版本
3. 在 `.npmrc` 声明 `engine-strict=true` 来严格校验 `engines` 的版本信息

:::code-tabs

@tab package.json
```json
{
  "engines": {
    "node": ">=18 <21"
  },
  "packageManager": "pnpm@8.15.0"
}
```

@tab .npmrc
```text
engine-strict=true
```

@tab .nvmrc
```text
18.19.0
```

:::

### 通用配置

#### 使用 TypeScript

:::: steps

1. 安装 TypeScript

   ```bash
   pnpm i -D -w typescript @types/node
   ```

2. 初始化 `tsconfig.json`

   ```bash
   npx tsc --init
   ```

3. 特殊的子包配置

   在不同子包下可以有自己单独的配置

   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "lib": ["ESNext", "DOM"],
       "include": ["src"]
     }
   }
   ```

::::

#### Prettier

:::: steps
1. 安装 prettier

   ```bash
   pnpm i -D -w prettier
   ```

2. 创建 `prettier.config.js`

   ```js
   /**
    * @type {import('prettier').Config}
    * @see https://www.prettier.cn/docs/options
    */
   export default {
     // 指定最大换行长度
     printWidth: 130,
     // 缩进制表符宽度 | 空格数
     tabWidth: 2,
     // 使用制表符而不是空格缩进行 (true：制表符，false：空格)
     useTabs: false,
     // 结尾不用分号 (true：有，false：没有)
     semi: true,
     // 使用单引号 (true：单引号，false：双引号)
     singleQuote: true,
     // 在对象字面量中决定是否将属性名用引号括起来 可选值 "<as-needed|consistent|preserve>"
     quoteProps: "as-needed",
     // 在JSX中使用单引号而不是双引号 (true：单引号，false：双引号)
     jsxSingleQuote: false,
     // 多行时尽可能打印尾随逗号 可选值"<none|es5|all>"
     trailingComma: "none",
     // 在对象，数组括号与文字之间加空格 "{ foo: bar }" (true：有，false：没有)
     bracketSpacing: true,
     // 将 > 多行元素放在最后一行的末尾，而不是单独放在下一行 (true：放末尾，false：单独一行)
     bracketSameLine: false,
     // (x) => {} 箭头函数参数只有一个时是否要有小括号 (avoid：省略括号，always：不省略括号)
     arrowParens: "avoid",
     // 指定要使用的解析器，不需要写文件开头的 @prettier
     requirePragma: false,
     // 可以在文件顶部插入一个特殊标记，指定该文件已使用 Prettier 格式化
     insertPragma: false,
     // 用于控制文本是否应该被换行以及如何进行换行
     proseWrap: "preserve",
     // 在html中空格是否是敏感的 "css" - 遵守 CSS 显示属性的默认值， "strict" - 空格被认为是敏感的 ，"ignore" - 空格被认为是不敏感的
     htmlWhitespaceSensitivity: "css",
     // 控制在 Vue 单文件组件中 <script> 和 <style> 标签内的代码缩进方式
     vueIndentScriptAndStyle: false,
     // 换行符使用 lf 结尾是 可选值 "<auto|lf|crlf|cr>"
     endOfLine: "auto",
     // 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码 (rangeStart：开始，rangeEnd：结束)
     rangeStart: 0,
     rangeEnd: Infinity
   };
   ```

3. 创建 `.prettierignore`

   ```text
   dist
   public
   .local
   node_modules
   pnpm-lock.yaml
   ```

4. `prettier` 脚本

   ```json
   "scripts": {
     "lint:prettier": "prettier --write \"**/*.{js,ts,json,tsx,css,vue,html,md}\""
   }
   ```
::::

#### ESlint

:::: steps
1. 安装 ESLint 及其相关依赖

   ```bash
   pnpm i -D -w eslint @eslint/js globals 
   pnpm i -D -w typescript-eslint eslint-plugin-vue eslint-config-prettier
   ```

2. 创建 `eslint.config.js`

   ```js
   import js from "@eslint/js";
   import globals from "globals";
   import tseslint from "typescript-eslint";
   import vue from "eslint-plugin-vue";
   import eslintConfigPrettier from "eslint-config-prettier";

   const baseFiles = [
     "apps/frontend/**/*.{js,ts,tsx,vue}",
     "packages/**/*.{js,ts,tsx,vue}"
   ];
   const tsFiles = ["apps/frontend/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"];
   const vueFiles = ["apps/frontend/**/*.vue", "packages/**/*.vue"];

   export default [
     {
       ignores: ["dist", "public", ".local", "node_modules", "pnpm-lock.yaml"]
     },
     {
       files: baseFiles,
       languageOptions: {
         globals: {
           ...globals.browser,
           ...globals.node
         }
       }
     },
     { ...js.configs.recommended, files: baseFiles },
     ...tseslint.configs.recommended.map(config => ({ ...config, files: baseFiles })),
     {
       files: tsFiles,
       rules: {
         "@typescript-eslint/naming-convention": [
           "error",
           { selector: "typeLike", format: ["PascalCase"] },
           { selector: "enumMember", format: ["PascalCase"] },
           { 
              selector: "variable", 
              format: ["camelCase", "UPPER_CASE"], 
              leadingUnderscore: "allow"
            },
           { selector: "function", format: ["camelCase"] },
           { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
           { selector: "default", format: ["camelCase"], leadingUnderscore: "allow" }
         ]
       }
     },
     { ...vue.configs["flat/recommended"], files: vueFiles },
     {
       files: vueFiles,
       languageOptions: {
         parserOptions: {
           parser: tseslint.parser
         }
       },
       rules: {
         "vue/attributes-order": [
           "error",
           {
             order: [
               "DEFINITION",
               "LIST_RENDERING",
               "CONDITIONALS",
               "RENDER_MODIFIERS",
               "GLOBAL",
               "UNIQUE",
               "SLOT",
               "TWO_WAY_BINDING",
               "OTHER_DIRECTIVES",
               "OTHER_ATTR",
               "EVENTS",
               "CONTENT"
             ],
             alphabetical: false
           }
         ]
       }
     },
     { ...eslintConfigPrettier, files: baseFiles }
   ];
   ```

3. `eslint` 脚本

   ```json
   "scripts": {
     "lint:eslint": "eslint .",
     "lint:eslint:fix": "eslint . --fix"
   }
   ```
::::

### git 提交规范

#### commitizen

#### husky

#### lint-staged

## 公共库打包

## 子包依赖

## 发布
