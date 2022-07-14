---
title: Xaringan初试
author: 吴诗涛
date: '2022-07-15'
slug: xaringan-test
categories:
  - R
  - 技术贴
tags:
  - Xaringan
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---

# Xaringan-Slides嵌入博文

## 方法

### 网上的

今天学习了利用**Xaringan**包制作slides，现尝试将其嵌入到博文中。看到网上讨论的[方法](https://community.rstudio.com/t/posting-xaringan-presentation-on-blogdown/8212)是将knit好的`.html`文件挂网后，在博文中链接：


```r
knitr::include_url('https://timmastny.rbind.io/slides/first_presentation#1')
```

### 我的

虽然将写好的slides挂网可以在联网电脑直接使用，不需要插拔U盘或者登录一些社交软件（往往社死瞬间）。鄙人懒得去挂网，而且害怕对着浏览器输一串长网址。

因此采用将knit好的整个xaringan文件夹放到博文文件夹下的方法，此篇博文的文件夹下的文件有：


```
## [1] "index.markdown"                    "index.Rmarkdown"                  
## [3] "index.Rmarkdown.lock~"             "xaringan-test/xaringan-test.html" 
## [5] "xaringan-test/xaringan-test.Rmd"   "xaringan-test/xaringan-themer.css"
```

其中`index`开头的为博文内容，`xaringan-test`文件夹为slides的内容。也是使用`knitr::include_url()`函数，链接本地文件就OK。


```r
knitr::include_url("xaringan-test/xaringan-test.html", height = "500px")
```

<iframe src="xaringan-test/xaringan-test.html" width="672" height="500px" data-external="1"></iframe>

## 总结

各有利弊，个人偏好而已。自己的方法不需要建仓库、挂网等操作，其余都差不多吧。

## 使用方法

在xaringan上点一下，然后摁`h`（**h**lep)键调出帮助，根据帮助来。这里列出一些常用的：

- `f`键：全屏
- `c`键：复制一份幻灯片（多一个标签页，两个标签页的slides同步）
- `p`键：演讲者视图
- 双屏演讲者视图：在双屏拓展状态下，`c`复制一份，两屏各一份；投影那份`f`键全屏，面向演讲者的那份`p`键进入演讲者视图
- `o`键：宫格视图（需安装**xaringanExtra**包）
- ……

# 制作Xaringan Slides

怎么嵌入博文、怎么用都梳理好了，最重要的还是把这玩意儿做出来，毕竟内容为王。今天学习了一些基本的方法，笔记贴在下面。重要的还是多多练习。

## 基本使用

- 每一页可以用`name`进行命名，并用`[](#name)`或`[](#页码)`进行超链接。
- 左右分列（左窄右宽）：`.left-column[]`和`.right-column[]`。
- 左右分列（等宽）：`.pull-left[]`和`.pull-right[]`。
- `class: inverse center middle`可用作间隔页。
- `layout: true`下的内容保持固定，直到`layout: false`，中途可以改变需要固定的内容。
- `exclude`参数值为逻辑值，可以使用`r`代码。
- `.footnote[]`添加脚注。

## 表格

- 静态表格使用`knitr::kable(data, format = "html")`展示；动态表格使用`DT::datatable()`展示。

## 图片

- html：
  ```html
  <center><img src="https://octodex.github.com/images/labtocat.png" alt="GithHub Octocat" height="400px" /></center>
  ```
- Markdown
  ```markdown
  ![A wide image with a diagram of branching in git.](https://docs.github.com/assets/images/help/repository/branching.png)
  ```
- 展示两图可以结合左右分列的方法。

## XaringanExtra

- 多个功能一起用：`xaringanExtra::use_xaringan_extra(c("tile_view", "animate_css", "tachyons"))`，参数为：One or more of "tile_view", "editable", "share_again", "broadcast", "slide_tone", "animate_css", "panelset" "tachyons", "fit_screen", "webcam", "clipboard", "search", "scribble", "freezeframe".
- `use_tile_view()`: press `o` to appear or exit tile view.
- `use_editable(expires = 1)`: `expires` provides the number of days that values should be stored before being released. If you want to store the edited values and have them persist across browser sessions, give each editable filed a `.key-<NAME>` class.
- `use_scribble()`: Click the *pencil* icon or press `s` to begin drawing. Use ← and → keys to **undo** or **redo** your drawings.
- `use_animate_css()` and `use_animate_all()`: add the `animated` class and the [desired animation class](https://animate.style/) to the slides you want to animate.
- `use_panelset()`: creat a `.panelset[]` that contains `.panel[]`s. Each `.panel[]` should have a `.panel-name[]` and content.
- `use_fit_screen()`: This extension adds a short cut key — Alt/Option+ F — that fits the slides to the screen and ignores the slide ratio.
- `use_tachyons()`: [Tachyons](http://tachyons.io/) is a collection of CSS utility classes that works beautifully with [xaringan](https://slides.yihui.org/xaringan) presentations and the [remarkjs](https://remarkjs.com/) class syntax. In addition to the [tachyons documentation](http://tachyons.io/), the [Tachyons Cheatsheet](https://roperzh.github.io/tachyons-cheatsheet/) is an excellent and easy to use reference.
