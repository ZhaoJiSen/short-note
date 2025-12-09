import { defineCollections, defineCollection } from 'vuepress-theme-plume';

const rustCollection = defineCollection({
  type: 'doc',
  dir: 'rust',
  title: 'Rust',
  sidebar: [
    {
      text: '基础知识',
      collapsed: false,
      items: [
        {
          text: '基本概念',
          collapsed: true,
          items: [
            { text: '1. 变量与可变性', link: '/rust/o8agolw4/' },
            { text: '2. 数据类型', link: '/rust/di2oup8x/' },
            { text: '3. 函数', link: '/rust/ipu2tdvh/' },
            { text: '4. 注释', link: '/rust/kn1r3ozu/' },
            { text: '5. 控制流', link: '/rust/7jxc7tz7/' },
          ],
        },
        {
          text: '所有权',
          collapsed: true,
          items: [
            { text: '1. 所有权', link: '/rust/kf7myiln/' },
            { text: '2. 引用与借用', link: '/rust/pajnqj8w/' },
          ],
        },
        {
          text: '结构体',
          collapsed: true,
          items: [
            { text: '1. 基本使用', link: '/rust/e68jmm5c/' },
            { text: '2. 方法', link: '/rust/p21lsigg/' },
          ],
        },
        {
          text: '枚举与匹配模式',
          collapsed: true,
          items: [
            { text: '1. 枚举', link: '/rust/7342g17i/' },
            { text: '2. match 控制结构', link: '/rust/hpzb7ag9/' },
            { text: '3. 简洁控制流', link: '/rust/fbhcsnsn/' },
          ],
        },
        {
          text: '包管理',
          collapsed: true,
          items: [
            {
              text: '包管理',
              link: '/rust/n40nc8u5/',
            },
          ],
        },
        {
          text: '集合',
          collapsed: true,
          items: [
            { text: '1. 动态数组', link: '/rust/bkb5lpbm/' },
            { text: '2. 字符串', link: '/rust/nytp8hdg/' },
            { text: '2. HashMap', link: '/rust/88xu261b/' },
          ],
        },
        {
          text: '错误处理',
          collapsed: true,
          items: [
            { text: '1. 处理不可恢复错误', link: '/rust/mrknlbd8/' },
            { text: '2. 处理可恢复错误', link: '/rust/qh8cg73j/' },
          ],
        },
        {
          text: '泛型、Trait 与生命周期',
          collapsed: true,
          items: [
            { text: '1. 泛型', link: '/rust/7n8042c8/' },
            { text: '2. Trait', link: '/rust/bgra68f2/' },
            { text: '3. 生命周期', link: '/rust/zyr3z8hb/' },
          ],
        },
      ],
    },
    {
      text: '进阶',
      collapsed: false,
      items: [
        {
          text: '迭代器与闭包',
          collapsed: true,
          items: [
            {
              text: '闭包',
              link: '/rust/y6wm3pka/',
            },
            {
              text: '迭代器',
              link: '/rust/ndd09h9b/',
            },
          ],
        },
        {
          text: '智能指针',
          collapsed: true,
          items: [
            { text: 'Box&lt;T&gt', link: '/rust/kh4d8n14/' },
            { text: 'Rc&lt;T&gt', link: '/rust/16s6qq6n/' },
            { text: 'RefCell&lt;T&gt', link: '/rust/s1aq3ip7/' },
          ],
        },
        {
          text: '多线程',
          collapsed: true,
          items: [
            { text: '基本使用', link: '/rust/v5a8bx4o/' },
            { text: '线程通信', link: '/rust/sptujqqg/' },
          ],
        },
        {
          text: '异步编程',
          collapsed: true,
          items: [
            { text: '基本使用', link: '/rust/yxgj4re7/' },
            { text: 'Streams', link: '/rust/qqm7oxdz/' },
            { text: 'tokio', link: '/rust/5x9cw82i/' },
          ],
        },
      ],
    },
  ],
});

const javascriptCollection = defineCollection({
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
        },
        {
          text: '10. 代理与反射',
        },
      ],
    },
  ],
});

export default defineCollections([rustCollection, javascriptCollection]);
