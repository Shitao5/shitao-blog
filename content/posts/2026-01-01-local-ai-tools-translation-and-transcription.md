---
title: 翻译·转写
author: 吴诗涛
date: '2026-01-01'
slug: local-ai-tools-translation-and-transcription
---

前两天折腾了两个本地运行的工具，现在回头记录，时间点已经可以称「去年底」了。

# 翻译

想看的英文书没有中文翻译，索性用 ollama 运行[翻译模型](https://ollama.com/huihui_ai/hunyuan-mt-abliterated)进行英文 epub 文件的翻译。在 4060Ti 16G 显卡上运行 32 分钟，完成 14 万中文字的翻译输出。

项目代码：[GitHub](https://github.com/Shitao5/my_code/tree/main/20251226-epub-translation)

# 语音识别

遇到需要语音转文字的场景，发现大部分工具还要收费。于是尝试了 基于 OpenAI 生态的 [faster-whisper](https://github.com/SYSTRAN/faster-whisper) 和 达摩院的 [FunASR](https://github.com/modelscope/FunASR)。最终采用后者，因为识别带标点，并且准确率惊人。

在 MacBook Pro M5 24G 上运行 174 秒（使用 MPS），完成时长 28 分钟语音的转写，输出 5400 字。

项目代码：[GitHub](https://github.com/Shitao5/my_code/tree/main/20251230-audio-transcription)

# 感受

这两个项目均在 Codex Cli 的帮助下部署、配置和运行，不到半天完成从想法到执行的全过程，实实在在为这个时代「先进工具触手可得」而喜悦与震撼。

我也愈发清晰地感受到，「服务即软件」正离我越来越近，服务为主，软件只是承载形式。半年前，我还在用熟悉的工具（比如R、Shiny）为他人搭建数据处理应用；如今，Codex 为我提供了屏蔽代码层、使用自然语言直达软件的服务，几乎每一个需要解决的问题，都可以抽象成软件（脚本）完成，而 Codex 本身又是软件。

可以预见：「想到就能做，需要就能用」要成为常态啦！