import { defineCollection } from 'vuepress-theme-plume';

export const packageManagerCollection = defineCollection({
  type: 'doc',
  dir: 'engineering/PackageManager',
  title: '包管理',
  sidebar: [
    {
      text: '包管理',
      collapsed: false,
      items: [
        { text: 'npm', link: '/engineering/ghjscjaz/' },
        { text: 'yarn', link: '/engineering/8wjw67zx/' },
        { text: 'pnpm', link: '/engineering/gbkmogs1/' },
        { text: 'Monorepo', link: '/engineering/ubsba9hj/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
