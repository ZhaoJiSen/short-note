import { defineCollection } from 'vuepress-theme-plume';

export const typescriptCollection = defineCollection({
  type: 'doc',
  dir: 'typescript',
  title: 'TypeScript',
  sidebar: [
    {
      text: '基础篇',
      collapsed: false,
      items: [
        { text: '概述与安装', link: '/typescript/setup/' },
        { text: '类型系统基础', link: '/typescript/type-system/' },
        { text: '内置类型与类型断言', link: '/typescript/builtin-and-assertion/' },
        { text: '接口与类型别名', link: '/typescript/interface-and-type/' },
        { text: '函数', link: '/typescript/functions/' },
        { text: '字面量联合与枚举', link: '/typescript/literal-union-enum/' },
        { text: '类型兼容性', link: '/typescript/compatibility/' },
      ],
    },
    {
      text: '进阶篇',
      collapsed: false,
      items: [
        { text: '类与面向对象', link: '/typescript/class-oop/' },
        { text: '泛型与类型编程', link: '/typescript/generics/' },
        { text: '模块化与声明文件', link: '/typescript/modules/' },
        { text: '装饰器', link: '/typescript/decorators/' },
      ],
    },
    {
      text: '工程篇',
      collapsed: false,
      items: [
        { text: 'Webpack 搭建 TS 运行环境', link: '/typescript/webpack-ts/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
