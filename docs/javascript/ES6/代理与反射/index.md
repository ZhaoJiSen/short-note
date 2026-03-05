---
title: 代理与反射
createTime: 2026/02/26 10:46:57
permalink: /javascript/pm6r5fvv/
---

## Proxy

Proxy 对象允许你为另一个对象创建代理，该代理能够拦截并重新定义该对象的基本操作

:::table full-width

| 参数 | 描述 |
| --- | --- |
| `target` | 需要代理的原始对象 |
| `handler` | 定义哪些操作将被拦截以及如何重定义拦截操作的对象 |

:::

```js
const proxy = new Proxy(target, handler)
```

::::details handle 配置

:::table full-width

| Trap | 触发时机 |  返回值要求 |
| --- | --- | --- | --- |
| `get` | 读取属性：`obj.foo` |  任意值 |
| `set` | 设置属性：`obj.foo = v` | `boolean` |
| `has` | `key in obj` | `boolean` |
| `deleteProperty` | `delete obj.foo` | `boolean` |
| `ownKeys` | `Object.keys / Reflect.ownKeys` | 键数组 |
| `apply` | 代理函数被调用 | 任意值 |
| `construct` | 代理函数被 `new` 调用 | 对象 |

:::

::::

## Reflect

Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。Reflet 对象的方法和  Proxy的拦截器的方法完全一致

> [!IMPORTANT]
> Reflect 不是一个函数对象，因此它是不可构造的

::::details Reflect 常用 API

:::table full-width

| API | 对应行为 | 说明 | 返回值 |
| --- | --- | --- | --- |
| `Reflect.get(target, key, receiver?)` | 读取属性 | 与代理 `get` 搭配最常见 | 属性值 |
| `Reflect.set(target, key, value, receiver?)` | 写入属性 | 成功与否返回布尔值 | `boolean` |
| `Reflect.has(target, key)` | `in` 判断 | 语义与 `in` 一致 | `boolean` |
| `Reflect.deleteProperty(target, key)` | 删除属性 | 删除成功与否可判断 | `boolean` |
| `Reflect.ownKeys(target)` | 取所有键 | 包括 `symbol` 键 | `Array<PropertyKey>` |
| `Reflect.apply(fn, thisArg, args)` | 函数调用 | 显式指定 `this` 与参数 | 任意值 |
| `Reflect.construct(Ctor, args)` | 构造调用 | 等价可控版 `new` | 对象 |

:::

### API 示例

:::code-tabs
@tab Proxy + Reflect（对象）

```js
const source = {
  name: 'Tom',
  phone: '13800000000',
  price: 0
}

const agent = new Proxy(source, {
  get(target, key, receiver) {
    if (key === 'phone') {
      return '请联系经纪人：400-888-8888'
    }

    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    if (key === 'price' && value < 100000) {
      throw new Error('报价过低')
    }

    return Reflect.set(target, key, value, receiver)
  }
})

agent.price = 150000
console.log(agent.phone)
console.log(agent.price)
```

@tab Proxy（函数）

```js
function sum(a, b) {
  return a + b
}

const wrapped = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.log('调用参数:', args)
    return Reflect.apply(target, thisArg, args)
  }
})

console.log(wrapped(1, 2)) // 3
```

:::

## 演示：代理读写与校验

:::demo

```html
<!doctype html>
<html lang="zh-CN">
  <body>
    <pre id="out"></pre>

    <script>
      const source = {
        name: 'Tom',
        phone: '13800000000'
      }

      const agent = new Proxy(source, {
        get(target, key, receiver) {
          if (key === 'phone') {
            return '请联系经纪人：400-888-8888'
          }

          return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
          if (key === 'price' && value < 100000) {
            throw new Error('报价过低')
          }

          return Reflect.set(target, key, value, receiver)
        }
      })

      const out = []
      out.push('name => ' + agent.name)
      out.push('phone => ' + agent.phone)

      agent.price = 150000
      out.push('price => ' + agent.price)

      try {
        agent.price = 1000
      } catch (e) {
        out.push('低报价报错 => ' + e.message)
      }

      document.getElementById('out').textContent = out.join('\n')
    </script>
  </body>
</html>
```

:::

## 额外说明：`has` 与 `for...in`

`has` trap 拦截的是 `in` 操作符，并不会直接拦截 `for...in` 枚举。
如果要影响枚举结果，重点应放在 `ownKeys` 与属性描述符控制上。
