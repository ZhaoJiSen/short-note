/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume';

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  {
    text: '编程语言',
    icon: '',
    items: [
      {
        text: 'Rust',
        link: 'rust/index.md',
        icon: 'material-icon-theme:rust',
      },
      {
        text: 'Node',
        link: '/node/index.md',
        icon: 'material-icon-theme:nodejs',
      },
      {
        text: 'JavaScript',
        link: '/javascript/index.md',
        icon: 'material-icon-theme:javascript',
      },
    ],
  },
  {
    text: '前端框架',
    items: [
      {
        text: 'Vue',
        icon: 'material-icon-theme:vue',
        link: '/vue/index.md',
      },
      {
        text: 'React',
        icon: 'material-icon-theme:react',
        link: '/react/index.md',
      },
    ],
  },
  {
    text: '前端工程化',
    link: '/engineering/Babel/1.使用与编译过程.md',
  },
  {
    text: '友情链接',
    link: '/friends/',
  },
]);
