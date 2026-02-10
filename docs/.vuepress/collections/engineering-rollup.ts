import { defineCollection } from 'vuepress-theme-plume';

export const rollupCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/Rollup',
  title: 'Rollup',
  sidebar: [
    {
      text: 'Rollup',
      collapsed: false,
      items: [
        { text: 'Rollup', link: '/engineering/build-rollup/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
