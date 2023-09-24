---
title: 读书笔记搬迁至博客
author: 吴诗涛
date: '2023-04-30'
slug: banqian2
categories: []
tags:
  - R
description: 这次把公众号掏空啦！
image: img.jpg
math: ~
license: ~
hidden: no
comments: yes
---



# 搬迁

在 yihui 的[煽风点火](https://github.com/Shitao5/blog-comments/discussions/25#discussioncomment-5744924)下，俺马不停蹄地搬起了公众号。我的大学时光还剩一个月结束，也正是梳理四年生活的时候，读书笔记自然是不可或缺的环节，好事趁东风。

# 搬家记录


```r
library(tidyverse)
library(rvest)  # 识别合集
library(httr2)  # 请求正文
```

## 需要搬迁的内容

之前写公众号的时候，把所有书摘都放在了「臭臭札记」合集下，要搬迁的也正是这个合集下的文章。首先获取该标签页面下的所有文章标题、日期和链接地址，可以借用<a class="link" href="/read/banqian/#搬家代码">之前搬标题</a>写过的代码。


```r
# 读取公众号「臭臭札记」标签页面
data <- read_html("../2022-10-11-banqian/#臭臭札记.html")

# 提取标题
titles <- data %>% 
  html_nodes(".album__item-title-wrp") %>% 
  html_text() %>% 
  as_tibble() %>% 
  distinct(value)

# 提取日期
dates <- data %>% 
  html_nodes(".album__item-info-item") %>% 
  html_text() %>% 
  as_tibble()

# 提取链接
urls <- data %>% 
  html_nodes("li") %>% 
  html_attr("data-link") %>% 
  as_tibble() %>% 
  drop_na()

# 合并、清洗
books_df <- tibble(title = titles$value,
       date = dates$value,
       url = urls$value) %>% 
  mutate(date = if_else(
    str_count(date) < 10,
    str_c("2022/", date),
    date
  ) %>% as_date()) %>% 
  arrange(desc(date))

books_df
```

```
## # A tibble: 83 × 3
##    title                                      date       url                    
##    <chr>                                      <date>     <chr>                  
##  1 《北野武的小酒馆》——北野武                 2022-05-29 http://mp.weixin.qq.co…
##  2 Grokking Algorithms                        2022-05-28 http://mp.weixin.qq.co…
##  3 《塔木德》                                 2022-04-08 http://mp.weixin.qq.co…
##  4 《遥远的救世主》——豆豆                     2022-03-31 http://mp.weixin.qq.co…
##  5 《教授为什么没告诉我》——毕恒达             2022-03-15 http://mp.weixin.qq.co…
##  6 《在峡江的转弯处》——陈行甲                 2022-03-14 http://mp.weixin.qq.co…
##  7 《西方现代思想讲义》——刘擎                 2022-03-06 http://mp.weixin.qq.co…
##  8 《弗兰克尔自传：活出生命的意义》——弗兰克尔 2022-02-26 http://mp.weixin.qq.co…
##  9 《八次危机》——温铁军                       2022-02-17 http://mp.weixin.qq.co…
## 10 《反脆弱》——塔勒布                         2022-02-12 http://mp.weixin.qq.co…
## # ℹ 73 more rows
```

从大一到大三，看完八十多本书，有点小开心。

## 将原有的笔记转为 Markdown

### 文件名和路径

原先计划从公众号获取正文，遇到了<a class="link" href="#中途放弃的尝试">挺多问题</a>，遂放弃。

考虑到公众号发布的内容本地都有留存，所以尝试将本地文件用 Pandoc 转为博客支持的 Markdown。此前给自己的所有读书笔记画词云图时梳理过读书笔记的文件，主要有 `.html`、`.docx` 和 `.md` 三种格式。

首先提取笔记的文件名和路径名，然后用构造出输出文件名和输出路径。


```r
files_path <- list.files("notes", full.names = TRUE)
files_name <- list.files("notes")
target_name <- files_name %>%
  str_replace("(?<=\\.).*$", "md") %>%  # 零宽断言，把后缀名都改为 md
  str_remove_all(" *")
target_path <- paste0("notes/pandoc-md/", target_name)
```

### 调用 Pandoc 批处理

调用 Pandoc 进行批量转换，这里遇到了选择：

1. 写批处理脚本，但 Windows 搞起来有点麻烦，等有空了跑到 Linux 里再看看吧。
1. 使用 `rmarkdown::pandoc_convert()`，但这个函数似乎有点严格，好容易报错。

最后从 `rmarkdown::pandoc_convert()` 函数源码取经，把「合成 Pandoc 命令然后传给 Pandoc」 的部分提取出来，加工一下得到下面的方法：


```r
pandoc_convert <- function(input, output) {
  system(paste("pandoc", input, "-o", output, "--to gfm"))
}
walk2(files_path, target_path, ~ pandoc_convert(.x, .y))
```

批量转换的过程中会出现和直接调用 `rmarkdown::pandoc_convert()` 一样的提示：`pandoc.exe: notes/��R����ʵս������ROBERT: openBinaryFile: does not exist (No such file or directory)`。估摸着还是编码的问题，好在数量不大，手动改改可以接受。

### 文件名修改

博客需要的 Markdown 文件名为 `日期-文件名.md`，因此修改转换后的 Markdown 文件名。日期尽量与公众号上保持一致，对于不好匹配的，手工调整一下[^date]。文件名利用 Python 的 pypinyin 包将中文书名转为拼音。R 居然没有一个好用的转拼音工具，pinyin 包死活要带着音调。

[^date]: 这里失误，文件名修改时应使用现有读书笔记文件的修改时间，可以省去后续好多麻烦事。


```r
library(reticulate)
py <- import("pypinyin") # 书名转拼音，用 Python 的 pypinyin 包

file_info <- list.files("notes/pandoc-md") %>% 
  as_tibble() %>% 
  transmute(file = str_remove(value, "\\.md")) %>% 
  left_join(books_df %>% select(1:2), by = join_by(file == title)) %>% 
  mutate(book = ifelse(str_detect(file, "《"),
                       str_extract(file, "(?<=《).*(?=》)"), file),  # 提取《》中的书名用于生成 slug
         slug = map(book, ~ py$pinyin(.x, style = py$Style$NORMAL)), # 中文转拼音列表
         slug = map_chr(slug, ~ str_c(.x, collapse = "")),           # 拼音列表合并
         slug = ifelse(str_detect(slug, "[—：“（\\+]"),
                       str_extract(slug, ".*?(?=[—：“（\\+])"), slug), # 特殊字符前截断
         file_name = str_c(str_replace_na(date, "2022-05-29"), 
                           "-", slug, sep = ""),  # 不确定时间的，用最后一篇公众号文章时间
         path = list.files("notes/pandoc-md", full.names = TRUE),
         new_path = paste0("notes/blog-md/", file_name, ".md"))                    

file_info
```

```
## # A tibble: 88 × 7
##    file                          date       book  slug  file_name path  new_path
##    <chr>                         <date>     <chr> <chr> <chr>     <chr> <chr>   
##  1 《R的极客理想——量化投资篇》—… NA         R的…  Rdej… 2022-05-… note… notes/b…
##  2 《案例研究：原理与实践》——约… NA         案例… anli… 2022-05-… note… notes/b…
##  3 《案例研究方法的应用》——Robe… NA         案例… anli… 2022-05-… note… notes/b…
##  4 《八次危机》——温铁军          2022-02-17 八次… baci… 2022-02-… note… notes/b…
##  5 《白说》——白岩松              2020-04-24 白说  bais… 2020-04-… note… notes/b…
##  6 《变量》——何帆                2020-08-20 变量  bian… 2020-08-… note… notes/b…
##  7 《财富自由之路》——李笑来      2020-08-12 财富… caif… 2020-08-… note… notes/b…
##  8 《插花地册子》——止庵          2021-04-13 插花… chah… 2021-04-… note… notes/b…
##  9 《尘曲》——七堇年              2020-05-07 尘曲  chen… 2020-05-… note… notes/b…
## 10 《沉默的大多数》——王小波      2021-10-12 沉默… chen… 2021-10-… note… notes/b…
## # ℹ 78 more rows
```

将文件重命名，统一放到 `blog-md` 文件夹


```r
dir.create("notes/blog-md")
file.copy(file_info$path, file_info$new_path)
```

### yaml 添加

笔记放入博客，前面要搞点 yaml。

先构建 yaml：


```r
yamls <- file_info %>% 
  mutate(yaml = str_c("---\n",
                      "title: 读《", book, "》\n",
                      "author: 吴诗涛\n",
                      "date: '", str_sub(new_path, 15, 24), "'\n",
                      "slug: ", slug, "\n",
                      "tags: [读后感]\n",
                      "---\n"),
         final_path = str_replace(new_path, "notes/blog-md", "result")) %>% 
  select(file, new_path, date, yaml, final_path)

yamls
```

构建添加 yaml 的函数：


```r
add_yaml <- function(input, output, yaml) {
  file_content <- readLines(input) %>% 
                    str_remove_all("<.*>") # 对于 html 转换的文件，剔除还存在的 html 标签
  file_conbine <- c(yaml, file_content)
  writeLines(file_conbine, output)
}
```

批量添加 yaml：


```r
dir.create("result")
pwalk(list(input = yamls$new_path,
           output = yamls$final_path,
           yaml = yamls$yaml),
      add_yaml)
```

剩下的就是每个文件都检查一遍啦！

# 中途放弃的尝试

在寻找搬迁的方法时，遇到了很多问题，这些问题来自：

1. 以前的笔记没有层级结构。最开始使用 Word 文档做笔记，使用了自定义但没有层级的样式，转换后难以区分标题与正文。
1. 2021 年以前的公众号文章排版时，直接使用了加粗来标记标题，于是乎 Pandoc 转换后需要用正则表达式再次识别标题。简单来说，就是命中了 yihui 首页 `I yell at people who use \textbf{} to write \title{}` 中的 `people` 哈哈。
1. 2021 年后使用了多个基于 Markdown 的公众号排版编辑器，请求正文后发现这些编辑器在文中注入了很多杂七杂八的内容。在 Pandoc 转换后难以用正则表达式完全清洗干净，遂放弃。


```r
# 挑一个 url 试一试
url <- books_df %>% slice(61) %>% pull(url)

# 请求正文
body_html <- request(url) %>% 
  req_perform() %>% 
  resp_body_string()

# 写出正文
writeLines(body_html, "test.html")
```

然后在终端调用 Pandoc：

```shell
pandoc test.html -s -o test.md --to gfm
```

发现标题的文字和正文一个样，OMG！！

# 小结

这些笔记大多数是手敲的，或许仍存在错别字，希望不影响各位看官的阅读感受。不同形式的笔记背后，是曾经的自己不断探索更高效的笔记组织方式，寻找更方便的保存和分享途径。许多书中的句子早已遗忘。在重新梳理读书笔记的时候，会惊叹原来以前读到过这样的句子，也会感慨「纸上得来终觉浅」。

从公众号转移到博客，不用再担心自己的文章被删除，也不用因发布后只能修改 10 个字的奇葩规定而抓耳挠腮。博客世界还会有好心人给俺添砖加瓦，在此一并表示感谢！

搬迁完后，博客的起始时间便成了 2019 年，[影响力聚焦](https://yihui.org/cn/2019/03/influence-focus/)，多一份厚重感，继续耕耘！

