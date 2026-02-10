import { defineCollection } from 'vuepress-theme-plume';

export const webpackCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/Webpack',
  title: 'Webpack',
  sidebar: [
    {
      text: 'Webpack',
      collapsed: false,
      items: [
        { text: 'Webpack', link: '/engineering/build-webpack/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
