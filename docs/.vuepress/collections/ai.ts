import { defineCollection } from 'vuepress-theme-plume';

export const aiCollection = defineCollection({
  type: 'doc',
  dir: 'AI',
  title: 'AI',
  sidebar: [
    {
      text: '基础原理',
      collapsed: false,
      items: [
        {
          text: 'N-Gram 模型',
          link: '/AI/llm/34cc7a39/',
        },
        {
          text: '词袋模型',
          link: '/AI/llm/4a1a980a/',
        },
        {
          text: '词元 Token',
          link: '/AI/llm/e6291c2e/',
        },
        {
          text: '嵌入 Embedding',
          link: '/AI/llm/24ed4164/',
        },
      ],
    },
    {
      text: 'Transformer',
      collapsed: false,
      items: [
        {
          text: '内部结构与整体流程',
          link: '/AI/llm/fyzg14pj/',
        },
        {
          text: '解码策略',
          link: '/AI/llm/qcl2gnwp/',
        },
        {
          text: 'Transformer 块',
          link: '/AI/llm/fr740ep0/',
        },
      ],
    },
    {
      text: 'Function Calling',
      link: '/AI/llm/98b8d529/',
    },
    {
      text: 'MCP',
      collapsed: true,
      items: [
        {
          text: '传输与协议',
          collapsed: true,
          items: [
            {
              text: 'stdio',
              link: '/AI/llm/5ee85f85/',
            },
            {
              text: 'JSON-RPC 2.0',
              link: '/AI/llm/354ad75c/',
            },
            {
              text: 'SSE 基础知识',
              link: '/AI/llm/a71ffcad/',
            },
            {
              text: 'StreamableHTTP',
              link: '/AI/llm/d372f4f5/',
            },
          ],
        },
        {
          text: 'Server',
          collapsed: true,
          items: [
            {
              text: 'MCPServer',
              link: '/AI/llm/42cd7c79/',
            },
            {
              text: '官方 SDK',
              link: '/AI/llm/13321070/',
            },
            {
              text: 'Resources 基础知识',
              link: '/AI/llm/204fdce6/',
            },
            {
              text: 'Schema',
              link: '/AI/llm/d06d7767/',
            },
            {
              text: '注册资源模板',
              link: '/AI/llm/aa019996/',
            },
            {
              text: '监听资源更新',
              link: '/AI/llm/64746de8/',
            },
            {
              text: 'Prompts',
              link: '/AI/llm/a44188cb/',
            },
          ],
        },
        {
          text: 'Client',
          collapsed: true,
          items: [
            {
              text: 'MCPClient',
              link: '/AI/llm/60f49dc1/',
            },
          ],
        },
      ],
    },
    {
      text: 'Prompt Engineering',
      collapsed: true,
      items: [
        {
          text: 'RCT 构词法',
          link: '/AI/7ljx13hc/',
        },
        {
          text: '提示词常见技巧',
          link: '/AI/7p08vdbu/',
        },
        {
          text: '基于反馈迭代优化',
          link: '/AI/cjz3q4mj/',
        },
        {
          text: '改善提示效果',
          link: '/AI/y52x1wfq/',
        },
        {
          text: '提示词评估',
          link: '/AI/3lo54cqg/',
        },
      ],
    },
    {
      text: 'RAG',
      collapsed: true,
      items: [
        {
          text: '大模型幻觉',
          link: '/AI/llm/992b34f2/',
        },
        {
          text: '基础知识',
          link: '/AI/llm/a6e57fed/',
        },
        {
          text: '架构演进',
          link: '/AI/llm/0e2874fe/',
        },
      ],
    },
    {
      text: '微调',
      collapsed: true,
      items: [
        {
          text: '基础知识',
          link: '/AI/llm/97f5fc08/',
        },
        {
          text: 'LoRA 微调',
          link: '/AI/llm/106fa2ce/',
        },
      ],
    },
    {
      text: 'Harness Engineering',
      collapsed: true,
      link: '/AI/engineering/e22b513a/',
      items: [
        {
          text: 'AI 工程的演变',
          link: '/AI/engineering/e22b513a/#ai-工程的演变',
        },
        {
          text: 'Harness 架构',
          link: '/AI/engineering/e22b513a/#harness-架构',
        },
        {
          text: 'Anthropic 的实践',
          link: '/AI/engineering/e22b513a/#anthropic-的实践',
        },
        {
          text: 'OpenAI 的工程哲学',
          link: '/AI/engineering/e22b513a/#openai-的工程哲学',
        },
        {
          text: '在后台管理系统中落地 Harness',
          link: '/AI/engineering/e22b513a/#在后台管理系统中落地-harness',
        },
      ],
    },
    {
      text: 'LangChain',
      collapsed: true,
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
  ],
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
});
