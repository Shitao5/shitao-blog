---
title: 初探云服务器
author: 吴诗涛
date: '2024-03-21'
slug: ecs1
---

最近又按捺不住折腾的心看起了台式机配件，不知该感叹是时光飞逝还是技术迭代神速。短短几年，英特尔 CPU 已经从 12 代升级到了 14 代。大多时候等等党胜利，或许早买早享受也是不错的选择态度。

碰巧看到阿里云的广告，2核 2G 云服务器、40G 云盘，99 元一年，可同价续费两年。三年 297 大洋，划算呀！抱着试一试的心态入手，选择了 Ubuntu 22.04 64位 UEFI版的操作系统，开启我的云服务器探索之路。

目前已经搭建了以下工具：

1.  [RStudio Server](https://posit.co/products/open-source/rstudio-server/)：在浏览器使用 RStudio，写作、写代码、终端，几乎是当云服务器的桌面在用了。默认在 `8787` 端口。
2.  [Shiny Server](https://posit.co/products/open-source/shinyserver/)：把设计好的 Shiny 晒出来。默认在 `3838` 端口。
3.  [Apache HTTP Server](https://httpd.apache.org/)：把 Quarto 生成的 HTML 文档丢到 `/var/www/html` 目录下，即可通过浏览器输入 `公网IP + \filename.html` 查看文档。

目前发现一个小问题：内存小，有些项目无法构建。比如学习博客中有几篇[文章](https://learn.shitao5.org/posts/20230816-mlr3book/)涉及机器学习模型训练，Quarto 在渲染整个网站时会卡死。目前的解决办法是 GitHub 中转下，本地渲染。后续琢磨琢磨云服务器上搭建 Git，成功的话就更省事了。

用云服务器之后思路打开不少，之后自己装配主机也可以使用 ssh 连接调用。
