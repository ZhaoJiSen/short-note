import { defineCollection } from 'vuepress-theme-plume';

export const notesCollection = defineCollection({
  type: 'doc',
  dir: 'node',
  title: 'Node',
  sidebar: [
    {
      text: 'Node 模块',
      collapsed: false,
      items: [
        {
          text: 'fs ',
          link: '/node/1jbhp0rf/',
        },
        {
          text: 'path',
          link: '/node/m4tkcgr5/',
        },
        {
          text: 'http',
          link: '/node/zyzfztfm/',
        },
      ],
    },
    {
      text: '二进制与 Buffer',
      collapsed: false,
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
