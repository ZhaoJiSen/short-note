/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume';

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  {
    text: '笔记',
    items: [
      { text: 'Rust', link: 'rust/index.md', icon: 'vscode-icons:file-type-rust' },
      {
        text: 'JavaScript',
        link: '/javascript/index.md',
        icon: 'vscode-icons:file-type-js',
      },
    ],
  },
  // { text: '博客', link: '/blog/' },
  // { text: '标签', link: '/blog/tags/' },
  // { text: '归档', link: '/blog/archives/' },
  // {
  //   text: '笔记',
  //   items: [
  // {
  //   text: 'JavaScript',
  //   link: '',
  //   icon: 'catppuccin:javascript',
  // },
  // },
  // {
  //   text: '浏览器',
  //   link: '/notes/browser/宏观视角下的浏览器/1.浏览器的进程模型.md',
  //   icon: 'catppuccin:http',
  // },
  // {
  //   text: '工程化',
  //   link: '/notes/engineering/Modularization/index.md',
  //   icon: 'catppuccin:webpack',
  // },
  // {
  //   text: 'Vue',
  //   link: '',
  //   icon: 'catppuccin:vue',
  // },
  // {
  //   text: 'React',
  //   link: '',
  //   icon: 'catppuccin:typescript-react',
  // },
  // ],
  // },
]);
