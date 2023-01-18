---
title: Hugo Stack 主题添加「最后更新于」
author: shitao
date: '2023-01-18'
slug: hugo-stack
categories: []
tags:
  - Web
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---

博客文章显示「最后更新于 ……」可以帮助读者了解文章的更新状况，也让自己掌握一篇文章的成熟度。

这个博客由 Hugo 生成，目前用的是 [Stack](https://github.com/CaiJimmy/hugo-theme-stack) 主题，里边的文件配置是可以有文章页面下方的「最后更新于 ……」功能的，摸索了好久都没搞出来，今天终于在[这篇博客](https://blog.yfei.page/cn/2021/03/lastmod-hugo/)的帮助下搞出来了，记录一下操作。

# 配置「最后更新于功能」

在 `config.yaml` 文件中添加以下设置：

```yaml
frontmatter:
  lastmod: [":fileModTime", "lastmod"]
```

这样每篇文章下面都会显示「最后更新于 `xx`」，`xx` 为该文章的 Git 提交时间。

# 修改时间格式

同样是在 `config.yaml` 文件中，默认是：

```yaml
dateFormat:
    published: Jan 02, 2006
    lastUpdated: Jan 02, 2006 15:04 MST
```

`published` 控制文章发布时间格式，`lastUpdated` 控制最后更新时间格式。我偏向于「2023-01-18」这样的格式，所以把上面这段改成：

```yaml
dateFormat:
  published: 2006-01-02
  lastUpdated: 2006-01-02 15:04 MST
```

这样就是目前文章下方👇🏼的效果啦。需要注意的是，修改日期的格式一定要用「2006-01-02」这个日期，据说是 Go 语言的设定如此。
