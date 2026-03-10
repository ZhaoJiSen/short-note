---
title: Docker
createTime: 2025/11/24 23:36:13
permalink: /article/d0hw8tkz/
tags:
  - 运维与部署
---

[+简单理解]: 先从 Docker Hub 拉取 `nginx` 镜像；再基于 `nginx` 镜像启动一个容器；最后通过端口映射把容器服务暴露给宿主机访问

Docker 是一种容器化平台，用来为应用程序提供独立的运行环境

:::note 在 Docker 体系里

1. 运行 Docker 的机器叫做宿主机
2. 被隔离运行的应用实例叫做容器
3. 用来创建容器的模板叫做镜像
4. 用来存储和分发镜像的地方叫做仓库

可以把它理解为：==镜像类似 "软件安装包"，容器类似 "安装后正在运行的软件实例"，仓库类似 "应用商店"[+简单理解]=={.important}

:::

::::details 容器和虚拟机的区别
Docker 容器和虚拟机都能提供隔离环境，但实现方式不同。Docker 多个容器共享宿主机内核，资源占用更低，启动速度更快，更适合应用部署和微服务场景。而每个虚拟机都有完整操作系统，隔离更重，启动更慢，资源开销更高

::::

## 镜像操作

### 镜像拉取

使用 `docker pull` 从仓库下载镜像：

```bash
docker pull nginx
docker pull n8n/n8n
```

一个完整镜像名的结构通常为：

```bash
[registry/][namespace/]image[:tag]
```

:::details 宿主环境区分

Docker 默认会选择宿主机可运行的镜像版本，但在以下场景要特别注意：

1. ARM 服务器拉取镜像时，需要确认镜像是否支持 `arm64`。
2. Apple Silicon 上运行部分 `amd64` 镜像时，可能依赖模拟层，性能会有损耗。

必要时可以显式指定平台：

```bash
docker pull --platform linux/amd64 nginx
```

:::

### 查看本地镜像

查看本地镜像通过命令 `docker images` 命令

:::table full-width

| 字段名称 | 描述 |
| --- | --- |
| REPOSITORY | 镜像仓库名 |
| TAG | 镜像标签 |
| IMAGE ID | 镜像 ID |
| SIZE | 镜像大小 |

:::

### 删除镜像

删除镜像通过命令 `docker rmi` 命令，删除多个镜像使用空格进行分隔

```bash
docker rmi nginx
docker rmi IMAGE_ID
```

### 构建镜像

在 Dockerfile 所在目录执行：

```bash
docker build -t my-node-app .
```

如果要指定版本：

```bash
docker build -t my-node-app:1.0.0 .
```

:::table full-width

| 构建参数 | 描述 |
| --- | --- |
| `-t` | 指定镜像名称 |
| `-f` | 指定 Dockerfile 文件 |
| `-v` | 指定构建上下文目录 |
| `-p` | 指定构建端口 |
| `-e` | 指定构建环境变量 |
| `-r` | 指定构建缓存 |
| `-m` | 指定构建内存 |

:::

### 运行自定义镜像

通过 `docker run` 命令可以运行自定义镜像

```bash
docker run -d \
  --name my-node-app \
  -p 3000:3000 \
  my-node-app:1.0.0
```

## 容器操作

### 创建与运行容器

[+端口映射]:语法是 `-p 宿主机端口:容器端口`。例如 `docker run -d -p 8080:80 nginx` 其含义是：宿主机访问 `8080` 端口，转发到容器内部的 `80` 端口
[+环境变量]:

  ```bash
  docker run -d \
    --name my-mongo \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=123456 \
    mongo
  ```

[+容器名称]:

  ```bash
  docker run -d --name my-nginx nginx
  ```

[+重启策略]: 常见策略有 `always`、`unless-stopped`，其中 `unless-stopped` 更适合长期运行服务

创建与运行容器通过命令 `docker run` 命令，如果本地没有这个镜像，Docker 会先自动拉取

```bash
docker run nginx
```

:::table full-width

| 运行参数 | 描述 | 使用场景 |
| --- | --- | --- |
| `-d` | 后台运行 | 终端不会被容器占住，适合服务类应用 |
| `-p` | 端口映射[+端口映射] | 容器运行在独立网络环境中，默认无法直接从宿主机访问 |
| `-v` | 卷挂载 | 让容器访问宿主机的文件，用于数据持久化 |
| `-e` | 环境变量[+环境变量] | 给容器传配置 |
| `--name` | 容器名称[+容器名称] | 给容器命名 |
| `-it` | 交互模式 | 进入容器交互模式 |
| `-rm` | 自动删除 | 适合临时调试容器，退出后容器会自动删除 |
| `-restart` | 重启策略[+重启策略] | 生产环境常见配置 |

:::

### 删除容器

通过 `docker rm` 命令可以删除容器。==只能删除已经停止的容器==

```bash
docker rm my-nginx
```

### 查看容器

:::code-tabs

@tab 查看正在运行的容器

```bash
docker ps
```

@tab 查看所有容器

```bash
docker ps -a
```

:::

### 启停容器

通过 `docker stop` 和 `docker start` 命令可以停止和启动容器

```bash
docker stop my-nginx
docker start my-nginx
```

容器第一次通过 `docker run` 创建后，其端口、环境变量、挂载卷等配置会被保留，后续 `start` 不需要重新写参数

### 查看容器日志

通过 `docker logs` 命令可以查看容器日志

:::code-tabs

@tab 查看容器日志

```bash
docker logs my-nginx
```

@tab 实时查看日志

```bash
docker logs -f my-nginx
```

@tab 查看最近 N 行

```bash
docker logs --tail 10 my-nginx
```

@tab 查看带时间的日志

```bash
docker logs -t my-nginx
```

:::

### 查看详细配置

使用 `docker inspect` 命令可以查看容器详细配置

```bash
docker inspect my-nginx
```

这个命令会输出大量 JSON 信息，包括：网络配置、挂载信息、环境变量、启动命令等

### 更新容器配置

通过 `docker update` 命令可以更新容器配置

```bash
docker update my-nginx --restart=always
```

:::note
:::

### 在运行中的容器里执行命令

通过 `docker exec` 命令可以在运行中的容器里执行命令，就像进入一台 Linux 服务器一样

:::note
只能进入正在运行的容器
:::

```bash
docker exec -it 容器名 bash
```

:::details `docker logs` 与 `docker exec` 查看日志的区别
`docker logs` 用于查看容器主进程输出，`docker exec` 查看是进入容器自己去找日志文件
:::

## 构建自定义镜像

Dockerfile 是一份用来描述镜像构建过程的文本文件

:::table full-width

| 指令 | 描述 |
| --- | --- |
| `FROM` | 指定基础镜像 |
| `WORKDIR` | 设置工作目录 |
| `COPY` | 复制文件到镜像中 |
| `RUN` | 在构建阶段执行命令 |
| `EXPOSE` | 声明容器内服务端口 |
| `CMD` | 定义容器启动时默认执行的命令 |

:::

:::details 完整的 Node.js 示例

```dockerfile
# 选择 Node 20 的 Alpine 版本作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 先复制依赖描述文件，利用 Docker 层缓存
COPY package.json package-lock.json ./

# 安装依赖
RUN npm install

# 再复制项目源码
COPY . .

# 声明服务端口
EXPOSE 3000

# 容器启动命令
CMD ["npm", "run", "start"]
```

:::

## Docker Compose

当一个应用由多个服务组成时，比如：前端、后端、MySQL、Redis。如果全部用 `docker run` 手工管理，命令会非常分散。Docker Compose 的作用就是把多容器定义写进一个 YAML 文件中统一管理

```yaml
services:
  app:
    image: node:20-alpine
    container_name: demo-app
    working_dir: /app
    volumes:
      - ./:/app
    command: sh -c "npm install && npm run dev"
    ports:
      - "3000:3000"
    depends_on:
      - redis

  redis:
    image: redis:7
    container_name: demo-redis
    ports:
      - "6379:6379"
```

:::table full-width

| 命令 | 描述 |
| --- | --- |
| `docker compose up` | 启动服务 |
| `docker compose down` | 停止并删除服务 |
| `docker compose stop` | 停止服务 |
| `docker compose start` | 重新启动服务 |
| `docker compose restart` | 重新启动服务 |
| `docker compose logs` | 查看服务日志 |
| `docker compose exec` | 在容器中执行命令 |

:::
