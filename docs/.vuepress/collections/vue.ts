import { defineCollection } from 'vuepress-theme-plume';

export const vueCollection = defineCollection({
  type: 'doc',
  dir: 'vue',
  title: 'Vue',
  sidebar: [
    {
      text: 'Vue',
      collapsed: false,
      icon: 'vscode-icons:file-type-vue',
      items: [
        {
          text: '补充篇',
          collapsed: true,
          items: [
            {
              text: '属性穿透',
              link: '/vue/lt7yqney/',
            },
            {
              text: '依赖注入',
            },
            {
              text: '自定义指令',
            },
            {
              text: '插件',
            },
            {
              text: 'Transition',
            },
            {
              text: 'Teleport',
            },
            {
              text: '异步组件',
            },
          ],
        },
        {
          text: '原理篇',
          collapsed: true,
          items: [
            {
              text: '响应式',
              collapsed: true,
              items: [
                {
                  text: '基本实现',
                  link: '/vue/t3u5nbjp/',
                },
                {
                  text: '完善响应式能力',
                  link: '/vue/5tudkjpx/',
                },
                {
                  text: '处理数组',
                  link: '/vue/zsn174ya/',
                },
                {
                  text: '实现只读代理',
                  link: '/vue/3d7jpgao/',
                },
                {
                  text: '实现浅层代理',
                  link: '/vue/h8xyw8s4/',
                },
                {
                  text: '完善副作用机制',
                  link: '/vue/qje1vr19/'
                },
                {
                  text: '实现调度执行',
                  link: '/vue/kaw881ya/'
                },
                {
                  text: '实现 computed',
                  link: '/vue/u2wbbrzr/'
                },
                {
                  text: '实现 Ref',
                  link: '/vue/rxnrhf5b/'
                },
                {
                  text: '实现 watch',
                  link: '/vue/b385jshj/'
                },
                {
                  text: '响应式系统的源码重构',
                  link: '/vue/vhyfe2xb/'
                }
              ],
            },
            {
              text: '渲染器',
              collapsed: true,
            },
            {
              text: '编译器',
              collapsed: true,
            }
          ],
        },
      ],
    },
    {
      text: 'Nuxt',
      icon: 'vscode-icons:file-type-nuxt',
      collapsed: true,
      items: [
        {
          text: '基础篇',
          items: [
            {
              text: '安装与基本配置',
              link: '/vue/u9k2p8rq/',
            },
            {
              text: '路由',
              link: '/vue/tbrb96uh/',
            },
            {
              text: '布局',
              link: '/vue/7x1ps9mt/',
            },
            {
              text: '中间件',
              link: '/vue/ztgntih1/',
            },
            {
              text: '插件',
              link: '/vue/us14yoln/',
            },
            {
              text: '生命周期',
              link: '/vue/tn3accgh/',
            },
            {
              text: '数据获取',
              link: '/vue/9fd9p11m/',
            },
            {
              text: '状态共享',
              link: '/vue/hhyle1g7/',
            },
          ],
        },
        {
          text: '原理篇',
          items: [
            {
              text: '现代前端渲染模式',
              link: '/vue/ixcnwpgu/',
            },
            {
              text: '手写 Nuxt 核心原理',
              link: '/vue/ts199xd9/',
            },
            {
              text: 'shared 与 layers 进阶',
              link: '/vue/rxe54a2m/',
            },
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
