import { defineCollection } from 'vuepress-theme-plume';

export const nodeCollection = defineCollection({
  type: 'doc',
  dir: 'node',
  title: 'Node',
  sidebar: [
    {
      text: 'Node 总览',
      collapsed: false,
      items: [
        { text: '概览', link: '/node/' },
      ],
    },
    {
      text: 'Bun 专题',
      collapsed: false,
      items: [
        { text: '专题总览', link: '/node/bun/' },
      ],
    },
    {
      text: '基础篇',
      collapsed: false,
      items: [
        { text: '简介', link: '/node/bun/intro/' },
        { text: '模块', link: '/node/bun/modules/' },
        { text: 'TS 支持', link: '/node/bun/typescript/' },
        { text: 'Buffer', link: '/node/bun/buffer/' },
        { text: '文件处理', link: '/node/bun/files/' },
      ],
    },
    {
      text: '服务端篇',
      collapsed: false,
      items: [
        { text: 'HTTP 服务器', link: '/node/bun/http/' },
        { text: 'Bun 与 WebSocket', link: '/node/bun/websocket/' },
      ],
    },
    {
      text: '生态篇',
      collapsed: false,
      items: [
        { text: 'Bun 与 Express', link: '/node/bun/express/' },
        { text: 'Bun 与 SQLite', link: '/node/bun/sqlite/' },
        { text: 'Elysia', link: '/node/bun/elysia/' },
      ],
    },
    {
      text: '实战篇',
      collapsed: false,
      items: [
        { text: 'CRUD 应用', link: '/node/bun/crud/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
