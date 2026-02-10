import { defineCollection } from 'vuepress-theme-plume';

export const goCollection = defineCollection({
  type: 'doc',
  dir: 'go',
  title: 'Go',
  sidebar: [
    {
      text: '基础知识',
      collapsed: false,
      items: [
        { text: '1. 变量与输出', link: '/go/ynf4e2np/' },
        { text: '2. 结构体', link: '/go/6p7o4z0m/' },
        { text: '3. 控制流', link: '/go/9uq5tj4v/' },
        { text: '4. 接口', link: '/go/f2t5lr4m/' },
        { text: '5. 函数', link: '/go/e7z9tq1k/' },
        { text: '6. 切片', link: '/go/lslice/' },
        { text: '7. 字符串', link: '/go/lstring/' },
        { text: '8. map', link: '/go/lmap/' },
        { text: '9. 错误处理', link: '/go/lerror/' },
      ],
    },
    {
      text: '并发与协程',
      collapsed: true,
      items: [
        { text: 'goroutine', link: '/go/goroutine/' },
        { text: 'channel', link: '/go/channel/' },
        { text: 'select', link: '/go/select/' },
        { text: 'context', link: '/go/context/' },
        { text: 'CSP', link: '/go/CSP/' },
        { text: '常见并发模式', link: '/go/常见并发模式/' },
        { text: '死锁', link: '/go/死锁/' },
      ],
    },
    {
      text: '运行时与内存',
      collapsed: true,
      items: [
        { text: 'GMP 调度模型', link: '/go/k5ln8c7v/' },
        { text: 'GC 原理', link: '/go/co78pxr0/' },
        { text: 'Go 内存模型', link: '/go/3o36mr6d/' },
      ],
    },
  ],
});
