---
title: SSE
createTime: 2026/02/25 23:45:53
permalink: /blog/kscbtlde/
tags:
  - 应用开发
---

SSE 简单理解为一个单项的 WebSocket，它是一种服务器向客户端发送事件的协议。基于 HTTP/HTTPS 协议，占用服务资源远小于 WebSocket

定义一个 SSE 服务与定义一个接口类似

```ts
import { Elysia, redirect, sse } from 'elysia';

const app = new Elysia()
  .get('/api/sse', async function* ({ set }) {
    set.headers['Cache-Control'] = 'no-cache';
    set.headers['Content-Type'] = 'text/event-stream;charset=utf-8';

    let counter = 0;

    while (true) {
      if (counter === 10) break;

      yield sse({
        event: 'tick',
        data: new Date().toISOString(),
      });

      await new Promise((r) => setTimeout(r, 1000));
      counter++;
    }
  })
  .listen(3000);

app.get('/', () => 'Hello!');
app.get('/api', ({ redirect }) => redirect('/'));

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
```

> [!IMPORTANT]
> `Content-Type` 必须为 `text/event-stream;charset=utf-8`
> 接口必须严格按照 `data: 内容\n\n` 格式返回，否则前端无法触发 onmessage
> 服务器一定不能主动断开，否则会导致前端无法重连，除非关闭再次连接，一旦 close 除非重新创建实例否则无法同一个实例重连

前端只需创建 `EventSource` 对象，并设置 `url` 为 SSE 服务的地址即可

TODO 用 table 列 onmessage 和 onopen 事件 和 onerror 事件 和 onclose 事件

```ts
const eventSource = new EventSource('/sse');
eventSource.onmessage = (event) => {
  console.log(event.data);
};
```
