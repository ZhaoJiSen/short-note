---
title: N-Gram 模型
createTime: 2026/06/28 10:00:00
permalink: /AI/llm/34cc7a39/
---

> [!NOTE]
> 从 1970 年以后，人们意识到语言处理不能只靠规则，得靠统计，从这个节点开始出现了很多语言模型，N-Gram 就是其中的起点。

N-Gram 模型诞生于 1950s–1960s，最早由香农（Claude Shannon）在信息论中提出，用于语言的概率建模。前面的 N 是一个数字，表示每次要看几个词：

:::table full-width

| 名称 | 含义 |
| --- | --- |
| 1-Gram（Unigram） | 只看一个词，不看前面 |
| 2-Gram（Bigram） | 看前面的一个词 |
| 3-Gram（Trigram） | 看前面的两个词 |
| … | 以此类推 |

:::

它的理论基础是 **马尔可夫假设**：==一个词出现的概率，只依赖于它前面的 N-1 个词，而不是整个句子的历史。==

这其实很贴近人的直觉。当你听到：

```text
（厨房里）妈妈说："帮我拿一下冰箱里面的…"
```

你大脑会自动预测下一个词是 鸡蛋、牛奶、苹果 这类，而不会蹦出 飞机、汽车、电脑。N-Gram 做的就是把这种 "根据前文猜下一个词" 的能力用统计量化出来。

## 工作原理

以 Bigram（看前面一个词）为例。假设有这样一个语料库，用它来训练模型：

```text
"我 爱 吃 苹果"
"我 爱 吃 香蕉"
"我 喜欢 吃 苹果"
```

Bigram 会 **统计每个词后面跟着哪个词、各出现多少次**，数一数所有词对：

:::table full-width

| 前一个词 | 下一个词 | 次数 |
| --- | --- | --- |
| 我 | 爱 | 2 |
| 我 | 喜欢 | 1 |
| 爱 | 吃 | 2 |
| 喜欢 | 吃 | 1 |
| 吃 | 苹果 | 2 |
| 吃 | 香蕉 | 1 |

:::

把次数换成概率，就能预测下一个词：

- **我** 后面出现 爱 的概率是 2/3，出现 喜欢 的概率是 1/3
- **吃** 后面出现 苹果 的概率是 2/3，出现 香蕉 的概率是 1/3

所以当模型看到 "我 爱 吃"，下一个词大概率就是 苹果。

## 代码实践

`jieba` 是 Python 里常用的中文分词库。下面用它对语料分词，统计 Bigram 概率并做预测：

```python
import jieba  # 中文分词库
from collections import defaultdict, Counter  # 用于构建频率统计表

# 示例语料库（连续的中文句子，没有空格）
corpus = [
    "我喜欢吃苹果",
    "我喜欢吃香蕉",
    "她喜欢吃葡萄",
    "他不喜欢吃香蕉",
    "他喜欢吃苹果",
    "她喜欢吃草莓",
]

# 1. 构建 Bigram 统计表：bigrams[前一个词][下一个词] = 出现次数
bigrams = defaultdict(Counter)  # 自动初始化嵌套结构

for sentence in corpus:
    words = list(jieba.cut(sentence))  # 分词
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        bigrams[w1][w2] += 1  # 出现一次就 +1

# 2. 频率转概率，构建 P(w2 | w1) 概率表
bigram_probs = {}
for w1 in bigrams:
    total = sum(bigrams[w1].values())  # w1 后面所有词的总次数
    bigram_probs[w1] = {
        w2: count / total for w2, count in bigrams[w1].items()
    }

# 3. 输入一个词，预测它后面最可能的词（按概率从高到低）
def predict_next_word(word):
    if word not in bigram_probs:
        return "未知（没有数据）"
    return sorted(
        bigram_probs[word].items(), key=lambda x: x[1], reverse=True
    )

# 4. 打印所有 Bigram 条件概率
print("=== Bigram 概率 ===")
for w1 in bigram_probs:
    for w2 in bigram_probs[w1]:
        print(f"P({w2} | {w1}) = {bigram_probs[w1][w2]:.2f}")

# 5. 预测测试
print("\n=== 预测示例 ===")
for test_word in ["我", "吃", "喜欢", "苹果"]:
    print(f"{test_word} → {predict_next_word(test_word)}")
```

N-Gram 虽然简陋，但它确确实实是 **基于统计的语言建模的起点**。

> [!IMPORTANT]
> N-Gram 用马尔可夫假设把  "猜下一个词" 变成可统计的条件概率，是统计语言模型的开端。但它的短视、无法泛化、无语义理解三大缺陷，也正是后续词袋模型、词嵌入乃至 Transformer 要解决的问题。

## 常见缺陷

1. **语境短视**：只看前 N-1 个词，无法理解长距离依赖。例如 "我昨天见到一个朋友，他说他非常喜欢编程"，N-Gram 抓不住 "他" 和 "朋友" 的关联。
2. **无法泛化**：只能记住见过的词语组合，没见过的组合无能为力。语料里只有 "我爱吃西瓜"，模型永远预测不出 "我爱吃葡萄"。
3. **不具备语义理解**：分不清 喜欢 和 爱 词义相近，也区分不了 "我打了他" 和 "他打了我"。
