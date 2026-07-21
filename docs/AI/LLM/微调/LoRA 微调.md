---
title: LoRA 微调
createTime: 2026/06/29 16:61:00
permalink: /AI/llm/106fa2ce/
---

LoRA 全称 Low-Rank Adaptation，中文"低秩适配器"，是目前最主流的[参数高效微调](/AI/llm/97f5fc08/#微调分类)方法。要理解它，得先搞懂"秩"

## 秩的概念

秩（Rank）指的是一个 **矩阵中真正包含的信息量** 有多少。用一个买水果的例子体会一下：

> 小红买 3 个苹果 4 个桃子花 18 元，小明买 2 个苹果 3 个桃子花 13 元，问苹果和桃子各多少钱？

```txt
3x + 4y = 18
2x + 3y = 13
```

两个方程各带来一条有效信息，能解出 `x`、`y`。但如果换成：

> 小红买 3 个苹果 4 个桃子花 18 元，小明买 6 个苹果 8 个桃子花 36 元。

```txt
3x + 4y = 18
6x + 8y = 36    // 只是第一个方程 ×2，没带来新信息
```

第二个方程是第一个的倍数，没有提供额外信息。这就是秩的直觉——**有效信息的数量**。看几个矩阵的例子：

$$
A = \begin{bmatrix} 0 & 0 \\ 0 & 0 \end{bmatrix}
\quad\text{秩为 0，没有任何信息}
$$

$$
A = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}
\quad\text{秩为 2，两行提供两条有效信息}
$$

$$
A = \begin{bmatrix} 1 & 2 \\ 2 & 4 \end{bmatrix}
\quad\text{秩为 1，两行是倍数关系（线性相关），只有一条有效信息}
$$

## LoRA 原理

假设大模型原始权重矩阵 $W$ 是一个 5×4 的矩阵，全量微调需要更新全部 5×4 = 20 个参数。微调后的权重 $W'$ 可以看成 **原始矩阵加上一个增量矩阵**：

$$
W' = W + \Delta W
$$

到这一步，增量矩阵 $\Delta W$ 就是要微调的参数，一共 20 个（全量微调）

换成 LoRA，先对增量矩阵做 **低秩分解**，拆成两个更小的矩阵相乘：

$$
\Delta W = A \cdot B
= \begin{bmatrix}
0.1 & 0.2 \\ 0.3 & 0.4 \\ 0.5 & 0.6 \\ 0.7 & 0.8 \\ 0.9 & 1.0
\end{bmatrix}_{5 \times 2}
\cdot
\begin{bmatrix}
1.1 & 1.2 & 1.3 & 1.4 \\ 1.5 & 1.6 & 1.7 & 1.8
\end{bmatrix}_{2 \times 4}
$$

**为什么增量矩阵能拆成 A·B？** 这是低秩分解的思想：矩阵里的信息往往分布不均，很多维度是冗余的，只需抓住主要方向就够了。线性代数里有个经典结论（秩分解定理）——对于任意秩为 $r$ 的矩阵 $M \in \mathbb{R}^{m \times n}$，总存在 $A \in \mathbb{R}^{m \times r}$ 和 $B \in \mathbb{R}^{r \times n}$ 使得 $M = A \cdot B$

举个秩分解的例子，矩阵 $M$ 秩为 1（第二行是第一行的 3 倍），就能拆成一个 2×1 和 1×2 的矩阵乘积：

$$
M = \begin{bmatrix} 2 & 4 \\ 6 & 12 \end{bmatrix}
= \begin{bmatrix} 1 \\ 3 \end{bmatrix} \cdot \begin{bmatrix} 2 & 4 \end{bmatrix}
$$

回到拆出的 $A$ 和 $B$，训练对象就从 $\Delta W$ 变成了这两个小矩阵：

- $A$：5×2 = 10 个参数
- $B$：2×4 = 8 个参数
- LoRA 总参数量：10 + 8 = **18 个**

从 20 降到 18，这个例子降幅不大。但真实模型参数量是 **数十亿**，LoRA 只需训练原始参数总量的 **0.01%~3%** 的新增模块，就能获得接近全量微调的效果。以一个 7B（70 亿）参数的模型为例：

- **全量微调**：更新 7,000,000,000 个参数
- **LoRA 微调**：只引入约 1,000,000 ~ 200,000,000 个可训练参数（取决于秩值 $r$、插入层数等）

$$
\frac{\text{LoRA 可训练参数}}{\text{原始参数总量}} \approx 0.01\% \sim 3\%
$$

## LoRA 的优点

- **参数少**：只微调原始参数的 1% 甚至更少。在 GPT-3 类大模型上，LoRA（$r=8$）可训练参数量仅为全量微调的 0.01%~0.1%，但在问答、摘要等任务中性能能达到全量微调的 95%~99%
- **速度快**：训练和部署都比全量微调省时省力
- **模块化**：训练好的 LoRA 插件可随时加载或卸载，不影响原始模型，特别适合多任务场景，可扩展性和灵活性高

> [!TIP] 数据来源
> 以上性能数据均来自原始论文 [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)

## 能上手实战吗

目前微调大模型高度依赖 Python 环境，原因有四：

- **主流工具和框架依赖 Python**：Hugging Face Transformers、PEFT、PyTorch Lightning、DeepSpeed、Axolotl 等都基于 Python 构建，训练循环、优化器、数据加载、分布式训练等能力的 API 都依赖 Python
- **数据准备用 Python 工具链**：格式转换、清洗、tokenize、构造 prompt 普遍用 `pandas`、`json`、`datasets` 等库完成
- **训练环境配置依赖命令行 + Python**：CUDA 驱动安装、依赖管理（conda / pip）、模型下载运行大多围绕 Python 生态
- **文档和开源实现以 Python 为主**：Hugging Face 官方文档、GitHub 开源代码、论文配套代码几乎都是 Python 编写
