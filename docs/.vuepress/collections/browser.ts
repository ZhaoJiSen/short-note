import { defineCollection } from 'vuepress-theme-plume';

export const browserCollection = defineCollection({
  type: 'doc',
  dir: 'browser',
  title: 'Browser',
  sidebar: [
    {
      text: '宏观视角下的浏览器',
      collapsed: false,
      items: [
        {
          text: '浏览器的进程模型',
          link: '/browser/0pkbd4hl/',
        },
        {
          text: '导航流程',
          link: '/browser/avqghghu/',
        },
        {
          text: '渲染流程',
          link: '/browser/m396ohn4/',
        },
        {
          text: 'HTTP 请求流程与连接管理',
          link: '/browser/g9wen3tg/',
        },
        {
          text: '跨标签页通信',
          link: '/browser/69atp78u/',
        },
      ],
    },
    {
      text: 'V8 引擎工作原理',
      collapsed: false,
      items: [
        {
          text: '栈空间和堆空间',
          link: '/browser/5gybdts9/',
        },
        {
          text: '垃圾回收',
          link: '/browser/iazznt48/',
        },
        {
          text: 'V8 引擎执行机制',
          link: '/browser/ko9zfu7j/',
        },
      ],
    },
    {
      text: '页面循环',
      collapsed: false,
      items: [
        {
          text: '消息队列与事件循环',
          link: '/browser/iy6vaqnv/',
        },
        {
          text: 'WebAPI、宏任务与微任务',
          link: '/browser/rir49oh2/',
        },
      ],
    },
    {
      text: '网络安全',
      collapsed: false,
      items: [
        {
          text: '同源策略',
          link: '/browser/7u2fqt26/',
        },
        {
          text: '跨域',
          link: '/browser/o4w1ldgv/',
        },
        {
          text: '跨站脚本攻击 XSS',
          link: '/browser/he21jt3t/',
        },
        {
          text: '跨站请求伪造 CSRF',
          link: '/browser/25fncqpc/',
        },
      ],
    },
    {
      text: 'WebSocket',
      link: '/browser/150p4d3o/',
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
