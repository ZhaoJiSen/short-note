import { defineCollection } from 'vuepress-theme-plume';

export const babelCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/Babel',
  title: 'Babel',
  sidebar: [
    {
      text: 'Babel',
      collapsed: false,
      items: [
        { text: '使用与编译过程', link: '/engineering/sd6e128i/' },
        { text: '编译原理', link: '/engineering/3yt2zsv4/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
