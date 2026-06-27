---
title: 使用翻译模型翻译外文书籍
author: 吴诗涛
date: '2026-06-27'
slug: ai-book-translation-workflow
---

这两天想读一本书：*We Are as Gods: A Survival Guide for the Age of Abundance*。中文版有一个很酷的名字：[《吾辈如神：重构 AI 时代的生存力与胜任力》](https://book.douban.com/subject/38499138/)。

它谈到一个我很关心的话题：当 AI、机器人这些技术快速发展，人类获得了越来越接近神的能力，问题是我们该如何理解、如何运用这种力量。

作为多年小书虫，我拿到了英文 EPUB 版本，但没找到中文版电子书。平时我也会读一些英文原文，但主要集中在技术文档和短文章。对于大篇幅的书籍，我还是想翻译成中文看，否则大脑很容易从阅读任务变成了翻译任务。

于是，我第一时间想到的方法是使用「沉浸式翻译」。运行文档翻译后，我马上发现一个问题：它工作的本质是「逐段翻译」。这对于短文章很方便，但书籍这类长文档，里边有大量反复出现的概念，以及前后呼应的论证。如果每一段单独翻译，很容易出现同一个词被翻成不同的意思、阅读不连贯等问题。

为了对得起自己后续将花在阅读上的时间，我找来第二个方法：一个[书籍翻译 skill](https://github.com/deusyu/translate-book)，再加专门的翻译模型。

这次我调用腾讯云模型广场里的 Hy-MT2-Pro 服务，官方价格输入 0.5 元/百万 tokens，输出 2 元/百万 tokens。[官方介绍称](https://huggingface.co/tencent/Hy-MT2-30B-A3B)性能卓越：

> Multi-dimensional evaluations show that Hy-MT2 delivers outstanding performance across general, real-world business, domain-specific, and instruction-following translation tasks. The 7B and 30B-A3B models outperform open-source models such as DeepSeek-V4-Pro and Kimi K2.6 in fast-thinking mode, while the lightweight 1.8B model also surpasses mainstream commercial APIs from providers such as Microsoft and Doubao overall.
> 
> 多项评估结果表明，Hy-MT2 在通用翻译、实际商业场景应用、领域特定翻译以及指令遵循型翻译任务中均展现出卓越性能。其中，7B 和 30B-A3B 模型在快速推理模式下，其表现甚至优于 DeepSeek-V4-Pro 和 Kimi K2.6 等开源模型；而轻量级的 1.8B 模型也在整体表现上超越了微软、豆包等厂商提供的主流商业翻译 API。

操作也并不复杂，在腾讯云的模型广场免费领取一百万 tokens，创建 API Key，向 Codex 布置任务：

1. 安装这个 skill：https://github.com/deusyu/translate-book，配置所需工具。
2. （重启后上传英文 EPUB 文件）$translate-book  把这本书翻译为 `吾辈如神.epub`，使用的翻译模型调用方式如下：
   
	```bash
	curl -X POST 'https://tokenhub.tencentmaas.com/v1/chat/completions' \
	  -H 'Authorization: Bearer <YOUR_API_KEY>' \
	  -H 'Content-Type: application/json' \
	  -d '{
	    "model": "hy-mt2-pro",
	    "messages": [
	      {"role": "system", "content": "You are a helpful assistant."},
	      {"role": "user", "content": "你好"}
	    ],
	    "stream": false
	  }'
	```

在 Codex 调用的 skill 流程中，这本书被拆成了 207 个单独的块，每个块大约 6000 字符，然后并行翻译，最后校验、合并，生成对应的 EPUB 格式。

比起普通逐段翻译，这个 skill 更进一步的地方在于：除了翻译本身，它还包括术语表、相邻上下文、完整性校验、精确重译和多格式输出等环节，确保翻译结果的质量。

整个翻译消耗了 27.5 万 tokens，耗时 7 分钟。一盘算，翻译一本书连一块钱都不需要，如今可没有理由说「还没有中文版」而放弃读一本外文书了。

如何理解这种强大的力量，那更要马上读读《吾辈如神》这本书了。
