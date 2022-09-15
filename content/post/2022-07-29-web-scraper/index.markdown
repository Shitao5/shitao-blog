---
title: 爬虫学习记录
author: shitao
date: '2022-07-29'
slug: web-scraper
categories:
  - R
tags:
  - 爬虫
description: 记录近期的爬虫学习和使用。
image: imgs/rvest.png
math: ~
license: ~
hidden: no
comments: yes
---

<script src="{{< blogdown/postref >}}index_files/htmlwidgets/htmlwidgets.js"></script>
<link href="{{< blogdown/postref >}}index_files/datatables-css/datatables-crosstalk.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/datatables-binding/datatables.js"></script>
<script src="{{< blogdown/postref >}}index_files/jquery/jquery-3.6.0.min.js"></script>
<link href="{{< blogdown/postref >}}index_files/dt-core/css/jquery.dataTables.min.css" rel="stylesheet" />
<link href="{{< blogdown/postref >}}index_files/dt-core/css/jquery.dataTables.extra.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/dt-core/js/jquery.dataTables.min.js"></script>
<link href="{{< blogdown/postref >}}index_files/crosstalk/css/crosstalk.min.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/crosstalk/js/crosstalk.min.js"></script>
<script src="{{< blogdown/postref >}}index_files/htmlwidgets/htmlwidgets.js"></script>
<link href="{{< blogdown/postref >}}index_files/datatables-css/datatables-crosstalk.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/datatables-binding/datatables.js"></script>
<script src="{{< blogdown/postref >}}index_files/jquery/jquery-3.6.0.min.js"></script>
<link href="{{< blogdown/postref >}}index_files/dt-core/css/jquery.dataTables.min.css" rel="stylesheet" />
<link href="{{< blogdown/postref >}}index_files/dt-core/css/jquery.dataTables.extra.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/dt-core/js/jquery.dataTables.min.js"></script>
<link href="{{< blogdown/postref >}}index_files/crosstalk/css/crosstalk.min.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/crosstalk/js/crosstalk.min.js"></script>

暑假过半，一个月来深入学习R语言，最近横向拓宽一下R语言技能，包括利用Rmd文件构建常用的幻灯片和网页文档、网络爬虫等。

此文用于记录爬虫使用心得，仅为个人理解，不足之处请指正。

简单理解，爬虫就是利用计算机替代我们的手工复制和粘贴，因此和手工复制一样，爬虫的关键是：

1.  找到所有网页链接；
2.  找到同一网页链接上所有所需信息的位置并提取；
3.  访问所有网页，获取所有信息。

以通过翻页展示网站内容的[数英网](https://www.digitaling.com/)为例，爬取该网站上与**数据**有关的文章标题和发文时间：

<div class="figure" style="text-align: center">

<img src="imgs/search.png" alt="在网页搜索框中输入关键词，这里为“数据”。" width="640" />
<p class="caption">
Figure 1: 在网页搜索框中输入关键词，这里为“数据”。
</p>

</div>

# 构建网页地址

在搜索结果下点击“查看更多文章”后，可以看到页面需要进行翻页：

<div class="figure" style="text-align: center">

<img src="imgs/search2.png" alt="通过点击翻页，并复制网址地址，可以发现网址中的规律" width="326" />
<p class="caption">
Figure 2: 通过点击翻页，并复制网址地址，可以发现网址中的规律
</p>

</div>

``` r
https://www.digitaling.com/search/articles/1?kw=%E6%95%B0%E6%8D%AE  # 第一页
https://www.digitaling.com/search/articles/2?kw=%E6%95%B0%E6%8D%AE  # 第二页
https://www.digitaling.com/search/articles/3?kw=%E6%95%B0%E6%8D%AE  # 第三页
```

可以发现，网址中除了1,2,3会随着翻页而改变，其余部分完全相同。由此，可以通过`paste0()`函数构建所有需要访问的网页链接：

``` r
urls <- paste0("https://www.digitaling.com/search/articles/",
               1:35, # 共有35页
               "?kw=%E6%95%B0%E6%8D%AE")
urls
#> [1] "https://www.digitaling.com/search/articles/1?kw=%E6%95%B0%E6%8D%AE"
#> [2] "https://www.digitaling.com/search/articles/2?kw=%E6%95%B0%E6%8D%AE"
#> [3] "https://www.digitaling.com/search/articles/3?kw=%E6%95%B0%E6%8D%AE"
#> [4] "https://www.digitaling.com/search/articles/4?kw=%E6%95%B0%E6%8D%AE"
#> [5] "https://www.digitaling.com/search/articles/5?kw=%E6%95%B0%E6%8D%AE"
#>  [ reached getOption("max.print") -- omitted 30 entries ]
```

# 获取所需信息的位置

这一环节需要用到**rvest**包读取网页信息，而后确认所需信息在HTML中的位置，最终构建读取函数，供第三步循环使用。如有扎实的HTML和CSS知识作支撑会更顺利，由于鄙人条件不成熟，因此以**大量**的试错法进行弥补。😇

``` r
library(rvest)
library(tidyverse) # 偷懒起见，还是直接加载了tidyverse大包
```

## 读取一个测试网址

``` r
test_url <- urls[1]
web <- read_html(test_url)
web
#> {html_document}
#> <html xmlns="https://www.w3.org/1999/xhtml">
#> [1] <head>\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8 ...
#> [2] <body>\r\n\t<script async src="https://www.googletagmanager.com/gtag/js?i ...
```

这一步把整个网页文件都读取到了R中，接下来只要想办法在里边提取出想要的信息即可。

## 确认选择器

利用选择器进行提取，不同类型的信息对应的选择器不同，目前有两种方法确认不同信息的选择器：

1.  [SelectorGadget](https://selectorgadget.com/)，可以从[这里](https://chrome.google.com/webstore/detail/selectorgadget/mhjhnkcfbdhnjickkkdbjoemdmbfginb)安装谷歌浏览器插件。[^1]
2.  在所需信息的位置右击，检查。

### 提取“标题”

<div class="figure" style="text-align: center">

<img src="imgs/selector.png" alt="通过SelectorGadget，确认标题在该网页中被定义为“h3”（三级标题），因此只要提取该网页文件中所有的被定义为“h3”的文本，就可以获取这一页上所有的标题。" width="456" />
<p class="caption">
Figure 3: 通过SelectorGadget，确认标题在该网页中被定义为“h3”（三级标题），因此只要提取该网页文件中所有的被定义为“h3”的文本，就可以获取这一页上所有的标题。
</p>

</div>

``` r
title <- web |> 
  html_nodes("h3") |> 
  html_text()
title
#> [1] "我觉得比大数据更好用的方法，是体察用户的行为"              
#> [2] "糖，不那么伟大的作品丨青山资本2022年中消费报告"            
#> [3] "2022年90后高收入人群洞察报告：人均有房有车，理财副业两手抓"
#> [4] "MAGNA全球广告预测：广告市场在经济不确定性中持续增长"       
#> [5] "群邑电商发布《2022年618电商营销全景洞察》"                 
#>  [ reached getOption("max.print") -- omitted 25 entries ]
```

这一页上一共提取了30个标题。

### 提取“日期”

<div class="figure" style="text-align: center">

<img src="imgs/selector2.png" alt="通过检查元素，最终确认标题在该网页中被定义为“label”，同上，提取该网页文件中所有的被定义为“label”的文本，就可以获取这一页上所有的日期。" width="442" />
<p class="caption">
Figure 4: 通过检查元素，最终确认标题在该网页中被定义为“label”，同上，提取该网页文件中所有的被定义为“label”的文本，就可以获取这一页上所有的日期。
</p>

</div>

``` r
date <- web |> 
  html_nodes("label") |> 
  html_text()  # 这里提取了33个，最后3个为无效信息，需剔除
date <- date[1:(length(date)-3)]
date
#> [1] "2022-08-11" "2022-07-25" "2022-07-20" "2022-07-01" "2022-06-21"
#>  [ reached getOption("max.print") -- omitted 25 entries ]
```

## 输出测试网址上的信息

将每页的标题和时间合并到数据框中，便于后续处理。

``` r
data <- tibble(title, date)
DT::datatable(data)
```

<div id="htmlwidget-1" style="width:100%;height:auto;" class="datatables html-widget"></div>
<script type="application/json" data-for="htmlwidget-1">{"x":{"filter":"none","vertical":false,"data":[["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"],["我觉得比大数据更好用的方法，是体察用户的行为","糖，不那么伟大的作品丨青山资本2022年中消费报告","2022年90后高收入人群洞察报告：人均有房有车，理财副业两手抓","MAGNA全球广告预测：广告市场在经济不确定性中持续增长","群邑电商发布《2022年618电商营销全景洞察》","9000字深度拆解戴森：「爆发增长」与「战略失察」启示录","4000亿香氛蓝海市场，细分化赛道会是一张好牌吗？","体育明星营销价值观察，结合案例、数据分析","品牌升级，是品牌增长过程中的“伪命题”？","参与「2022女性品质生活大调查」，有好礼送","2021中国移动互联网年度大报告，短视频总时长占比增至26%","CBNData联合Yigrowth发布《2022品牌线上营销流量观察报告》","是哪些上海人，撑起了中国最爱喝咖啡的城市","广告人必备：45个优质报告网站合集，再也不用担心找不到报告了！","一文读懂NFT：全面解析NFT发展简史、价值及未来","爱奇艺发布2021年Q3财报：总营收76亿元，同比增长6%","吐血整理！看看这次双11的所有数据（附各种榜单）","用“一个支点”撬动新世代青年，这个新厂牌到底想怎样？","​2021年Z世代兴趣调查报告：我们发现了7个趋势","剧本杀新困境：资本围猎下何去何从","竞立中国任命许维怡(Vivi Xu)为数据业务负责人","20块一瓶的矿泉水，靠什么“征服”讲究性价比的年轻人","健康类策划怎么做？我分析了100+案例得出结论","《看长》背后，那些新消费前行者的故事","数据深度复盘鸿星尔克48小时，年轻人到底在为什么“野性消费”？","看完奈雪的财报，我开奶茶店的梦碎了","10年过去了，我还是忘不了这些广告","《2021圈层营销报告》更新，「路人粉圈」和「电竞圈」报告下载","2021男性消费洞察报告：泛娱乐特征突出，消费力不输女性","群邑电商发布《2021年618电商营销全景洞察》"],["2022-08-11","2022-07-25","2022-07-20","2022-07-01","2022-06-21","2022-05-31","2022-04-23","2022-04-19","2022-04-17","2022-03-10","2022-02-28","2022-02-17","2021-12-14","2021-12-07","2021-11-22","2021-11-17","2021-11-16","2021-11-03","2021-09-26","2021-09-01","2021-08-27","2021-08-18","2021-08-04","2021-07-29","2021-07-26","2021-07-20","2021-07-14","2021-07-06","2021-06-24","2021-06-23"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th> <\/th>\n      <th>title<\/th>\n      <th>date<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"columnDefs":[{"orderable":false,"targets":0}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>

## 构建爬虫函数

以上测试的最终目的是构建一个自动抓取的函数，该函数以网址为参数，如上所示的数据框为输出。具体如下：

``` r
scraper <- function(url) {
  # 读取参数网址对应的网页文件
  web <- read_html(url)
  
  # 获取网页文件中的标题
  title <- web |> 
  html_nodes("h3") |> 
  html_text()
  
  # 获取网页文件中的时间
  date <- web |> 
  html_nodes("label") |> 
  html_text()  
  date <- date[1:(length(date)-3)] # 剔除最后3个无效信息

  # 返回数据框
  return(tibble(title, date))
  
  # 休眠2秒，防止访问过快，被服务器禁止访问
  Sys.sleep(2)
}
```

# 获取所有信息

每爬取一个页面，可以获得一个数据框，其中包含30条记录（最后一页可能不足30条）。利用循环遍历35个页面，获得35个数据框，最后按行合并所有数据框，即可得到页面上所有的信息。

这一步看似复杂，但是可以由`map_dfr()`函数一步到位：

``` r
scraper_data <- map_dfr(urls, scraper)
nrow(scraper_data)
#> [1] 1024
```

最终获取了1024行数据，结果如下（展示前十条）：

``` r
DT::datatable(scraper_data[1:10, ]) 
```

<div id="htmlwidget-2" style="width:100%;height:auto;" class="datatables html-widget"></div>
<script type="application/json" data-for="htmlwidget-2">{"x":{"filter":"none","vertical":false,"data":[["1","2","3","4","5","6","7","8","9","10"],["我觉得比大数据更好用的方法，是体察用户的行为","糖，不那么伟大的作品丨青山资本2022年中消费报告","2022年90后高收入人群洞察报告：人均有房有车，理财副业两手抓","MAGNA全球广告预测：广告市场在经济不确定性中持续增长","群邑电商发布《2022年618电商营销全景洞察》","9000字深度拆解戴森：「爆发增长」与「战略失察」启示录","4000亿香氛蓝海市场，细分化赛道会是一张好牌吗？","体育明星营销价值观察，结合案例、数据分析","品牌升级，是品牌增长过程中的“伪命题”？","参与「2022女性品质生活大调查」，有好礼送"],["2022-08-11","2022-07-25","2022-07-20","2022-07-01","2022-06-21","2022-05-31","2022-04-23","2022-04-19","2022-04-17","2022-03-10"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th> <\/th>\n      <th>title<\/th>\n      <th>date<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"columnDefs":[{"orderable":false,"targets":0}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>

<img src="imgs/success.gif" style="display: block; margin: auto;" />

# 总结

最近遇到很多奇奇怪怪的网站，但思路始终是一致的，灵活运用，🉑解决90%的爬虫问题。

有的网站加载页的方式不一（比如下拉滚动加载），这会导致在网址不变的情况下爬虫无法抓取该页面所有信息，针对这样的网页可以采用还不错的谷歌插件[Web Scraper](https://www.webscraper.io/)等方法去抓取。利用R语言需补充一些其他的技术，目前只略知一二，未能熟练运用。

[^1]: 手头没有其他浏览器，不是谷歌浏览器的小伙伴自己寻找一下有无该插件吧！🏃
