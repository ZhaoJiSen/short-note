import { defineCollection } from 'vuepress-theme-plume';

export const bunCollection = defineCollection({
  type: 'doc',
  dir: 'bun',
  title: 'Bun',
  sidebar: [
    {
      text: '基础篇',
      collapsed: false,
      items: [
        { text: '简介', link: '/bun/flp74gm9/' },
        { text: '二进制数据处理', link: '/bun/j3o1v6by/' },
        { text: '文件处理', link: '/bun/kwuel2pb/' },
        { text: 'HTTP 服务器', link: '/bun/sksujf84/' },
        { text: 'Bun 与 WebSocket', link: '/bun/gn2p8vzm/' }
      ],
    },
    {
      text: '框架篇',
      collapsed: false,
      items: [
        { text: 'Elysia', link: '/bun/00lxjpog/' },
        { text: 'Bun 与 Express', link: '/bun/fh1j1r45/' },
        { text: 'Bun 与 SQLite', link: '/bun/pag35l2e/' },
      ],
    },
    {
      text: '实战篇',
      collapsed: false,
      items: [{ text: 'CRUD 应用', link: '/bun/crud/' }],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
