import { defineCollection } from 'vuepress-theme-plume';

export const buildToolsCollection = defineCollection({
  type: 'doc',
  dir: '工程化/构建工具',
  linkPrefix: '/engineering/',
  title: '构建工具',
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
  sidebar: [
    {
      text: 'Vite',
      icon: 'material-icon-theme:vite',
      items: [
        {
          text: '基础篇',
          collapsed: false,
          items: [
            { text: 'Vite', link: '/engineering/n8cecFal/' },
            { text: '基本配置', link: '/engineering/nqqf1ea4/' },
            { text: '静态资源处理', link: '/engineering/tc4mk9c8/' },
            { text: '插件系统与钩子', link: '/engineering/fvgmzrxx/' },
            { text: 'Rolldown', link: '/engineering/kjx2cc9y/' },
          ],
        },
        {
          text: '性能优化篇',
          collapsed: false,
          items: [
            { text: '依赖预构建 optimizeDeps', link: '/engineering/1m4nkdkg/' },
            { text: '构建配置与产物分析', link: '/engineering/80pgnp3d/' },
            { text: '环境变量与多环境发布', link: '/engineering/zc6pp6yi/' },
          ],
        },
      ],
    },
    {
      text: 'Webpack',
      icon: 'material-icon-theme:webpack',
      items: [
        {
          text: '基础篇',
          collapsed: false,
          items: [
            { text: '1.基本配置', link: '/engineering/Webpack/54ln0klw/' },
            { text: '2.Sourcemap', link: '/engineering/Webpack/opin99tz/' },
            { text: '3.环境区分', link: '/engineering/Webpack/znsltfhd/' },
            {
              text: '4. Babel 与 Polyfill',
              link: '/engineering/Webpack/7ak55bpc/',
            },
            { text: '5.Loader', link: '/engineering/Webpack/e8b91wi0/' },
            { text: '6.Plugin', link: '/engineering/Webpack/xx0jikb4/' },
            { text: '7.模块联邦', link: '/engineering/Webpack/uvpkzr8u/' },
          ],
        },
        {
          text: '性能优化篇',
          collapsed: false,
          items: [
            { text: '1.资源处理', link: '/engineering/Webpack/gvnvei3s/' },
            {
              text: '2.代码分离与懒加载',
              link: '/engineering/Webpack/6ef09tkx/',
            },
            {
              text: '3.代码压缩与 Tree Shaking',
              link: '/engineering/Webpack/t5mrc0yc/',
            },
            {
              text: '4.缓存与 hash 策略',
              link: '/engineering/Webpack/94ns77dk/',
            },
            {
              text: '5.性能分析与构建提速',
              link: '/engineering/Webpack/4jcli8y3/',
            },
            {
              text: '11. 配置拆分与工程化模板',
              link: '/engineering/webpack/11-config-splitting/',
            },
          ],
        },
      ],
    },
    {
      text: 'Rollup',
      icon: 'material-icon-theme:rollup',
      link: '/engineering/z2qhzlxh/',
    },
    {
      text: 'esbuild',
      icon: 'material-icon-theme:esbuild',
      link: '/engineering/build-esbuild/',
    },
    {
      text: 'Gulp',
      icon: 'material-icon-theme:gulp',
      link: '/engineering/gulp-guide/',
    },
  ],
});
