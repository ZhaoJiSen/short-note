import { defineCollection } from 'vuepress-theme-plume';

export const babelCollection = defineCollection({
  type: 'doc',
  dir: '工程化/Babel',
  linkPrefix: '/babel/',
  title: 'Babel',
  sidebar: [
    {
      text: '导读',
      collapsed: true,
      items: [
        { text: '通关秘籍导读与章节地图', link: '/babel/guide/' },
      ],
    },
    {
      text: '基础篇',
      collapsed: true,
      items: [
        { text: '1.Babel 的介绍', link: '/babel/course/ch01/' },
        { text: '2.Babel 的编译流程', link: '/babel/course/ch02/' },
        { text: '3.Babel 的 AST', link: '/babel/course/ch03/' },
        { text: '4.Babel 的 API', link: '/babel/course/ch04/' },
      ],
    },
    {
      text: '实战与原理篇',
      collapsed: true,
      items: [
        { text: '5.实战案例：插入函数调用参数', link: '/babel/course/ch05/' },
        { text: '6.JS Parser 的历史', link: '/babel/course/ch06/' },
        { text: '7.traverse 的 path、scope、visitor', link: '/babel/course/ch07/' },
        { text: '8.Generator 和 SourceMap 的奥秘', link: '/babel/course/ch08/' },
        { text: '9.Code-Frame 和代码高亮原理', link: '/babel/course/ch09/' },
      ],
    },
    {
      text: '插件工程化篇',
      collapsed: false,
      items: [
        { text: '10.Babel 插件和 preset', link: '/babel/course/ch10/' },
        { text: '11.Babel 插件的单元测试', link: '/babel/course/ch11/' },
        { text: '12.Babel 的内置功能（上）', link: '/babel/course/ch12/' },
        { text: '13.Babel 的内置功能（下）', link: '/babel/course/ch13/' },
        { text: '14.Babel 配置的原理', link: '/babel/course/ch14/' },
        { text: '15.工具介绍：VSCode Debugger 的使用', link: '/babel/course/ch15/' },
        { text: '16.实战案例：自动埋点', link: '/babel/course/ch16/' },
      ],
    },
    {
      text: '高阶与调试篇',
      collapsed: true,
      items: [
        { text: '24.Babel Macros', link: '/babel/course/ch24/' },
        { text: '25.如何调试 Babel 源码？', link: '/babel/course/ch25/' },
      ],
    },
    {
      text: '手写 Babel 系列',
      collapsed: true,
      items: [
        { text: '26.手写 Babel：思路篇', link: '/babel/course/ch26/' },
        { text: '27.手写 Babel：parser 篇', link: '/babel/course/ch27/' },
        { text: '28.手写 Babel：traverse 篇', link: '/babel/course/ch28/' },
        { text: '29.手写 Babel：traverse -- path篇', link: '/babel/course/ch29/' },
        { text: '30.手写 Babel：traverse -- scope篇', link: '/babel/course/ch30/' },
        { text: '31.手写 Babel：generator篇', link: '/babel/course/ch31/' },
        { text: '32.手写 Babel：core篇', link: '/babel/course/ch32/' },
        { text: '33.手写 Babel：cli篇', link: '/babel/course/ch33/' },
        { text: '34.手写 Babel：总结', link: '/babel/course/ch34/' },
      ],
    },
    {
      text: '收官与加餐',
      collapsed: true,
      items: [
        { text: '35.小册总结', link: '/babel/course/ch35/' },
        {
          text: '36.加餐：会了 babel 插件，就会写 prettier 插件',
          link: '/babel/course/ch36/',
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
