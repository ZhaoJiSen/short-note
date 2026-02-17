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
        { text: '文件处理', link: '/bun/files/' },
      ],
    },
    {
      text: '服务端篇',
      collapsed: false,
      items: [
        { text: 'HTTP 服务器', link: '/bun/http/' },
        { text: 'Bun 与 WebSocket', link: '/bun/websocket/' },
      ],
    },
    {
      text: '生态篇',
      collapsed: false,
      items: [
        { text: 'Bun 与 Express', link: '/bun/express/' },
        { text: 'Bun 与 SQLite', link: '/bun/sqlite/' },
        { text: 'Elysia', link: '/bun/elysia/' },
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
