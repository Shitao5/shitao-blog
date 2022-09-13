---
title: kindle笔记整理2.0
author: shitao
date: '2022-09-12'
slug: kindle2
categories:
  - R
tags:
  - Kindle
  - Tidyverse
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---



# 起因

之前[写过](https://shitao.netlify.app/record/kindle-notes/)一次整理 kindle 笔记的方法，不甚满意，趁着中秋假期来填坑。

对当初不满的地方有：

1. 数据清洗[部分](https://shitao.netlify.app/record/kindle-notes/#%E8%AF%86%E5%88%AB%E7%AC%94%E8%AE%B0%E5%9D%97)属于误打误撞成功的，不清楚其鲁棒性如何。
1. 结果的[写出](https://shitao.netlify.app/record/kindle-notes/#%E5%86%99%E5%87%BA%E5%88%B0%E6%96%87%E4%BB%B6)采用了强制构建 markdown 结构的方法，并未采用简单的输出功能。

# 用法详解

## 克隆仓库

先克隆仓库至看官您的电脑上，仓库地址：<https://github.com/Shitao5/kindler>。不会用 git 的小伙伴直接下载仓库的压缩包解压即可：

<div class="figure" style="text-align: center">
<img src="imgs/git.png" alt="从 GitHub 下载仓库" width="80%" />
<p class="caption">Figure 1: 从 GitHub 下载仓库</p>
</div>

## 导入 `My Clippings.txt` 文件

将 kindle 设备连接电脑，从它的 `documents` 文件夹复制 `My Clippings.txt` 文件到仓库中。为了便于示范，仓库中已有一个 `My Clippings.txt` 文件，直接覆盖即可。

## 安装 R 包

国内的小伙伴先切换国内镜像，在 RStudio 的 `Tools -> Global Options -> Packages -> Change` 选择一个国内的镜像。

<div class="figure" style="text-align: center">
<img src="imgs/mirror.png" alt="切换下载镜像" width="80%" />
<p class="caption">Figure 2: 切换下载镜像</p>
</div>

而后安装包：


```r
install.packages(c("tidyverse", "lubridate", "cli"))
```

其中：

- **tidyverse** 用于数据处理，本项目主要在其框架下进行；
- **lubridate** 用于时间型数据的处理；
- **cli** 用于美化控制台输出。

## 运行 `script.R`

同样是为了示范，仓库中的 `files` 文件夹中已有部分文件，可以先清空该文件夹，而后运行 `script.R`。

<div class="figure" style="text-align: center">
<img src="imgs/source.png" alt="使用 RStudio 的小伙伴直接点击该按钮" width="80%" />
<p class="caption">Figure 3: 使用 RStudio 的小伙伴直接点击该按钮</p>
</div>

查看 `files` 文件夹，已经按照「一本书一个文件」的方式输出结果了。

# 注意事项

## 重复笔记问题

在使用 Kindle 阅读时，可以看到 kindle 使用位置进行定位，关于 kindle 中的位置是个什么玩意儿，可以参考以下资料：

- [kindle看书进度中的“位置”是个什么概念？](https://www.zhihu.com/question/21527376)
- [What does one Kindle location unit represent?](https://www.quora.com/Amazon-Kindle-product/What-does-one-Kindle-location-unit-represent?share=1)

从上面的资料可以估计每一个位置大致对应不到100字（每本书不一样），笔记长度一般会超过这个数字，即超过一个位置。排除笔记起始位置正好非常接近位置分界处的情况（概率不大），简而言之就是：

1. 笔记长度超过一个位置
1. 起始位置相同的笔记有重复
1. 起始位置不同的笔记没有重复

在这样的情况下，该方法是简单有效的。另外，`My Clippings.txt` 中有记录每一条笔记的起始和终止位置，因此我选择以起始位置是否相同来判断笔记是否重复，

当然，可能出现重复笔记，或者处在同一位置下非常简短的笔记被误删的情况。

## 文件输出错误

`script.R` 中的 `title` 变量将是输出文件的文件名（包括后缀），因此应避免文件名中出现特殊字符，比如`.`。如果存在，应对 `title` 变量进行修改，修改方法对照 `script.R` 第36-47行：


```r
text2 <- text2 %>% 
  mutate(title = case_when(
    str_detect(title, "彷徨少年时") ~ "德米安：彷徨少年时（赫尔曼·黑塞）",
    str_detect(title, "少即是多") ~ "少即是多（本田直之）",
    str_detect(title, "东方之旅") ~ "东方之旅（赫尔曼·黑塞）",
    str_detect(title, "成为我自己") ~ "成为我自己：欧文·亚隆回忆录（欧文·亚隆）",
    TRUE ~ title
  ))
```

该方法使用匹配+修改，比如在 `My Clippings.txt` 中《德米安》一书，其标题为「德米安：彷徨少年时(诺贝尔文学奖得主赫尔曼•黑塞代表作，比肩《少年维特之烦恼》。你我之辈着实孤独，但我们还有彼此。) (赫尔曼·黑塞)」，该标题被 `str_detect(title, "彷徨少年时") ~ "德米安：彷徨少年时（赫尔曼·黑塞）"`匹配和修改：

1. `str_detect(title, "彷徨少年时")` 匹配 `title` 中具有「彷徨少年时」几字的行
1. `~ "德米安：彷徨少年时（赫尔曼·黑塞）"` 将其修改为「德米安：彷徨少年时（赫尔曼·黑塞）」

最终生成的文件名即为 `德米安：彷徨少年时（赫尔曼·黑塞）.md`。

建议各位小伙伴在向 kindle 导入书籍的时候注意书籍名字，这样既方便自己管理，处理的时候也不需要多一步修改。

## 不想要时间信息？

目前的输出是文本内容+笔记时间：

<div class="figure" style="text-align: center">
<img src="imgs/note.png" alt="当前输出示例" width="80%" />
<p class="caption">Figure 4: 当前输出示例</p>
</div>

如果不需要文本后显示时间信息，可以将第84-87行删除或者注释掉，取消第89-91的注释：


```r
dfs <- result %>%
  select(title, print = text) %>%
  group_split(title, .keep = FALSE)
```

# 总结

目前使用下来感觉还不错，符合自己的需求。

说了这么多，感觉应该写个包。
