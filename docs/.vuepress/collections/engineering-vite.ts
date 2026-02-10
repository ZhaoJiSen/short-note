import { defineCollection } from 'vuepress-theme-plume';

export const viteCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/Vite',
  title: 'Vite',
  sidebar: [
    {
      text: 'Vite',
      collapsed: false,
      items: [
        { text: '基本使用', link: '/engineering/nqqf1ea4/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
