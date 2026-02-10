import { defineCollection } from 'vuepress-theme-plume';

export const modularizationCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/Modularization',
  title: '模块化',
  sidebar: [
    {
      text: '模块化',
      collapsed: false,
      items: [
        { text: '模块化概览', link: '/engineering/3kxdqfi5/' },
        { text: 'ES Module', link: '/engineering/laegs7pa/' },
        { text: 'CommonJS', link: '/engineering/8hn64fr6/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
