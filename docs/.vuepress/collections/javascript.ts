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
          link: '/javascript/r4qjmosy/',
        },
        {
          text: '2. 字符串与正则表达式',
        },
        {
          text: '3. 函数',
          collapsed: false,
          items: [
            {
              text: '参数默认值与展开运算符',
              link: '/javascript/pd19visc/',
            },
            {
              text: '箭头函数',
              link: '/javascript/m5kcwosw/',
            },
          ],
        },
        {
          text: '4. 对象',
          collapsed: false,
          items: [
            {
              text: '对象字面量与新增 API',
              link: '/javascript/9ila0ak7/',
            },
            {
              text: 'Symbol',
              link: '/javascript/t3nmduvx/',
            },
          ],
        },
        {
          text: '5. 类',
          collapsed: false,
          items: [
            {
              text: '类',
              link: '/javascript/csj0pcak/',
            },
            {
              text: '类的继承与修饰器模式',
              link: '/javascript/uayggxyp/',
            },
          ],
        },
        {
          text: '6. 解构赋值',
        },
        {
          text: '7. Promise',
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
          text: '8. Fetch',
        },
        {
          text: '9. 迭代器与生成器',
        },
        {
          text: '10. 新增的集合类型',
          items: [
            {
              text: 'Map',
              link: '/javascript/1sffq7mh/',
            },
            {
              text: 'Set',
              link: '/javascript/kgro7enj/',
            },
            {
              text: 'WeakMap 与 WeakSet',
              link: '/javascript/ktcbv926/',
            },
          ],
        },
        {
          text: '11. 代理与反射',
          link: '/javascript/pm6r5fvv/',
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
