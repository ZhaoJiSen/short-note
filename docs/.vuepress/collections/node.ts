import { defineCollection } from 'vuepress-theme-plume';

export const nodeCollection = defineCollection({
  type: 'doc',
  dir: 'node',
  title: 'Node',
  sidebar: [],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
