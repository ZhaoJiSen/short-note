import { defineCollection } from 'vuepress-theme-plume';

export const esbuildCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/esbuild',
  title: 'esbuild',
  sidebar: [
    {
      text: 'esbuild',
      collapsed: false,
      items: [
        { text: 'esbuild', link: '/engineering/build-esbuild/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
