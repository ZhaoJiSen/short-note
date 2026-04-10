import { defineCollection } from 'vuepress-theme-plume';

export const reactCollection = defineCollection({
  type: 'doc',
  dir: 'react',
  title: 'React',
  sidebar: [
    {
      text: 'React',
      collapsed: false,
      icon: 'material-icon-theme:react',
      items: [
        {
          text: 'Hooks',
          collapsed: true,
          items: [
          ],
        },
        {
          text: '补充篇',
          collapsed: true,
          items: [
           
          ],
        },
        {
          text: '原理篇',
          collapsed: true,
          items: [

          ],
        },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
