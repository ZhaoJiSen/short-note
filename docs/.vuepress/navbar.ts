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
    items: [
      {
        text: 'JavaScript',
        link: '/javascript/',
        icon: 'material-icon-theme:javascript',
      },
      {
        text: 'TypeScript',
        link: '/typescript/',
        icon: 'material-icon-theme:typescript',
      },
      {
        text: 'Go',
        icon: 'material-icon-theme:go-gopher',
        link: '/go/',
      },
      {
        text: 'Rust',
        link: '/rust/',
        icon: 'material-icon-theme:rust',
      },
    ],
  },
  {
    text: '运行时与平台',
    items: [
      {
        text: 'Browser',
        link: '/browser/0pkbd4hl/',
        icon: 'material-icon-theme:http'
      },
      {
        text: 'Node',
        link: '/node/',
        icon: 'material-icon-theme:nodejs',
      },
      {
        text: 'Bun',
        link: '/bun/flp74gm9/',
        icon: 'material-icon-theme:bun',
      },
    ],
  },
  {
    text: '前端框架',
    items: [
      {
        text: 'Vue',
        icon: 'material-icon-theme:vue',
        link: '/vue/',
      },
      {
        text: 'React',
        icon: 'material-icon-theme:react',
        link: '/react/',
      },
    ],
  },
  {
    text: '工程化',
    items: [
      {
        text: '模块化',
        icon: 'material-icon-theme:folder-gh-workflows',
        link: '/engineering/3kxdqfi5/',
      },
      {
        text: '包管理',
        icon: 'material-icon-theme:npm',
        link: '/engineering/ghjscjaz/',
      },
      {
        text: 'Babel',
        link: '/engineering/sd6e128i/',
        icon: 'material-icon-theme:babel',
      },
      {
        text: '构建工具',
        icon: 'material-icon-theme:folder-tools-open',
        link: '/engineering/Webpack/54ln0klw/',
      },
    ],
  },
  {
    text: '友情链接',
    link: '/friends/',
  },
]);
