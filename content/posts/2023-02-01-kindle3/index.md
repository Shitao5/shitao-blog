---
title: Kindle 笔记整理 3.0
author: shitao
date: '2023-02-01'
slug: kindle3
categories: []
tags:
  - Kindle
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---

# 笔记整理 3.0

经历了[最初版本](../kindle-notes/)（2022-06-03）、[2.0 版本](../kindle2/)（2022-09-12），Kindle 笔记整理 3.0 版本也出来啦！这次终于自我感觉良好，可以拿上台面了。

相比前两个版本，这次的改进有：

1. 创建了 `kindle_read()` 函数用于读取 `My Clippings.txt` 文件并转为整洁数据；创建了 `kindle_write_xlsx()` 和 `kindle_write_md()` 分别用于输出 Excel 和 Markdown 结果。

1. 以上函数在 **tidyverse** 框架下完成处理，利用函数参数控制笔记输出结果，代码量少，均收录在自己的个人 R 包 [**stfun**](https://shitao5.github.io/stfun/) 中。

1. 基于 **stfun** 包构建整理笔记的 Shiny 应用，已[发布](https://wushitao.shinyapps.io/Kindle-shiny/)供中文版 Kindle 用户使用，发布的平台为 [Posit](https://posit.co/) 公司[^posit] [shinyapps.io](https://www.shinyapps.io/)。

[^posit]: 原 RStudio 公司。

# 使用教程

制作了简短的使用教程，欢迎观看！

<!--  BV1ET411Z7bG  -->

# 可能遇到的问题

1. 只支持中文版的 Kindle，如果 `My Clipping.txt` 里边的记录信息（如页码、位置、时间等，不是指划线的句子）为其他语言，则无法正常处理。

1. 有些书籍没有页码信息， Kindle 无法记录页码，导出 Excel 时会有 Page 列为空的情况，自认为无伤大雅，笔记更重要的是内容和时间；导出 Markdown 不受影响。

1. 未经其他版本的 Kindle 测试。目前我的 Kindle Paperwhite 2 已用了六年多，不清楚其他版本 Kindle 的 `My Clipping.txt` 是否有变化。

如遇到无法使用等情况，欢迎提交 [issue](https://github.com/Shitao5/stfun/issues) 或留言。 
