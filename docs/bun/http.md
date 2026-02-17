---
title: HTTP 服务器
createTime: 2026/02/14 10:26:00
permalink: /bun/bun/crud/sksujf84/
---

## 基础篇

### `Bun.serve` 快速理解

`Bun.serve` 是 Bun 原生 HTTP 服务器入口，支持直接返回 `Response`，写法接近 Fetch API。

:::table title="Bun.serve 常用字段" full-width
| 字段 | 作用 | 典型值 |
| --- | --- | --- |
| `port` | 监听端口 | `3000` |
| `hostname` | 监听地址 | `0.0.0.0` / `127.0.0.1` |
| `fetch(req)` | 请求处理函数 | 返回 `Response` |
| `error(err)` | 全局错误处理 | 统一 500 响应 |
:::

### 路由与响应模式

- 小项目可手写 `switch + pathname` 路由。
- 标准响应建议统一 `JSON` 结构，降低前端处理复杂度。
- 对 `POST/PUT` 请求要严格处理 `await req.json()` 异常。

## 进阶篇

::: card title="接口设计建议" icon="material-icon-theme:api"
先定义响应结构（`{ code, message, data }`），再写业务逻辑，能减少接口风格漂移。
:::

:::details 生产环境补充
- 增加请求日志和 trace id
- 增加超时、限流、鉴权
- 在反向代理层（Nginx/网关）统一 TLS 与跨域策略
:::

## 完整代码示例

```ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

function json<T>(data: ApiResponse<T>, init?: ResponseInit): Response {
  return Response.json(data, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init?.headers,
    },
    status: init?.status,
  });
}

const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);

    // 健康检查
    if (req.method === 'GET' && url.pathname === '/health') {
      return json({ code: 0, message: 'ok', data: { uptime: process.uptime() } });
    }

    // Echo 示例：读取 JSON 并回传
    if (req.method === 'POST' && url.pathname === '/echo') {
      try {
        const body = (await req.json()) as Record<string, unknown>;
        return json({ code: 0, message: 'success', data: body });
      } catch {
        return json(
          { code: 4001, message: '请求体不是合法 JSON', data: null },
          { status: 400 },
        );
      }
    }

    // 未匹配路由
    return json({ code: 4040, message: 'not found', data: null }, { status: 404 });
  },
  error: (error) => {
    console.error('server error:', error);
    return json({ code: 5000, message: 'internal error', data: null }, { status: 500 });
  },
});

console.log(`HTTP server running at http://localhost:${server.port}`);
```

## 代码演示

::: demo
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bun HTTP Demo</title>
    <style>
      body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 20px; }
      button { padding: 8px 12px; border: 0; border-radius: 8px; background: #111827; color: #fff; }
      pre { background: #f3f4f6; padding: 12px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <button id="btn">请求 /health</button>
    <pre id="out">点击按钮后查看返回结果</pre>

    <script>
      const btn = document.getElementById("btn");
      const out = document.getElementById("out");

      btn.addEventListener("click", async () => {
        // 这里假设你的 Bun 服务运行在 3000 端口
        const res = await fetch("http://localhost:3000/health");
        const data = await res.json();
        out.textContent = JSON.stringify(data, null, 2);
      });
    </script>
  </body>
</html>
```
:::

## 最佳实践

- 接口返回统一结构，前后端协作更稳定。
- 所有解析 JSON 的地方都做 `try/catch`。
- 给每个路由定义明确方法与路径，避免“万能入口”难维护。
- 在 `error` 钩子里记录异常栈，便于线上排查。

## 常见错误

- 直接 `await req.json()`，遇到非法 JSON 导致请求中断。
- 忘记处理 404，客户端收到默认文本而不是 JSON。
- 错误码和 HTTP 状态码混用，监控指标不可读。

