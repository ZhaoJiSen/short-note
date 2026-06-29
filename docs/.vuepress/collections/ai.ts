import { defineCollection } from 'vuepress-theme-plume';

export const aiCollection = defineCollection({
  type: 'doc',
  dir: 'AI',
  title: 'AI',
  sidebar: [
    // {
    //   text: 'LLM 基础',
    //   collapsed: false,
    //   items: [
    //     {
    //       text: '大模型基础',
    //       link: '/AI/llm/589616cb/',
    //     },
    //     {
    //       text: 'LangChain 安装、模型接入与快速上手',
    //       link: '/AI/llm/ce5af0ad/',
    //     },
    //     {
    //       text: '聊天模型、工具调用与结构化输出',
    //       link: '/AI/llm/c321bf11/',
    //     },
    //     {
    //       text: '消息机制、提示词与少样本实践',
    //       link: '/AI/llm/9bda02d4/',
    //     },
    //     {
    //       text: 'RAG、文本分割与向量存储',
    //       link: '/AI/llm/3e19785e/',
    //     },
    //   ],
    // },
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
      collapsed: true,
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
      text: '模型应用基础',
      collapsed: true,
      items: [
        {
          text: '本地部署大模型',
          link: '/AI/llm/d312ad0a/',
        },
        {
          text: 'Agent',
          link: '/AI/llm/3b8ac0de/',
        },
        {
          text: '流式返回信息',
          link: '/AI/llm/81d03569/',
        },
        {
          text: '支持上下文',
          link: '/AI/llm/dc62377e/',
        },
        {
          text: '获取实时信息 part1',
          link: '/AI/llm/0f8d1c20/',
        },
        {
          text: '获取实时信息 part2',
          link: '/AI/llm/7dc3d2d9/',
        },
        {
          text: '获取实时信息 part3',
          link: '/AI/llm/fe5bcae7/',
        },
        {
          text: '接入 DeepSeek',
          link: '/AI/llm/26fe28dd/',
        },
      ],
    },
    {
      text: 'Function Calling',
      collapsed: true,
      items: [
        {
          text: '理论知识',
          link: '/AI/llm/98b8d529/',
        },
        {
          text: '实践',
          link: '/AI/llm/cbc39c5f/',
        },
      ],
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
        {
          text: '实战',
          collapsed: true,
          items: [
            {
              text: '天气应用实战',
              link: '/AI/llm/258bb29a/',
            },
          ],
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
          text: '实践 part1',
          link: '/AI/llm/56ca9f21/',
        },
        {
          text: '实践 part2',
          link: '/AI/llm/f7a5ffb3/',
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
      text: '提示词工程',
      collapsed: true,
      items: [
        {
          text: 'RCT 构词法',
          link: '/AI/llm/14a2b523/',
        },
        {
          text: '提示词常见技巧',
          link: '/AI/llm/5ea67fde/',
        },
        {
          text: '基于反馈迭代优化',
          link: '/AI/llm/c2116f50/',
        },
        {
          text: '改善提示效果',
          link: '/AI/llm/f6b0ac6d/',
        },
        {
          text: '提示词评估',
          link: '/AI/llm/8ca87b50/',
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
