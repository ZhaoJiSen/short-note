import { defineCollection } from 'vuepress-theme-plume';

export const goCollection = defineCollection({
  type: 'doc',
  dir: 'go',
  title: 'Go',
  sidebar: [
    {
      text: '基础篇',
      collapsed: false,
      items: [
        { text: '变量与输出', link: '/go/ynf4e2np/' },
        { text: '常量与枚举', link: '/go/hmn4vmg9/' },
        { text: '指针', link: '/go/0urnwvtc/' },
        { text: '控制流', link: '/go/9uq5tj4v/' },
        { text: '数组、切片与集合', link: '/go/pthvr7w1/' },
        { text: '函数', link: '/go/e7z9tq1k/' },
        { text: '字符串', link: '/go/lstring/' },
        { text: '结构体', link: '/go/t6n3jx1f/' },
        { text: '方法', link: '/go/method/' },
        { text: '接口', link: '/go/f2t5lr4m/' },
        { text: '错误处理', link: '/go/error-handling/' },
        { text: 'defer', link: '/go/defer/' },
        { text: '泛型', link: '/go/generics/' },
      ],
    },
    {
      text: '并发与协程',
      collapsed: true,
      items: [
        { text: 'goroutine', link: '/go/v1eschlh/' },
        { text: 'channel', link: '/go/gfaf8k44/' },
        { text: 'select', link: '/go/select/' },
        { text: 'context', link: '/go/context/' },
        { text: 'sync 同步原语', link: '/go/sync/' },
        { text: 'atomic 原子操作', link: '/go/atomic/' },
        { text: 'CSP', link: '/go/s8ffdzs1/' },
        { text: '常见并发模式', link: '/go/7rxo7lce/' },
        { text: '死锁', link: '/go/od04ppqf/' },
      ],
    },
    {
      text: '运行时与内存',
      collapsed: true,
      items: [
        { text: 'GMP 调度模型', link: '/go/k5ln8c7v/' },
        { text: '逃逸分析', link: '/go/escape-analysis/' },
        { text: '内存分配', link: '/go/mem-alloc/' },
        { text: 'GC 原理', link: '/go/co78pxr0/' },
        { text: 'Go 内存模型', link: '/go/3o36mr6d/' },
      ],
    },
    {
      text: '标准库',
      collapsed: true,
      items: [
        { text: 'HTTP 编程', link: '/go/net-http/' },
        { text: 'JSON 处理', link: '/go/json/' },
        { text: 'IO 操作', link: '/go/io/' },
        { text: '时间与日期', link: '/go/time/' },
      ],
    },
    {
      text: '常用库',
      collapsed: true,
      items: [
        { text: 'Gin', link: '/go/gin/' },
        { text: 'GORM', link: '/go/gorm/' },
        { text: '日志库', link: '/go/logging/' },
        { text: '配置管理', link: '/go/config/' },
      ],
    },
    {
      text: '测试与工程化',
      collapsed: true,
      items: [
        { text: 'Go Module', link: '/go/go-module/' },
        { text: '单元测试', link: '/go/unit-test/' },
        { text: '基准测试', link: '/go/benchmark/' },
        { text: 'pprof 性能分析', link: '/go/pprof/' },
      ],
    },
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
