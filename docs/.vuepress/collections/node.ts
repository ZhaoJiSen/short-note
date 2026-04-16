import { defineCollection } from 'vuepress-theme-plume';

export const nodeCollection = defineCollection({
  type: 'doc',
  dir: 'node',
  title: 'Node',
  sidebar: [
    {
      text: '基础篇',
      collapsed: true,
      items: [
        {
          text: '全局对象',
          link: '/node/8ndhljae/'
        },
        {
          text: 'Node 模块',
          collapsed: true,
          items: [
            {
              text: 'fs 模块',
              link: '/node/1jbhp0rf/',
            },
            {
              text: 'net 模块',
              link: '/node/76zcct25/'
            },
            {
              text: 'path 模块',
              link: '/node/m4tkcgr5/',
            },
            {
              text: 'http 模块',
              link: '/node/zyzfztfm/',
            },
            {
              text: '生命周期',
              link: '/node/2xt2aon8/'
            }
          ],
        },
      ]
    },
    {
      text: '补充篇',
      collapsed: true,
      items: [
        {
          text: 'Sequelize'
        },
        {
          text: 'Node 组成原理'
        },
        {
          text: 'CSRF 与 XSS 攻击与防御'
        }
      ]
    },
    {
      text: '框架篇',
      collapsed: true,
      items: [
        {
          text: 'Express',
          link: '/node/9libnz58/',
          icon: 'skill-icons:expressjs-light'
        },
        {
          text: 'Koa',
          link: '/node/1hdtad3y/',
          icon: 'simple-icons:koa'
        }
      ]
    }
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
