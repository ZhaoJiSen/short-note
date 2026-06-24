import { defineCollection } from 'vuepress-theme-plume';

export const aiCollection = defineCollection({
  type: 'doc',
  dir: 'AI',
  title: 'AI',
  sidebar: [
    {
      text: 'LLM 基础',
      collapsed: false,
      items: [
        {
          text: '大模型基础',
          link: '/AI/llm/589616cb/',
        },
        {
          text: 'LangChain 安装、模型接入与快速上手',
          link: '/AI/llm/ce5af0ad/',
        },
        {
          text: '聊天模型、工具调用与结构化输出',
          link: '/AI/llm/c321bf11/',
        },
        {
          text: '消息机制、提示词与少样本实践',
          link: '/AI/llm/9bda02d4/',
        },
        {
          text: 'RAG、文本分割与向量存储',
          link: '/AI/llm/3e19785e/',
        },
      ],
    },
    {
      text: 'LangChain',
      collapsed: false,
      items: [
        {
          text: '基本概念',
          link: '/AI/langchain/c193ae62/',
        },
        {
          text: '解析器',
          link: '/AI/langchain/f3eb9778/',
        },
        {
          text: 'Loader',
          link: '/AI/langchain/a84008c1/',
        },
        {
          text: 'LangChain.js 使用',
          link: '/AI/langchain/7618e341/',
        },
      ],
    },
    {
      text: 'AI 工程',
      collapsed: true,
      items: [
        {
          text: 'Harness Engineering',
          link: '/AI/engineering/e22b513a/',
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
