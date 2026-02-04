/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume';

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  // { text: '博客', link: '/blog/' },
  {
    text: '编程语言',
    icon: '',
    items: [
      {
        text: "Go",
        icon: "material-icon-theme:go-gopher",
        link: "/go/index.md"
      },

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
        text: "Python",
        icon: "material-icon-theme:python",
        link: ""
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
    items: [
      {
        text: "模块化",
        link: "/engineering/Modularization",
        icon: "material-icon-theme:folder-gh-workflows"
      },
      {
        text: "包管理器",
        link: "/engineering/PackageManager/npm.md",
        icon: "material-icon-theme:npm"
      },
      {
        text: "Babel",
        link: "/engineering/Babel",
        icon: "material-icon-theme:babel"
      },
      {
        text: "Gulp",
        link: "/engineering/Gulp",
        icon: "material-icon-theme:gulp"
      },
      {
        text: "Webpack",
        link:  "/engineering/Webpack",
        icon: "material-icon-theme:webpack"
      },
      {
        text: "Vite",
        link: "/engineering/Vite",
        icon: "material-icon-theme:vite"
      }
    ]
  },
  {
    text: '友情链接',
    link: '/friends/',
  },
]);
