import { defineCollection } from 'vuepress-theme-plume';

export const pythonCollection = defineCollection({
  type: 'doc',
  dir: 'python',
  title: 'Python',
  sidebar: [
    {
      
    }
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  }
})
