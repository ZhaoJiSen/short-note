import { defineCollection } from 'vuepress-theme-plume';

export const packageManagerCollection = defineCollection({
  type: 'doc',
  dir: '工程化/包管理',
  linkPrefix: '/package-manager/',
  title: '包管理',
  sidebar: [
    {
      text: '包管理',
      collapsed: false,
      items: [
        { text: 'npm', link: '/package-manager/ghjscjaz/' },
        { text: 'yarn', link: '/package-manager/8wjw67zx/' },
        { text: 'pnpm', link: '/package-manager/gbkmogs1/' },
        { text: 'Monorepo', link: '/package-manager/ubsba9hj/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
