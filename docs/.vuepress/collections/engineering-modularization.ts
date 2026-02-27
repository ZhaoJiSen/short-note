import { defineCollection } from 'vuepress-theme-plume';

export const modularizationCollection = defineCollection({
  type: 'doc',
  dir: '工程化/模块化',
  linkPrefix: '/modularization/',
  title: '模块化',
  sidebar: [
    {
      text: '模块化',
      collapsed: false,
      items: [
        { text: '模块化概览', link: '/modularization/' },
        { text: 'ES Module', link: '/modularization/0xn4bq3b/' },
        { text: 'CommonJS', link: '/modularization/d12bafr7/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
