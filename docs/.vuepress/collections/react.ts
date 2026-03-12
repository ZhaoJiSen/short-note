import { defineCollection } from 'vuepress-theme-plume';

export const reactCollection = defineCollection({
  type: 'doc',
  dir: 'react',
  title: 'React',
  sidebar: [
    {
      text: 'React',
      collapsed: false,
      icon: 'material-icon-theme:react',
      items: [
        {
          text: '基础篇',
          collapsed: true,
          items: [
            {
              text: 'JSX',
              link: '/react/xp46o97u/',
            },
            {
              text: '组件与事件绑定',
              link: '/react/jc2ywe9e/'
            },
            {
              text: '组件状态与表单',
              link: '/react/4w5duqw6/',
            },
            {
              text: '路由',
              link: '/react/tu6msbq8/',
            },
            {
              text: '状态管理',
              link: '/react/c5ssndd7/',
            },
          ],
        },
        {
          text: 'Hooks',
          collapsed: true,
          items: [
            {
              text: '2-20. useState和useReducer',
              link: '/react/3y18fcfc/',
            },
            {
              text: '2-21. effect相关hook',
              link: '/react/rgo45lka/',
            },
            {
              text: '2-22. useCallback和useMemo',
              link: '/react/uju66mss/',
            },
            {
              text: '2-23. useRef',
              link: '/react/t5qj4s1y/',
            },
          ],
        },
        {
          text: '补充篇',
          collapsed: true,
          items: [
            {
              text: '组件复用与DOM能力',
              link: '/react/ko6pub74/',
            },
            {
              text: '错误边界与性能优化',
              link: '/react/g2rvl1ra/',
            },
          ],
        },
        {
          text: '原理篇',
          collapsed: true,
          items: [
            {
              text: '设计哲学、虚拟DOM与Fiber',
              link: '/react/vke0nqak/',
            },
            {
              text: '调度、render与commit',
              link: '/react/j0fdas4o/',
            },
            {
              text: 'Update、Bailout与Context优化',
              link: '/react/q3pmhq9v/',
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
