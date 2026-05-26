import { defineCollection } from 'vuepress-theme-plume';

export const electronCollection = defineCollection({
  type: 'doc',
  dir: 'electron',
  title: 'Electron',
  sidebar: [
    // {
    //   text: '基础篇',
    // },
    {
      text: '原理篇',
      items: [
        {
          text: 'Node 执行环境',
          link: '/electron/aisvw1te/'
        },
        {
          text: 'API 支持',
          link: '/electron/3xl557ck/'
        },
        {
          text: '系统底层支持',
          link: '/electron/v1afpl07/'
        },
        {
          text: '解析 asar 文件',
          link: '/electron/uuxr1ozd/'
        },
        {
          text: '进程通信',
          link: '/electron/zgtxe1f1/',
        },
        {
          text: '页面事件',
          link: '/electron/ldor6ily/',
        },
        {
          text: 'electron-builder 原理',
          link: '/electron/syatl928/',
        },
        {
          text: 'electron-updater 原理',
          link: '/electron/a6iw1gf0/',
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
