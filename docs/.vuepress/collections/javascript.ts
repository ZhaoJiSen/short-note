import { defineCollection } from 'vuepress-theme-plume';

export const javascriptCollection = defineCollection({
  type: 'doc',
  dir: 'javascript',
  title: 'JavaScript',
  sidebar: [
    {
      text: 'ES6',
      collapsed: false,
      items: [
        {
          text: '1. 块级绑定',
        },
        {
          text: '2. 字符串与正则表达式',
        },
        {
          text: '3. 函数',
        },
        {
          text: '4. 对象',
        },
        {
          text: '5. 解构赋值',
        },
        {
          text: '6. Promise',
          collapsed: false,
          items: [
            {
              text: '基本使用',
            },
            {
              text: 'async 与 await',
            },
            {
              text: '手写 Promise',
            },
            {
              text: 'Promise 面试题',
            },
          ],
        },
        {
          text: '7. Fetch',
        },
        {
          text: '8. 迭代器与生成器',
        },
        {
          text: '9. 新增的集合类型',
          items: [
            {
              text: 'Map',
              link: '/javascript/1sffq7mh/'
            },
            {
              text: 'Set',
              link: '/javascript/kgro7enj/'
            }
          ]
        },
        {
          text: '10. 代理与反射',
        },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
