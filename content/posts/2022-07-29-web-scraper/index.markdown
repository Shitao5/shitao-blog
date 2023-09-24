---
title: 爬虫学习记录
author: 吴诗涛
date: '2022-07-29'
slug: web-scraper
tags:
  - R
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
<span id="fig:search"></span>Figure 1: 在网页搜索框中输入关键词，这里为“数据”。
</p>

</div>

# 构建网页地址

在搜索结果下点击“查看更多文章”后，可以看到页面需要进行翻页：

<div class="figure" style="text-align: center">

<img src="imgs/search2.png" alt="通过点击翻页，并复制网址地址，可以发现网址中的规律" width="326" />
<p class="caption">
<span id="fig:search2"></span>Figure 2: 通过点击翻页，并复制网址地址，可以发现网址中的规律
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
#> [2] <body>\r\n\t<!-- Google tag (gtag.js) -->\r\n<script async src="https://w ...
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
<span id="fig:selector"></span>Figure 3: 通过SelectorGadget，确认标题在该网页中被定义为“h3”（三级标题），因此只要提取该网页文件中所有的被定义为“h3”的文本，就可以获取这一页上所有的标题。
</p>

</div>

``` r
title <- web |> 
  html_nodes("h3") |> 
  html_text()
title
#> [1] "东方甄选又爆了，入淘宝直播首秀一场卖出1亿！"                  
#> [2] "狂卖170亿，今年电影为啥大爆发？"                              
#> [3] "2023年夏日经济之现制咖啡&茶饮市场洞察报告，线上总用户达1.51亿"
#> [4] "详拆「茶百道」招股书：新茶饮TOP3的喜与忧"                     
#> [5] "暂停4年，维密在中国“咸鱼翻身”了"                              
#>  [ reached getOption("max.print") -- omitted 25 entries ]
```

这一页上一共提取了30个标题。

### 提取“日期”

<div class="figure" style="text-align: center">

<img src="imgs/selector2.png" alt="通过检查元素，最终确认标题在该网页中被定义为“label”，同上，提取该网页文件中所有的被定义为“label”的文本，就可以获取这一页上所有的日期。" width="442" />
<p class="caption">
<span id="fig:selector2"></span>Figure 4: 通过检查元素，最终确认标题在该网页中被定义为“label”，同上，提取该网页文件中所有的被定义为“label”的文本，就可以获取这一页上所有的日期。
</p>

</div>

``` r
date <- web |> 
  html_nodes("label") |> 
  html_text()  # 这里提取了33个，最后3个为无效信息，需剔除
date <- date[1:(length(date)-3)]
date
#> [1] "2023-08-31" "2023-08-20" "2023-08-17" "2023-08-17" "2023-08-16"
#>  [ reached getOption("max.print") -- omitted 25 entries ]
```

## 输出测试网址上的信息

将每页的标题和时间合并到数据框中，便于后续处理。

``` r
data <- tibble(title, date)
DT::datatable(data)
```

<div class="datatables html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-1" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-1">{"x":{"filter":"none","vertical":false,"data":[["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"],["东方甄选又爆了，入淘宝直播首秀一场卖出1亿！","狂卖170亿，今年电影为啥大爆发？","2023年夏日经济之现制咖啡&amp;茶饮市场洞察报告，线上总用户达1.51亿","详拆「茶百道」招股书：新茶饮TOP3的喜与忧","暂停4年，维密在中国“咸鱼翻身”了","上半年饮品大数据来了！咖门×美团发布《2023春夏1000+新品报告》","2023中国移动互联网半年大报告，大厂重回快速增长","从618、端午的最新数据，看到难处和机会点","MAGNA全球广告预测23年夏季版：亚洲市场将继续强劲增长","2023淘宝天猫618品牌成交排行榜出炉！","抖音618的TOP10品牌榜&amp;店铺榜，速速一睹为快!","2023六大平台KOL粉丝分析研究报告（附下载）","《2023广告营销行业薪资报告》数英重磅发布","宏盟媒体集团OMG发布《2023中国媒介广告市场展望》","5月精选报告合集（附下载）：AIGC、新消费、潮流运动……","马蜂窝发布《2023五一旅游大数据报告》（附下载）","赛道越小众，在小红书越吃香","《清洁家电品牌出海市场营销趋势洞察》报告，附下载","国产数据库品牌OceanBase发布全新Logo，寓意「流动的数据」","ChatGPT调研报告：发展到今天这一步，哪个职业最慌？","2023《中国代理商图谱》发布，中英文2个版本（下载）","小红书数据分析白嫖指南，找渠道，找洞察，用！","电通创意发布《2023创意趋势报告：新都市物语》（附下载）","新榜发布《2023消费趋势报告》，附PDF下载","爱奇艺发布2022Q4及全年财报：首次实现全年运营盈利","2023情人节营销洞察报告，“三大趋势”重塑营销方向","干货梳理：16份报告精华总结，2023年这些趋势必须知道","2023年零售、消费行业年度十大趋势预测","消费真的复苏了吗？这里有7张图和4个趋势总结","消费降级，欧美消费者盯上平替"],["2023-08-31","2023-08-20","2023-08-17","2023-08-17","2023-08-16","2023-08-14","2023-08-07","2023-06-30","2023-06-27","2023-06-26","2023-06-21","2023-05-27","2023-05-23","2023-05-17","2023-05-15","2023-05-11","2023-05-06","2023-04-24","2023-04-18","2023-04-06","2023-03-21","2023-03-20","2023-03-17","2023-03-10","2023-02-23","2023-02-16","2023-02-13","2023-02-08","2023-02-08","2023-01-29"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th> <\/th>\n      <th>title<\/th>\n      <th>date<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"columnDefs":[{"orderable":false,"targets":0}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>

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
#> [1] 1050
```

最终获取了1050行数据，结果如下（展示前十条）：

``` r
DT::datatable(scraper_data[1:10, ]) 
```

<div class="datatables html-widget html-fill-item-overflow-hidden html-fill-item" id="htmlwidget-2" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-2">{"x":{"filter":"none","vertical":false,"data":[["1","2","3","4","5","6","7","8","9","10"],["东方甄选又爆了，入淘宝直播首秀一场卖出1亿！","狂卖170亿，今年电影为啥大爆发？","2023年夏日经济之现制咖啡&amp;茶饮市场洞察报告，线上总用户达1.51亿","详拆「茶百道」招股书：新茶饮TOP3的喜与忧","暂停4年，维密在中国“咸鱼翻身”了","上半年饮品大数据来了！咖门×美团发布《2023春夏1000+新品报告》","2023中国移动互联网半年大报告，大厂重回快速增长","从618、端午的最新数据，看到难处和机会点","MAGNA全球广告预测23年夏季版：亚洲市场将继续强劲增长","2023淘宝天猫618品牌成交排行榜出炉！"],["2023-08-31","2023-08-20","2023-08-17","2023-08-17","2023-08-16","2023-08-14","2023-08-07","2023-06-30","2023-06-27","2023-06-26"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th> <\/th>\n      <th>title<\/th>\n      <th>date<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"columnDefs":[{"orderable":false,"targets":0}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>

<img src="imgs/success.gif" style="display: block; margin: auto;" />

# 总结

最近遇到很多奇奇怪怪的网站，但思路始终是一致的，灵活运用，🉑解决90%的爬虫问题。

有的网站加载页的方式不一（比如下拉滚动加载），这会导致在网址不变的情况下爬虫无法抓取该页面所有信息，针对这样的网页可以采用还不错的谷歌插件[Web Scraper](https://www.webscraper.io/)等方法去抓取。利用R语言需补充一些其他的技术，目前只略知一二，未能熟练运用。

[^1]: 手头没有其他浏览器，不是谷歌浏览器的小伙伴自己寻找一下有无该插件吧！🏃
