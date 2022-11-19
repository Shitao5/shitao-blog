---
title: Typora 修改字体
author: shitao
date: '2022-11-19'
slug: typora-font
categories: []
tags:
  - Typora
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---

自从博客英文字体[改成](https://github.com/Shitao5/shitao-blog/commit/4184c3216debce6d6d668dee5efda0621f2706a3) Merriweather 后，越发觉得这个字体好看，今天给常用的笔记软件 [Typora](https://typora.io/) 也装上这个英文字体。

根据[官方文档](https://support.typora.io/Custom-Font/)，操作流程如下：

1. 在 Typora 的 `文件 -> 偏好设置 -> 外观` 选项卡找到 `打开主题文件夹`。

1. 新建 `base.user.css` 文件，该文件的内容将覆盖当前主题的设置。

1. 在 `base.user.css` 中设置字体，由于Merriweather 是网络字体，设置前需先导入：
    
    ```css
    @import url(https://fonts.googleapis.com/css2?family=Merriweather);

    body {
    font-family: Merriweather, sans-serif;
    }
    ```

1. 保存后重启 Typora 即可。

