import { defineCollection } from 'vuepress-theme-plume';

export const gulpCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/Gulp',
  title: 'Gulp',
  sidebar: [
    {
      text: 'Gulp',
      collapsed: false,
      items: [
        { text: 'Gulp', link: '/engineering/gulp-guide/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
