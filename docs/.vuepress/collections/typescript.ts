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
        { text: '概述与安装', link: '/typescript/iB2WgoFC/' },
        { text: '类型系统', link: '/typescript/PUrFXzN7/' },
        { text: '函数', link: '/typescript/wc0UJo46/' },
        { text: '枚举', link: '/typescript/wPxlweL9/' },
        { text: '模块化', link: '/typescript/pvX0q12_/' },
        { text: '类型操作', link: '/typescript/M4Ywgr63/' },
        { text: '接口', link: '/typescript/l1KYQlwl/' },
        { text: '类', link: '/typescript/wzgwoDfX/' },
        { text: '类型兼容性', link: '/typescript/-d8u-kdA/' },
      ],
    },
    {
      text: '进阶篇',
      collapsed: false,
      items: [
        
        { text: '泛型与类型编程', link: '/typescript/LjFVlP-2/' },
        { text: '装饰器', link: '/typescript/SWKeJjH5/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
