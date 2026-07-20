---
title: Function Calling
createTime: 2026/06/29 16:40:00
permalink: /AI/llm/98b8d529/
---


在它之前，想 **让模型用外部工具** 只能靠 **提示词** —— 在 prompt 里用大段文字描述 "你有这些工具，要用就回我固定格式"，然后写正则去过滤模型那段回复。这种方式有三个毛病

- 繁琐：一大段提示词只为约束输出格式
- 不标准：每个人写法都不一样,换个模型、换个人就崩
- 约束力差：模型底层是概率生成，语气再重它也有概率不照格式来

因此在 2023 年 6 月 OpenAI 推出 Function Calling，本质是用 **JSON Schema** 把这件事标准化了。

> [!IMPORTANT]
> Function Calling 从不真正执行任何函数。模型自始至终待在 "沙箱" 里，它只会输出一段结构化的 JSON 告诉你 "我想调用的函数是什么，参数是什么"。真正去调函数、拿结果的，永远是后端代码

:::tip

模型之所以能按照工具协议生成结构化参数，是因为厂商专门训练了这项能力，所以并非所有模型都支持 Function Calling，可以在 [Hugging Face](https://huggingface.co/models?other=function+calling) 上进行查询。

需要注意：普通模式下生成结果仍可能不符合 schema；只有模型和接口支持并启用 `strict` 模式时，才能保证参数严格遵循受支持的 schema。
:::

## 两段式调用流程

Function Calling 可以看成模型与后端之间的一套协作协议：**模型负责做决策，后端负责执行，模型再根据执行结果作答**。之所以要拆成两段，是因为模型只能生成调用意图，无法直接访问数据库、网络或本地函数。

| 阶段 | 发送给模型的内容 | 得到的结果 | 谁负责下一步 |
| --- | --- | --- | --- |
| 工具决策 | 对话历史 + `tools` | 普通文本，或包含工具名与参数的 `tool_calls` | 模型决定是否调用工具；后端解析并执行 |
| 结果组织 | 原对话 + 模型的 `tool_calls` + 工具执行结果 | 面向用户的最终回答，或下一轮 `tool_calls` | 模型根据真实结果继续推理 |

```txt
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

:::details 闭环流程

1. 第一次请求通过 `tools` 告诉模型 "有哪些工具可用，以及每个工具接收什么参数"。
2. 模型返回 `tool_calls`，只代表它提出了调用请求，并不代表工具已经执行。
3. 后端根据工具名找到真实函数，解析并校验参数，然后执行函数。
4. 后端把执行结果作为 `role: "tool"` 的消息追加到对话历史，并用 `tool_call_id` 指明它回应的是哪一次调用。
5. 再次请求模型，让模型看到真实结果并组织最终回答。

:::

> [!IMPORTANT]
> 如果需要模型基于工具结果继续推理或组织自然语言答案，那么第二次请求不能省略，原因是：工具只在后端执行却不回灌结果，模型就不知道执行结果是什么。
>
> 若业务只需要读取 `tool_calls` 中的结构化参数，或执行工具后不需要模型继续回答，则可以在第一次请求后结束。

流程中的 `tools` 并不是函数实现，而是 ==一份提供给模型阅读的接口契约==。它通过 [JSON Schema](#json-schema) 描述工具用途、参数结构和必填项，直接影响第一段中模型会不会选择某个工具，以及生成什么参数。

## JSON Schema

[+description]: `description` 不是写给开发者看的普通注释，而是模型理解工具语义的主要依据。写得含糊，模型就可能漏调工具、选错工具或填错参数。因此，工具描述应当说明 "什么时候使用"，参数描述则应说明 "字段代表什么、允许什么格式"。

第一段请求会把 `tools` 连同用户消息一起交给模型。这里的 JSON Schema 同时承担两类职责：

- 工具级的 `name` 和 `description` 帮助模型选择 "调用哪个工具"。
- 参数级的 `properties`、`required` 和各字段 `description`[+description] 则约束 "调用时生成哪些参数"。

> [!WARNING]
> JSON Schema 约束的是模型输出的结构，不等于后端已经获得可信输入。真正执行工具之前，仍然要在后端校验参数、检查权限并处理调用异常。

```js
const tools = [{
  type: "function",
  function: {
    name: "getWeather",
    // 说清什么时候该调
    description: "获取指定城市某天的天气,当用户询问天气、气温、是否下雨时调用",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "城市名称,如 北京、上海" },
        // 用约束帮模型规整输出
        date: {
          type: "string",
          enum: ["今天", "明天", "后天"],
          description: "查询日期",
        },
      },
      required: ["city", "date"],
    },
  },
}];
```

各家模型的工具描述格式并不一致，换模型时要改

:::table full-width

| 模型 | 工具描述结构 | 输入参数字段名 |
| --- | --- | --- |
| DeepSeek / GPT(chat) | `{ type:"function", function:{ name, description, parameters } }` | `parameters` |
| GPT(responses 新接口) | 把 `name/description/parameters` 直接平铺,带 `strict:true` | `parameters` |
| Claude | `{ name, description, input_schema }`(没有 `function` 包裹) | `input_schema` |

:::

## 案例

::::details 下面所有实战项目都复用如下同一个请求函数

:::code-tabs

@tab llm.mjs

```js
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
      model: "deepseek-v4-pro",
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

:::

::::

### 单工具计算器

最基本的，用本地纯函数的方式，不依赖任何第三方 API，实现一个 Function Calling 的闭环

:::code-tabs

@tab main.mjs

```js
import { chat } from "./llm.mjs";
import { tools, calculate } from "./tools.mjs";

async function ask(question) {
  const messages = [{ role: "user", content: question }];

  // 第 1 次：模型决策
  let msg = await chat(messages, tools);

  // 模型觉得用不上工具,直接答  //[!code highlight]
  if (!msg.tool_calls) return msg.content;  //[!code highlight]

  // 必须把模型的决定原样放回历史  //[!code highlight]
  messages.push(msg); //[!code highlight]

  // 执行模型点名的每个工具
  for (const call of msg.tool_calls) {
    // arguments 是字符串,要 parse  //[!code highlight]
    const args = JSON.parse(call.function.arguments);  //[!code highlight]

    messages.push({
      role: "tool",
      tool_call_id: call.id,  // 必须对应 assistant 的 call.id //[!code highlight]
      content: calculate(args),
    });
  }

  // 第 2 次：把结果回灌,模型组织人话
  msg = await chat(messages, tools);
  return msg.content;
}

console.log(await ask("帮我算一下 (128 + 72) * 3 等于多少"));
```

@tab tools.mjs

```js
export const tools = [{
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

// 真正干活的本地函数(模型永远碰不到它，只能请求调它)
export function calculate({ expression }) {
  if (!/^[\d+\-*/().\s]+$/.test(expression)) return "表达式含非法字符";

  try {
    return String(Function(`"use strict"; return (${expression})`)());
  } catch {
    return "无法计算该表达式";
  }
}
```

:::

### 多工具自动循环

真实场景里，一个问题可能要连着调好几次工具。例如：现在几点？再算下 90 分钟后是几点 —— 得先调 "查时间" 拿到当前时间，再调 "计算"。

因此单次两段式不够，需要用带最大轮次限制的 `for` 循环：只要模型还在请求工具，就继续执行并回灌结果，直到它给出纯文本答案或达到最大轮次。

> [!IMPORTANT]
> 这个循环就是所谓 agent loop 的内核

:::code-tabs

@tab main.mjs

```js
import { tools, impls } from "./tools.mjs";
import { chat } from "./llm.mjs";

async function runAgent(question, maxToolRounds = 5) {
  const messages = [{ role: "user", content: question }];

  // 最多执行 maxToolRounds 轮工具,并额外留一次请求消费最后一轮结果
  for (let round = 0; round <= maxToolRounds; round++) {
    const msg = await chat(messages, tools);
    messages.push(msg);

    // 没有工具请求了 = 拿到最终答案  // [!code highlight]
    if (!msg.tool_calls?.length) return msg.content;  // [!code highlight]

    // 已用完工具轮次:不再执行新的工具,避免产生结果却没有机会回灌
    if (round === maxToolRounds) return "达到最大工具轮次仍未得出最终答案";

    // 一次 tool_calls 里可能有多个工具,全部执行
    for (const call of msg.tool_calls) {
      const fn = impls[call.function.name];
      const args = JSON.parse(call.function.arguments || "{}");
      const result = fn ? String(await fn(args)) : `未知工具 ${call.function.name}`;

      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
}

```

@tab tools.mjs

```js
export const tools = [
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

export const impls = {
  calculate({ expression }) {
    if (!/^[\d+\-*/().\s]+$/.test(expression)) return "表达式含非法字符";
    try { return String(Function(`"use strict"; return (${expression})`)()); }
    catch { return "无法计算"; }
  },
  getCurrentTime() {
    return new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  },
};
```

:::

:::collapse

- 对比上一个案例，关键差异有两点：

   1. 用 `impls` 表按名字分发，支持任意多个工具；用带 `maxToolRounds` 上限的 `for` 循环替代固定两次请求，支持多轮工具调用。
   2. 循环内部再通过 `for...of` 执行当前轮次返回的全部 `tool_calls`。

:::

Claude Code、Cursor 这类工具背后，本质上也是这个循环加上一组更复杂的工具。

### 借 schema 输出结构化数据

[+strict模式]: DeepSeek 的 `strict` 模式目前使用 Beta 接口。所有函数都要设置 `strict: true`；每个对象的属性都必须列入 `required`，并设置 `additionalProperties: false`。严格模式只保证结构符合 schema，不保证提取内容在语义上一定正确。

通过借用一个本不打算执行的函数的 schema，可以让模型输出结构化参数。这个方法在信息抽取和表单解析中非常有用，比只用提示词要求模型返回 JSON 更可靠。

下面的示例同时启用 DeepSeek 的 `strict` 模式[+strict模式]，让工具参数严格遵循其支持的 JSON Schema；再配合 `tool_choice`，强制模型调用指定工具。

:::code-tabs

@tab main.mjs

```js
import { tools } from "./tools.mjs";

async function extract(text) {
  const res = await fetch("https://api.deepseek.com/beta/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-pro",
      messages: [
        { role: "system", content: "从用户文本中提取联系人信息并调用 save_contact；缺失字段返回空字符串" },
        { role: "user", content: text },
      ],
      tools,
      // 强制必调
      tool_choice: { type: "function", function: { name: "save_contact" } },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const msg = (await res.json()).choices[0].message;

  // 直接拿到结构化对象
  return JSON.parse(msg.tool_calls[0].function.arguments);
}
```

@tab tools.mjs

```js
export const tools = [{
  type: "function",
  function: {
    name: "save_contact",
    strict: true,
    description: "保存从文本中提取出的联系人信息",
    parameters: {
      type: "object",
      properties: {
        name:    { type: "string", description: "姓名" },
        phone:   { type: "string", description: "电话号码" },
        company: { type: "string", description: "公司名称" },
        title:   { type: "string", description: "职位" },
      },
      required: ["name", "phone", "company", "title"],
      additionalProperties: false,
    },
  },
}];
```

:::

这里出现了 `tool_choice`,顺带补全它的取值

:::table full-width

| `tool_choice` | 含义 |
| --- | --- |
| `"auto"`(默认) | 模型自己决定调不调、调哪个 |
| `"none"` | 禁止调工具,只生成文本 |
| `"required"` | 必须调某个工具(但具体哪个由模型选) |
| `{ type:"function", function:{ name } }` | 强制调指定的这一个 |

:::
