import { defineCollection } from 'vuepress-theme-plume';

export const javascriptCollection = defineCollection({
  type: 'doc',
  dir: 'javascript',
  title: 'JavaScript',
  sidebar: [
    {
      text: '数组',
      collapsed: false,
      items: [
        {
          text: '数组基础',
          link: '/javascript/cbgsiypg/',
        },
        {
          text: '类数组',
          link: '/javascript/yyt0ar1b/',
        },
        {
          text: '数组方法',
          link: '/javascript/iws6jard/',
        },
      ],
    },
    {
      text: '对象',
      collapsed: false,
      items: [
        {
          text: '对象与构造函数',
          link: '/javascript/fkjzwaty/',
        },
        {
          text: '包装类与内置构造器',
          link: '/javascript/0s0qdstf/',
        },
        {
          text: '原型、原型链与继承',
          link: '/javascript/au5hqeji/',
        },
        {
          text: 'this 与 call/apply/bind',
          link: '/javascript/odk0c0d1/',
        },
        {
          text: '对象遍历与常用方法',
          link: '/javascript/7amfckoe/',
        },
        {
          text: '对象拷贝与克隆',
          link: '/javascript/ocicw8u6/',
        },
        {
          text: 'defineProperty',
          link: '/javascript/j0rc922y/',
        },
      ],
    },
    {
      text: 'ES6',
      collapsed: false,
      items: [
        {
          text: '块级绑定',
          link: '/javascript/r4qjmosy/',
        },
        {
          text: '字符串与正则表达式',
          link: '/javascript/25tpt05n/',
        },
        {
          text: '函数',
          collapsed: true,
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
          text: '对象',
          collapsed: true,
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
          text: '类',
          collapsed: true,
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
          text: '解构赋值',
        },
        {
          text: '异步处理',
          collapsed: true,
          items: [
            {
              text: 'Promise',
              link: '/javascript/32x2g3bg/',
            },
            {
              text: 'async 与 await',
              link: '/javascript/jzo2jqhe/',
            },
            {
              text: '手写 Promise',
              link: '/javascript/v6d16zmc/',
            },
          ],
        },
        {
          text: 'Fetch',
        },
        {
          text: '迭代器与生成器',
          collapsed: true,
          items: [
            {
              text: '基本使用',
              link: '/javascript/ykbm3k4m/',
            },
            {
              text: '手写 async 与 await',
              link: '/javascript/dnp262kk/',
            },
          ],
        },
        {
          text: '新增的集合类型',
          collapsed: true,
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
          text: '代理与反射',
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
