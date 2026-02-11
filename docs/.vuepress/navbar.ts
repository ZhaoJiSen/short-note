/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume';

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/tags/' },
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
      {
        text: "TypeScript",
        link: '/typescript/setup/',
        icon: 'material-icon-theme:typescript'
      }
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
        text: '模块化',
        icon: 'material-icon-theme:folder-gh-workflows',
        link: ''
      },
      {
        text: '包管理',
        icon: 'material-icon-theme:npm',
        link: ''

      },
      {
        text: 'Babel',
        icon: 'material-icon-theme:babel',
        link: ''
      },
      {
        text: '构建工具',
        items: [
          {
            text: 'Vite',
            link: '/engineering/nqqf1ea4/',
            icon: 'material-icon-theme:vite',
          },
          {
            text: 'Webpack',
            link: '/engineering/Webpack/54ln0klw/',
            icon: 'material-icon-theme:webpack',
          },
          {
            text: 'Rollup',
            link: '/engineering/build-rollup/',
            icon: 'material-icon-theme:rollup',
          },
          {
            text: 'esbuild',
            link: '/engineering/build-esbuild/',
            icon: 'material-icon-theme:esbuild',
          },
        ],
      },
      {
        text: '任务自动化',
        items: [
          {
            text: 'Gulp',
            link: '/engineering/gulp-guide/',
            icon: 'material-icon-theme:gulp',
          },
        ],
      },
    ],
  },
  {
    text: '友情链接',
    link: '/friends/',
  },
]);
