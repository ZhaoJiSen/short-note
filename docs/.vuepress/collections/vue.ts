import { defineCollection } from 'vuepress-theme-plume';

export const vueCollection = defineCollection({
  type: 'doc',
  dir: 'vue',
  title: 'Vue',
  sidebar: [
    {
      text: '基本使用',
      collapsed: false,
      items: [
        {
          text: '基本语法',
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
          text: '路由',
          link: '/vue/pc7wxaew/',
        },
        {
          text: '状态管理',
          link: '状态管理',
        },
      ],
    },
    {
      text: '深入',
      collapsed: false,
      items: [
        {
          text: '虚拟 DOM',
          link: '/vue/g1p46p1k/',
        },
        {
          text: '模板',
          link: '/vue/sdx81vif/',
        },
        {
          text: '响应式',
        },
        {
          text: '计算属性',
        },
      ],
    },
    {
      text: '补充内容',
      collapsed: false,
      items: [
        {
          text: '属性穿透',
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
      text: 'Nuxt',
      collapsed: false,
      items: [
        {
          text: '基础篇',
          items: [
            {
              text: '安装与基本配置',
              link: '/vue/u9k2p8rq/',
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
