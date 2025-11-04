/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume';

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  { text: '标签', link: '/blog/tags/' },
  { text: '归档', link: '/blog/archives/' },
  {
    text: '笔记',
    items: [  
      {
        text: '浏览器',
        link: '/notes/browser/宏观视角下的浏览器/1.浏览器的进程模型.md',
        icon: 'meteor-icons:chrome',
      },
      {
        text: "工程化",
        link: "/notes/engineering/Babel/1.使用与编译过程.md",
        icon: "lucide:hammer"
      },
      {
        text: 'Rust',
        link: '/notes/rust/index.md',
        icon: 'devicon-plain:rust',
      },
    ],
  },
]);
