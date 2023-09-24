---
title: 博客新开「他山之石」栏目
author: shitao
date: '2023-01-16'
slug: others
categories: []
tags:
  - R
  - 思考
  - 博客
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---

# 开设原因

最近折腾笔记软件 [Logseq](https://logseq.com/)，又看了遍以前的笔记。You are what you read，有些内容影响着我，是现在我的一部分。为了自己而写博客，博客应努力与自我意志统一，达到 you are what you write 的效果。

[他山之石](../../others) 摘录了我高度认同或仍在努力达成的文字，回答我「从哪来」和「要到哪里去」的问题，均标注原文地址，以飨读者。

# 技术操作

笔记在 Logseq 中设置了双链（`[[双链]]`）和标签（`#标签`）用于构建知识图谱，在发布前需要去除双链和标签，用正则表达式替换很方便：

```r
readLines("./content/others2.md") |>
  stringr::str_replace_all("\\[\\[", "") |>
  stringr::str_replace_all("\\]\\]", "") |>
  stringr::str_replace_all(" #.*", "") |>
  writeLines("./content/others.md")
```
