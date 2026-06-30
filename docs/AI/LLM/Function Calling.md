---
title: Function Calling
createTime: 2026/06/29 16:40:00
permalink: /AI/llm/98b8d529/
---

## 为什么需要 Function Calling

在它之前,想让模型用外部工具只能靠 **提示词** 硬塞 —— 在 prompt 里用大段文字描述 "你有这些工具,要用就回我固定格式",然后自己写正则去抠模型那段回复。这种方式有三个毛病

- 繁琐:一大段提示词只为约束输出格式
- 不标准:每个人写法都不一样,换个模型、换个人就崩
- 约束力差:模型底层是概率生成,语气再重它也有概率不照格式来

2023 年 6 月 OpenAI 推出 Function Calling,本质是用 **JSON Schema** 把这件事标准化了

这里要先建立一个最关键的心智模型

> [!IMPORTANT]
> Function Calling 从不真正执行任何函数。模型自始至终待在 "沙箱" 里,它只会输出一段结构化的 JSON 告诉你 "我想调 `getWeather`,参数是 `{city:"北京"}`"。真正去调函数、拿结果的,永远是你的后端代码

把这句话记牢,后面所有流程和陷阱都是它的推论。至于 "为什么模型这次就能稳定吐合法 JSON" —— 不是魔法,是厂商专门 **微调** 出来的能力,所以并非所有模型都支持 Function Calling,可以在 [Hugging Face](https://huggingface.co/models?other=function+calling) 上查某个模型支不支持

## 调用流程:两段式

很多人第一次会卡在这里:为什么调一次工具要请求模型两遍?因为这两次请求干的是完全不同的两件事

```
用户提问
   │
   ▼
第 1 次请求模型(带 tools)   ← 模型决策:要不要用工具、用哪个、参数是啥
   │
   ├─ 模型不需要工具 ──► 直接返回文本答案,结束
   │
   └─ 模型返回 tool_calls
          │
          ▼
   你的代码执行这些工具,拿到结果
          │
          ▼
第 2 次请求模型(把工具结果回灌) ← 模型组织语言:基于结果生成给用户看的回答
          │
          ▼
       最终文本答案
```

第二次请求不可省 —— 模型得亲眼看到工具返回的 `72°F` 这种原始结果,才能组织出 "北京今天 72 华氏度,挺暖和" 这样的人话

下面所有实战项目都复用同一个请求函数(Node 18+ 原生 `fetch`,DeepSeek 走的是 OpenAI 兼容格式)。新建 `llm.mjs`

```js
// llm.mjs —— 复用的请求封装
const API = "https://api.deepseek.com/chat/completions";
const KEY = process.env.DEEPSEEK_API_KEY;

export async function chat(messages, tools) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      tools,           // 不传就是普通对话
      // tool_choice 默认 "auto",由模型自己决定要不要调
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message;   // { role, content, tool_calls? }
}
```

## 工具描述:JSON Schema 是给模型的说明书

`tools` 数组里每个工具的 `description`、以及每个参数的 `description`,不是写给你自己看的注释,而是模型唯一的判断依据。模型靠它决定 "这个问题该不该用这个工具、参数怎么填"。写得含糊,模型就会漏调或乱填 —— 这是实战里最容易被忽视的点

```js
const tools = [{
  type: "function",
  function: {
    name: "getWeather",
    description: "获取指定城市某天的天气,当用户询问天气、气温、是否下雨时调用",  // 说清"什么时候该调"
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "城市名称,如 北京、上海" },
        date: { type: "string", description: "日期,只能是 今天、明天、后天" },  // 用约束帮模型规整输出
      },
      required: ["city", "date"],
    },
  },
}];
```

各家模型的工具描述格式并不一致,换模型时要改

:::table full-width
| 模型 | 工具描述结构 | 输入参数字段名 |
| --- | --- | --- |
| DeepSeek / GPT(chat) | `{ type:"function", function:{ name, description, parameters } }` | `parameters` |
| GPT(responses 新接口) | 把 `name/description/parameters` 直接平铺,带 `strict:true` | `parameters` |
| Claude | `{ name, description, input_schema }`(没有 `function` 包裹) | `input_schema` |
:::

这就是为什么实战里会把工具描述单独抽成一个文件 —— 换模型时只改这一处

## 实战一:单工具计算器

先用一个纯本地函数把两段式循环跑通,不依赖任何第三方 API,`node` 直接能跑。让模型把自然语言里的算式交给本地 `calculate` 算

```js
// 01-calculator.mjs
import { chat } from "./llm.mjs";

const tools = [{
  type: "function",
  function: {
    name: "calculate",
    description: "计算一个数学表达式的结果,支持 + - * / 和括号",
    parameters: {
      type: "object",
      properties: {
        expression: { type: "string", description: "数学表达式,如 (3 + 5) * 2" },
      },
      required: ["expression"],
    },
  },
}];

// 真正干活的本地函数(模型永远碰不到它,只能请求调它)
function calculate({ expression }) {
  if (!/^[\d+\-*/().\s]+$/.test(expression)) return "表达式含非法字符";  // demo 级安全校验
  try {
    return String(Function(`"use strict"; return (${expression})`)());
  } catch {
    return "无法计算该表达式";
  }
}

async function ask(question) {
  const messages = [{ role: "user", content: question }];

  // 第 1 次:模型决策
  let msg = await chat(messages, tools);
  if (!msg.tool_calls) return msg.content;       // 模型觉得用不上工具,直接答

  messages.push(msg);                            // ★ 必须把模型的决定原样放回历史

  // 执行模型点名的每个工具
  for (const call of msg.tool_calls) {
    const args = JSON.parse(call.function.arguments);   // ★ arguments 是字符串,要 parse
    messages.push({
      role: "tool",
      tool_call_id: call.id,                     // ★ 必须对应上面那条 assistant 的 call.id
      content: calculate(args),
    });
  }

  // 第 2 次:把结果回灌,模型组织人话
  msg = await chat(messages, tools);
  return msg.content;
}

console.log(await ask("帮我算一下 (128 + 72) * 3 等于多少"));
// 模型会调 calculate({expression:"(128 + 72) * 3"}),拿到 600,再回 "结果是 600"
```

三个 `★` 就是后面 "常见陷阱" 里最容易栽的三处,先在最简单的场景里看清它们长什么样

## 实战二:多工具自动循环(Agent 雏形)

真实场景里,一个问题可能要连着调好几次工具(比如 "现在几点?再算下 90 分钟后是几点" —— 得先调 "查时间" 拿到当前时间,再调 "计算")。单次两段式不够,要包一个 while 循环:只要模型还在要工具,就继续喂,直到它给出纯文本答案。这个循环就是所谓 agent loop 的内核

```js
// 02-agent.mjs
import { chat } from "./llm.mjs";

// 工具实现表:名字 → 真正的函数
const impls = {
  calculate({ expression }) {
    if (!/^[\d+\-*/().\s]+$/.test(expression)) return "表达式含非法字符";
    try { return String(Function(`"use strict"; return (${expression})`)()); }
    catch { return "无法计算"; }
  },
  getCurrentTime() {
    return new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  },
};

const tools = [
  {
    type: "function",
    function: {
      name: "getCurrentTime",
      description: "获取当前的日期和时间,当用户问现在几点、今天几号时调用",
      parameters: { type: "object", properties: {} },   // 无参数也要给空 object
    },
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description: "计算数学表达式",
      parameters: {
        type: "object",
        properties: { expression: { type: "string", description: "数学表达式" } },
        required: ["expression"],
      },
    },
  },
];

async function runAgent(question, maxRounds = 5) {
  const messages = [{ role: "user", content: question }];

  for (let round = 0; round < maxRounds; round++) {   // maxRounds 防止模型反复调工具死循环
    const msg = await chat(messages, tools);
    messages.push(msg);

    if (!msg.tool_calls) return msg.content;          // 没有工具请求了 = 拿到最终答案

    // 一次 tool_calls 里可能有多个工具,全部执行
    for (const call of msg.tool_calls) {
      const fn = impls[call.function.name];
      const args = JSON.parse(call.function.arguments || "{}");
      const result = fn ? String(await fn(args)) : `未知工具 ${call.function.name}`;  // ★ 兜底
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
  return "达到最大轮次仍未得出最终答案";
}

console.log(await runAgent("现在几点?再帮我算一下,如果再过 135 分钟是几点(给出几小时几分钟即可)"));
```

对比实战一,关键差异就两点:用 `impls` 表按名字分发(支持任意多工具)、用 while 循环替代固定两次(支持多轮)。Claude Code、Cursor 这些工具背后,本质就是这个循环加上一堆更复杂的工具

## 实战三:借 schema 逼出结构化数据

Function Calling 有个反直觉但超实用的用法:你根本不打算执行那个函数,只是借它的 schema 逼模型吐出严格结构的 JSON。做信息抽取、表单解析特别好用 —— 比让模型 "请返回 JSON" 然后自己 parse 字符串可靠得多。配合 `tool_choice` 强制模型必须调这个工具

```js
// 03-extract.mjs
const tools = [{
  type: "function",
  function: {
    name: "save_contact",
    description: "保存从文本中提取出的联系人信息",
    parameters: {
      type: "object",
      properties: {
        name:    { type: "string", description: "姓名" },
        phone:   { type: "string", description: "电话号码" },
        company: { type: "string", description: "公司名称" },
        title:   { type: "string", description: "职位" },
      },
      required: ["name"],
    },
  },
}];

async function extract(text) {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "从用户文本中提取联系人信息,并调用 save_contact" },
        { role: "user", content: text },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "save_contact" } },  // 强制必调
    }),
  });
  const msg = (await res.json()).choices[0].message;
  return JSON.parse(msg.tool_calls[0].function.arguments);   // 直接拿到结构化对象
}

console.log(await extract("你好,我是阿里巴巴的技术总监张伟,手机 13800138000,有空聊聊合作"));
// => { name: "张伟", phone: "13800138000", company: "阿里巴巴", title: "技术总监" }
```

这里出现了 `tool_choice`,顺带补全它的取值

:::table full-width
| `tool_choice` | 含义 |
| --- | --- |
| `"auto"`(默认) | 模型自己决定调不调、调哪个 |
| `"none"` | 禁止调工具,只生成文本 |
| `"required"` | 必须调某个工具(但具体哪个由模型选) |
| `{ type:"function", function:{ name } }` | 强制调指定的这一个 |
:::

## 常见陷阱

:::table full-width
| 陷阱 | 说明 / 正确做法 |
| --- | --- |
| `arguments` 是字符串不是对象 | 模型返回的 `function.arguments` 是 JSON 字符串,必须 `JSON.parse` 后才能用 |
| 漏把 assistant 的 `tool_calls` 消息放回历史 | `role:"tool"` 的结果消息必须紧跟在包含对应 `tool_call_id` 的 assistant 消息之后,少了那条 assistant 消息,tool 消息就成了 "孤儿",接口直接报错 |
| `tool_call_id` 没对上 | 每条 tool 结果的 `tool_call_id` 要等于它回应的那个 `call.id`,多工具时尤其别串了 |
| 流式下 `arguments` 是分片的 | 开 `stream:true` 时,参数字符串是一个 token 一个 token 吐的,要按 `tool_calls[].index` 把碎片累加拼接成完整 JSON 再 parse |
| 一次可能有多个 `tool_calls` | `tool_calls` 是数组,模型可能一次点名多个工具,要全部执行完、把所有结果都回灌,再请求第二次 |
| 模型 "幻觉" 出不存在的工具 / 乱填参数 | 一定要有 `impls[name]` 兜底分支加 `try/catch`,别假设模型只会调你给的工具、只会填合法参数 |
| `description` 写太随意 | schema 的 description 是模型唯一的决策依据,写不清就漏调、乱调,要当成 "写给模型的接口文档" 认真写 |
| 以为换模型不用改 | DeepSeek/GPT 用 `function` 包裹加 `parameters`,Claude 是平铺加 `input_schema`,返回字段也有差异,换模型要改适配 |
:::

## 小结

- Function Calling 的内核是一句话:模型只输出 "想调什么" 的 JSON,执行永远在你的代码里
- 标准调用是两段式:第一次让模型决策并产出参数,执行工具后第二次把结果回灌让它组织人话
- 想支持 "一个问题连环调多个工具",把两段式套进 while 循环(配 `maxRounds` 防死循环),这就是 agent loop 的雏形
- `tool_choice` 能强制或禁止调工具,配合 "只借 schema 不真执行" 可以把 Function Calling 当结构化输出工具用
- 工程上最容易踩的是:`arguments` 要 parse、assistant 的 tool_calls 消息和 tool 结果的 `tool_call_id` 要配对、流式下参数要按 index 拼接
