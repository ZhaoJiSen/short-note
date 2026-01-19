import { defineCollection } from 'vuepress-theme-plume';

export const reactCollection = defineCollection({
  type: 'doc',
  dir: 'react',
  title: 'React',
  sidebar: [],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
})
