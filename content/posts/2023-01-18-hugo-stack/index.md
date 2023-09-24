---
title: Hugo Stack 主题添加「最后修改于」
author: 吴诗涛
date: '2023-01-18'
slug: hugo-stack
categories: []
tags:
  - Web
  - 博客
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---

博客文章显示「最后修改于 ……」可以帮助读者了解文章的最新状况，也让自己掌握一篇文章的成熟度。

这个博客由 Hugo 生成，目前用的是 [Stack](https://github.com/CaiJimmy/hugo-theme-stack) 主题，里边的文件配置是可以有文章页面下方的「最后更新于 ……」功能的，摸索了好久都没成功，今天终于在 [这篇博客](https://blog.yfei.page/cn/2021/03/lastmod-hugo/) 的帮助下搞出来了，记录一下操作。

# 配置「最后修改于」

在 `config.yaml` 文件中添加以下设置（后续还会修改这条）：

```yaml
frontmatter:
  lastmod: [":fileModTime", "lastmod"]
```

这样每篇文章下面都会显示「最后更新于 `xx`」，`xx` 为该文章的修改时间。

个人觉得「修改」比「更新」更妥当，所以需要修改 `i18n` 中的文件：

1. 在博客根目录下新建 `i18n` 文件夹；

1. 将 `themes/hugo-theme-stack/i18n` 文件夹中的 `zh-cn.yaml` 复制到新建的 `i18n` 文件夹中;

1. 将复制后的 `zh-cn.yaml` 文件中的「最后更新于」改为「最后修改于」即可。

# 修改时间格式

同样是在 `config.yaml` 文件中，默认是：

```yaml
dateFormat:
    published: Jan 02, 2006
    lastUpdated: Jan 02, 2006 15:04 MST
```

`published` 控制文章发布时间格式，`lastUpdated` 控制最后修改时间格式。我偏向于「2023-01-18」这样的格式，所以把上面这段改成：

```yaml
dateFormat:
  published: 2006-01-02
  lastUpdated: 2006-01-02 15:04 MST
```

这样就是本地部署时文章下方的效果啦。需要注意的是，修改日期的格式一定要用「2006-01-02」这个日期，据说是 Go 语言的设定如此。

# 设置时区

以上设置可以确保本地部署符合要求，但 Push 到 GitHub 经由 Netlify 部署最后出来的时间是 协调世界时（UTC），修改的方法是在 `netlify.toml` 文件的 `[context.production.environment]` 中加上 `TZ` 参数：

```toml
[context.production.environment]
TZ = "/usr/share/zoneinfo/Asia/Shanghai"
```

我常住嘉兴和杭州，从 [这里](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 找到时区设置为 `Asia/Shanghai`。

# 解决「文章修改日期一致」问题

最后还遇到了所有文章的修改日期都一样的问题，目测是 `:fileModTime` 在部署的时候都被改掉了，于是又搜罗到了 [这篇文章](https://centurio.net/2022/01/24/set-last-modified-date-automatically/)，亲测可用。

具体操作还是回到 `config.yaml`，修改第一步的配置为：

```yaml
enableGitInfo: true

frontmatter:
  lastmod: ['lastmod', ':git', 'date', 'publishDate']
```

`:git` 是 Git 递交每篇文章修改的时间，比 `:fileModTime` 靠谱，修改后每篇文章会根据 Git 提交的时间显示最后修改时间。

# 在标题下显示修改日期

[上篇文章](https://centurio.net/2022/01/24/set-last-modified-date-automatically/) 里还提到了如何通过修改主题使最后修改的时间显示在文章标题下，这样在首页即可看到每篇文章的修改时间，非常清晰。具体操作是：

1. 复制 `themes/hugo-theme-stack/layouts/partials/article/components/details.html` 到 `layouts/partials/article/components/details.html`；

1. 用以下内容替换第 26-49 行：

    ```html
        {{ if or (not .Date.IsZero) (.Site.Params.article.readingTime) }}
            <footer class="article-time">
                {{ if not .Date.IsZero }}
                    <div>
                        {{ partial "helper/icon" "date" }}
                        <time class="article-time--published">
                            {{- .Date.Format (or .Site.Params.dateFormat.published "Jan 02, 2006") -}}
                        </time>
                    </div>
                {{ end }}
    
                <!-- Created Date -->
                {{- $pubdate := .PublishDate.Format "Jan 02, 2006" }}
                <!-- Last Updated Date -->
                {{- if .Lastmod }}
                    {{- $lastmod := .Lastmod.Format "2006-01-02" }}
                        {{- if ne $lastmod $pubdate }}
                            最后修改:
                            <time class="article-time--updated" datetime="{{ .Lastmod }}" title="{{ .Lastmod }}">
                                {{ $lastmod }}
                            </time>
                    {{- end }}
                {{- end }}
    
                {{ if .Site.Params.article.readingTime }}
                    <div>
                        {{ partial "helper/icon" "clock" }}
                        <time class="article-time--reading">
                            {{ T "article.readingTime" .ReadingTime }}
                        </time>
                    </div>
                {{ end }}
            </footer>
        {{ end }}
    ```

可以从 [这里](https://github.com/Shitao5/shitao-blog/blob/main/layouts/partials/article/components/details.html
) 查看修改后的 `details.html` 文件。

至此就好了，在搭建博客上花费一些时间和精力，对这片小天地更有熟悉感。
