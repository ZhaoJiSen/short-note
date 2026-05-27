import { defineCollection } from 'vuepress-theme-plume';

export const pythonCollection = defineCollection({
  type: 'doc',
  dir: 'python',
  title: 'Python',
  sidebar: [
    {
      text: '基础篇',
      collapsed: true,
      items: [
        {
          text: '基本语法',
          link: '/python/1v6j4ncj/',
        },
        {
          text: '容器类型',
          link: '/python/umipekr0/',
        },
        {
          text: '函数',
          link: '/python/39435zio/',
        },
        {
          text: '作用域',
          link: '/python/gjlq586o/',
        },
        {
          text: 'lambda 表达式',
          link: '/python/p3mcztho/',
        },
        {
          text: '面向对象',
          collapsed: false,
          items: [
            {
              text: '类和对象',
              link: '/python/7swzaarn/',
            },
            {
              text: '对象的类型',
              link: '/python/781req5t/'
            },
            {
              text: '对象的创建过程',
              link: '/python/mfk6ndra/'
            }
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
