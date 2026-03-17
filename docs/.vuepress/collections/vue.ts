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
          text: '基础篇',
          collapsed: true,
          items: [
            {
              text: '模板语法与属性绑定',
              link: '/vue/iorgmo8s/',
            },
            {
              text: '响应式',
              link: '/vue/lnalkeew/',
            },
            {
              text: '计算属性与侦听器',
              link: '/vue/44zt1ybc/',
            },
            {
              text: '条件渲染与列表渲染',
              link: '/vue/slbeqpqt/',
            },
            {
              text: '组件',
              link: '/vue/27n0q1k1/',
            },
            {
              text: '事件处理',
              link: '/vue/tc38f00o/',
            },
          ],
        },
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
              ],
            },
            {
              text: 'Ref 实现原理',
            },
            {
              text: 'computed 实现原理',
            },
            {
              text: 'scheduler 原理',
            },
            {
              text: 'watch 原理',
            },
            {
              text: 'Diff',
            },
            {
              text: 'Pinia',
            },
            {
              text: 'Vue Router',
            },
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
