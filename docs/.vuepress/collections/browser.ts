import { defineCollection } from 'vuepress-theme-plume';

export const browserCollection = defineCollection({
  type: 'doc',
  dir: '浏览器',
  title: '浏览器',
  sidebar: [
    {
      text: '宏观视角下的浏览器',
      collapsed: false,
      items: [
        {
          text: '浏览器的进程模型',
          link: '/浏览器/0pkbd4hl/',
        },
        {
          text: '导航流程',
          link: '/浏览器/avqghghu/',
        },
        {
          text: '渲染流程',
          link: '/浏览器/m396ohn4/',
        },
        {
          text: 'HTTP 请求流程与连接管理',
          link: '/浏览器/g9wen3tg/',
        },
      ],
    },
    {
      text: 'JavaScript 执行机制',
      collapsed: false,
      items: [
        {
          text: '变量提升与执行上下文',
          link: '/浏览器/gvghxr77/',
        },
        {
          text: '调用栈',
          link: '/浏览器/0sml7a3d/',
        },
        {
          text: '作用域和作用域链',
          link: '/浏览器/p2wdajw0/',
        },
      ],
    },
    {
      text: 'V8 引擎工作原理',
      collapsed: false,
      items: [
        {
          text: '栈空间和堆空间',
          link: '/浏览器/5gybdts9/',
        },
        {
          text: '垃圾回收',
          link: '/浏览器/iazznt48/',
        },
        {
          text: 'V8 引擎执行机制',
          link: '/浏览器/ko9zfu7j/',
        },
      ],
    },
    {
      text: '页面循环',
      collapsed: false,
      items: [
        {
          text: '消息队列与事件循环',
          link: '/浏览器/iy6vaqnv/',
        },
      ],
    },
    {
      text: '网络安全',
      collapsed: false,
      items: [
        {
          text: '同源策略',
          link: '/浏览器/7u2fqt26/',
        },
        {
          text: '跨域',
          link: '/浏览器/o4w1ldgv/',
        },
        {
          text: '跨站脚本攻击 XSS',
          link: '/浏览器/he21jt3t/',
        },
        {
          text: '跨站请求伪造 CSRF',
          link: '/浏览器/25fncqpc/',
        },
        {
          text: 'HTTPS',
          link: '/浏览器/ttowc08e/',
        },
      ],
    },
    {
      text: 'WebSocket',
      link: '/浏览器/150p4d3o/',
    },
    {
      text: '实时音视频',
      collapsed: false,
      items: [
        {
          text: '视频基础知识',
          link: '/浏览器/50wtmu97/',
        },
        {
          text: 'RTSP',
          link: '/浏览器/lxv4xbxm/',
        },
        {
          text: 'RTMP',
          link: '/浏览器/9v90fzhl/',
        },
        {
          text: 'WebRTC',
          link: '/浏览器/v5zsqz2k/',
        },
      ],
    }
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
