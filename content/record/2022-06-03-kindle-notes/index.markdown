---
title: Kindle笔记整理
author: 吴诗涛
date: '2022-06-03'
slug: kindle-notes
categories:
  - 技术贴
  - R
tags:
  - Kindle
  - Tidyverse
output:
   bookdown::html_document2:
     fig_caption: yes
bibliography: references.bib
link-citations: yes
---

Kindle要停运了，对于用kindle看电子书的小伙伴影响估计不小。之前买过一年亚马逊书店会员，书籍的高亮内容可以导出到邮箱，还算方便。后来自己通过calibre往kindle里边导入电子书，没有再购买过会员，现在都是飞行模式。

自己导入的电子书，不支持自动导出笔记，Kindle会把划线的笔记全部记录在`kindle\documents\My Clippings.txt`这个文件中。由于它不区分书籍，只是不断地把划线的内容添加到文件最后，相当于是[增量备份](https://baike.baidu.com/item/%E5%A2%9E%E9%87%8F%E5%A4%87%E4%BB%BD/4566112)，导致它非常杂乱[^1]。对于喜欢把书摘按书籍分类的小伙伴，有大活要干。

<div class="figure" style="text-align: center">

<img src="images/my-clipping.png" alt="My Clipping" width="80%" />
<p class="caption">
Figure 1: My Clipping
</p>

</div>

作为致力于给自己贴上*Data Scientist*标签的俺，用R写了个脚本，目标是将`My Clippings.txt`文件中的所有笔记根据书名和笔记在书中的位置先后进行整理，同时剔除**重复笔记**[^2]，最后导出每本书的笔记文件。

数据处理的流程如下。

# 加载包

``` r
library(tidyverse)
library(lubridate)
```

**tidyverse**是我在数据整理中绕不开的包，每用一次，都要感谢一下[Hadly Wickham](https://hadley.nz/)；**lubridate**包用于处理时间数据。

# 导入`My Clippings.txt`文件

``` r
text <- readLines(con = "My Clippings.txt")
```

按行读取文本文件。

# 数据操作

## 数据皆可`tibble()`

**tibble**是**tidyverse**版本的数据框，优点包括：

-   方便打印预览
-   标题可以是字符开头
-   ……

``` r
text %>% as_tibble()
```

    ## # A tibble: 4,650 × 1
    ##    value                                                                        
    ##    <chr>                                                                        
    ##  1 "爱的艺术 (〔美〕弗洛姆)"                                                    
    ##  2 "- 您在第 2 页（位置 #22-25）的标注 | 添加于 2022年1月17日星期一 下午11:04:0…
    ##  3 ""                                                                           
    ##  4 "爱不是一种只需投入身心就可获得的感情，如果不努力发展自己的全部人格并以此达… 
    ##  5 "=========="                                                                 
    ##  6 "﻿爱的艺术 (〔美〕弗洛姆)"                                                    
    ##  7 "- 您在第 3 页（位置 #37-37）的标注 | 添加于 2022年1月17日星期一 下午11:05:2…
    ##  8 ""                                                                           
    ##  9 "爱情不是一种与人的成熟程度无关，只需要投入身心的感情"                       
    ## 10 "=========="                                                                 
    ## # … with 4,640 more rows

## 识别“笔记块”

转为**tibble**后可以看到每5行是一条完整记录，且称呼为“**笔记块**”吧。

“**笔记块**”中依次分别是：

1.  书名
2.  笔记信息（位置、时间）
3.  空行
4.  笔记内容
5.  分割线

前4条各自都不同，但是分割线都是一样的，所以从分割线切入，添加新列，每条分割线所在行填充唯一的值[^3]，分割线以上直至新的分割线中间行填充分割线的值。

``` r
text2 <- text %>% 
  as_tibble() %>% 
  mutate(group = ifelse(value == "==========",
                        row_number(value), NA)) %>% 
  fill(group, .direction = "up")
text2
```

    ## # A tibble: 4,650 × 2
    ##    value                                                                   group
    ##    <chr>                                                                   <int>
    ##  1 "爱的艺术 (〔美〕弗洛姆)"                                                2004
    ##  2 "- 您在第 2 页（位置 #22-25）的标注 | 添加于 2022年1月17日星期一 下午1…  2004
    ##  3 ""                                                                       2004
    ##  4 "爱不是一种只需投入身心就可获得的感情，如果不努力发展自己的全部人格并…   2004
    ##  5 "=========="                                                             2004
    ##  6 "﻿爱的艺术 (〔美〕弗洛姆)"                                                2005
    ##  7 "- 您在第 3 页（位置 #37-37）的标注 | 添加于 2022年1月17日星期一 下午1…  2005
    ##  8 ""                                                                       2005
    ##  9 "爱情不是一种与人的成熟程度无关，只需要投入身心的感情"                   2005
    ## 10 "=========="                                                             2005
    ## # … with 4,640 more rows

## 向整洁数据进军

整洁数据([Wickham 2014](#ref-tidy-data))是数据清洗的目标，整洁数据的特点是：

-   每个**变量**构成一列
-   每个**观测**构成一行
-   每个观测的每个变量*值*构成一个单元格

接下来添加**type**列，然后通过`pivot_wider()`拉宽数据框。

``` r
text3 <- text2 %>% 
  add_column(type = rep(
    c("title", "information", "empty", "text", "line"),
    nrow(text2) / 5)) %>% 
  pivot_wider(names_from = "type",
              values_from = "value")
text3
```

    ## # A tibble: 930 × 6
    ##    group title                   information                   empty text  line 
    ##    <int> <chr>                   <chr>                         <chr> <chr> <chr>
    ##  1  2004 爱的艺术 (〔美〕弗洛姆) - 您在第 2 页（位置 #22-25）… ""    爱不… ====…
    ##  2  2005 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 3 页（位置 #37-37）… ""    爱情… ====…
    ##  3  2006 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 3 页（位置 #37-37）… ""    爱情… ====…
    ##  4  2007 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 3 页（位置 #37-40）… ""    这本… ====…
    ##  5  2008 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 6 页（位置 #86-86）… ""    大多… ====…
    ##  6  2009 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 6 页（位置 #90-91）… ""    事实… ====…
    ##  7  2010 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 8 页（位置 #109-110… ""    事实… ====…
    ##  8  2011 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 8 页（位置 #109-110… ""    人与… ====…
    ##  9  2012 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 8 页（位置 #109-110… ""    人与… ====…
    ## 10  2013 ﻿爱的艺术 (〔美〕弗洛姆) - 您在第 8 页（位置 #118-119… ""    人们… ====…
    ## # … with 920 more rows

通过正则表达式从**information**中提取日期、时间、笔记起始位置。过程中发现kindle的日期是不是24小时制的，分上下午。所以也利用正则提取了是否为上下午的信息：如果是下午，则时间都加上12小时；如果不是下午却又是上午12时（凌晨0点），那就减12小时；其余保持不变。

根据书名分组，并按照笔记起始位置排序，重复笔记只保留最后一次修改。中间用到了数据库的合并操作。

``` r
delete <- text3 %>% 
  mutate(date = str_extract(information,
                            pattern = "\\d*年\\d*月\\d*日"),
         time = str_extract(information,
                            pattern = "\\d*:\\d*:\\d*"),
         datetime = ymd_hms(paste(date, time)),
         afternoon = ifelse(str_detect(information, "下午"),
                            1, 0),
         datetime = case_when(
           afternoon == 1 ~ datetime + hours(12),
           afternoon == 0 & hour(datetime) == 12 ~ datetime - hours(12), 
           TRUE ~ datetime
         ),
         location = str_extract(information,
                                pattern = "(?<=#)\\d*(?=\\-)") %>% 
           as.numeric()) %>% 
  group_by(title) %>%
  arrange(location, datetime, .by_group = TRUE) %>%
  filter((location == lead(location) &
            substr(text, 1, 5) == substr(lead(text), 1, 5)))

text4 <- text3 %>% 
  mutate(date = str_extract(information,
                            pattern = "\\d*年\\d*月\\d*日"),
         time = str_extract(information,
                            pattern = "\\d*:\\d*:\\d*"),
         datetime = ymd_hms(paste(date, time)),
         afternoon = ifelse(str_detect(information, "下午"),
                            1, 0),
         datetime = case_when(
           afternoon == 1 ~ datetime + hours(12),
           afternoon == 0 & hour(datetime) == 12 ~ datetime - hours(12), 
           TRUE ~ datetime
         ),
         location = str_extract(information,
                                pattern = "(?<=#)\\d*(?=\\-)") %>% 
           as.numeric()) %>% 
  group_by(title) %>%
  arrange(location, datetime, .by_group = TRUE) %>% 
  anti_join(delete) %>% 
  ungroup() %>% 
  mutate(id = row_number(),
         line = str_replace_all(line, "=", "-"))
text4
```

    ## # A tibble: 718 × 12
    ##    group title    information  empty text  line  date  time  datetime           
    ##    <int> <chr>    <chr>        <chr> <chr> <chr> <chr> <chr> <dttm>             
    ##  1  2706 《公正:… - 您在位置 … ""    如果… ----… 2022… 12:3… 2022-04-24 00:35:25
    ##  2  2707 《公正:… - 您在位置 … ""    政治… ----… 2022… 12:4… 2022-04-24 00:42:56
    ##  3  2708 《公正:… - 您在位置 … ""    现代… ----… 2022… 12:4… 2022-04-24 00:44:32
    ##  4  2709 《公正:… - 您在位置 … ""    尽管… ----… 2022… 12:4… 2022-04-24 00:46:37
    ##  5  2719 《公正:… - 您在位置 … ""    一个… ----… 2022… 12:1… 2022-05-02 00:17:50
    ##  6  2720 《公正:… - 您在位置 … ""    如果… ----… 2022… 12:2… 2022-05-02 00:21:52
    ##  7  2721 《公正:… - 您在位置 … ""    要看… ----… 2022… 10:5… 2022-05-02 22:56:41
    ##  8  2722 《公正:… - 您在位置 … ""    我们… ----… 2022… 11:0… 2022-05-02 23:07:13
    ##  9  2723 《公正:… - 您在位置 … ""    当遇… ----… 2022… 12:5… 2022-05-04 00:50:59
    ## 10  2724 《公正:… - 您在位置 … ""    道德… ----… 2022… 12:5… 2022-05-04 00:52:27
    ## # … with 708 more rows, and 3 more variables: afternoon <dbl>, location <dbl>,
    ## #   id <int>

# 写出到文件

在**text4**数据框中存放了所有的笔记，现在要按照书名分别写出到对应的文本文件中，这里选择的是[Markdown](https://markdown.com.cn/basic-syntax/)文件，用`write.table()`写出一列的数据框就可以。

这里遇到的难题是：目前**text4**处于整洁数据的形态，如何在按照书名分组的情况下，将其整理成一列的数据框，且**笔记块**的信息对应。

因为Markdown语法需要空一行才能实现换行，所以写出去的每个新笔记块需要由6个部分组成：

1.  时间
2.  空行（用于换行）
3.  笔记内容
4.  空行（用于换行）
5.  分割线
6.  空行（用于换行）

后来想到了类似Excel辅助列的方法。在数据框行合并的同时，给每个笔记块中的行都添加id，其中时间为整数，然后下面的每一行id都加0.1，这样就可以用排序达成目标，效果是这样的：

    ## # A tibble: 4,308 × 2
    ##    value                                                                     id
    ##    <chr>                                                                  <dbl>
    ##  1 "2022-04-24 00:35:25"                                                    1  
    ##  2 ""                                                                       1.1
    ##  3 "如果你仔细观察价格欺诈的争论，你就会发现那些维护和反对价格欺诈的论证…   1.2
    ##  4 ""                                                                       1.3
    ##  5 "----------"                                                             1.4
    ##  6 ""                                                                       1.5
    ##  7 "2022-04-24 00:42:56"                                                    2  
    ##  8 ""                                                                       2.1
    ##  9 "政治哲学中的一个重要问题：一个公正的社会应当努力推进其公民的德性吗？…   2.2
    ## 10 ""                                                                       2.3
    ## # … with 4,298 more rows

根据书名分组的任务，原本打算用循环了
~~学艺不精~~，后来在苦苦寻觅下找到了`group_split()`函数，柳暗花明又一村。这是个生命周期还处于实验阶段的函数，反正先拿来用了。

``` r
dfs <- text4 %>% 
  mutate(value = as.character(datetime)) %>% 
  select(title, value, id) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$empty,
    id = text4$id + .1)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$text,
    id = text4$id + .2)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$empty,
    id = text4$id + .3)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$line,
    id = text4$id + .4)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$empty,
    id = text4$id + .5)) %>% 
  arrange(id) %>% 
  select(title, value) %>% 
  group_split(title, .keep = FALSE) 
```

最后得到的是一个列表，列表中是以书名分组的笔记数据框，一本书一个数据框，将每一个数据框按书名写出就完成了。

这步我会，请出懒猫**purrr**:

<img src="images/logo.png" width="20%" style="display: block; margin: auto;" />

先从**text4**中提取出书名**index**，并形成文件名**files**。我的kindle书名比较乱，有的带了特殊字符会导致写入报错，所以用正则做了一定的调整。我以后肯定重命名好电子书再导入kindle~~才怪，看心情~~。

``` r
index <- text4 %>% 
  distinct(title) %>% 
  mutate(title = str_extract(title,
                             pattern = "[^\\s]+"),
         title = str_replace_all(title, ":", "_"),
         title = str_replace_all(title, "\\?", "_"))
tail(index, 10)
```

    ## # A tibble: 10 × 1
    ##    title                                                                        
    ##    <chr>                                                                        
    ##  1 认识世界：古代与中世纪哲学【陈嘉映、刘擎、许知远推荐，“现象级”公共哲学家、畅…
    ##  2 社会学的想象力                                                               
    ##  3 思维的囚徒（提炼意义疗法七大原则，用意义拯救现代社会的心理荒芜，发现工作的意…
    ##  4 死无葬身之地（收录诺贝尔文学奖得主萨特两篇知名戏剧；著名翻译家李恒基、沈志明…
    ##  5 无尽的探索—卡尔·波普尔自传                                                   
    ##  6 西方现代思想讲义                                                             
    ##  7 遥远的救世主：根据本书改编的电视剧《天道》正在全国掀起极大反响               
    ##  8 影响力（经典版）                                                             
    ##  9 圆圈正义                                                                     
    ## 10 正义论

利用字符串函数`str_c()`形成文件名**files**。这里我新建了一个**files**文件夹，把笔记导入到里边，方便打包带走。

``` r
files <- str_c("files/", index$title, ".md")
tail(files, 10)
```

    ##  [1] "files/认识世界：古代与中世纪哲学【陈嘉映、刘擎、许知远推荐，“现象级”公共哲学家、畅销作家普莱希特，写给所有关心世界与自己的人，让哲学回归生活，带你清醒看世界】.md"
    ##  [2] "files/社会学的想象力.md"                                                                                                                                          
    ##  [3] "files/思维的囚徒（提炼意义疗法七大原则，用意义拯救现代社会的心理荒芜，发现工作的意义。）.md"                                                                      
    ##  [4] "files/死无葬身之地（收录诺贝尔文学奖得主萨特两篇知名戏剧；著名翻译家李恒基、沈志明联袂翻译；人民文学出版社倾力打造）.md"                                          
    ##  [5] "files/无尽的探索—卡尔·波普尔自传.md"                                                                                                                              
    ##  [6] "files/西方现代思想讲义.md"                                                                                                                                        
    ##  [7] "files/遥远的救世主：根据本书改编的电视剧《天道》正在全国掀起极大反响.md"                                                                                          
    ##  [8] "files/影响力（经典版）.md"                                                                                                                                        
    ##  [9] "files/圆圈正义.md"                                                                                                                                                
    ## [10] "files/正义论.md"

接下来用**purrr**中的`walk2()`函数进行批量写出。

``` r
walk2(dfs, files, write.table,
      row.names = FALSE,
      quote = FALSE,
      col.names = FALSE)
```

# 结果

<div class="figure" style="text-align: center">

<img src="images/result.png" alt="写出结果" width="80%" />
<p class="caption">
Figure 2: 写出结果
</p>

</div>

<div class="figure" style="text-align: center">

<img src="images/result1.png" alt="文件内容" width="80%" />
<p class="caption">
Figure 3: 文件内容
</p>

</div>

~~要手动改下文件名~~美美收工咯！

全部代码如下：

``` r
text <- readLines(con = "My Clippings.txt")

library(tidyverse)
library(lubridate)

# 文本变成数据框
text2 <- text %>% 
  as_tibble() %>% 
  mutate(group = ifelse(value == "==========",
                        row_number(value), NA)) %>% 
  fill(group, .direction = "up")

# 数据框清洗，提取标题、信息和文本
text3 <- text2 %>% 
  add_column(type = rep(
    c("title", "information", "empty", "text", "line"),
    nrow(text2) / 5)) %>% 
  pivot_wider(names_from = "type",
              values_from = "value")

# 从信息中提取日期、时间、位置并排序，重复笔记只保留最后一次修改
delete <- text3 %>% 
  mutate(date = str_extract(information,
                            pattern = "\\d*年\\d*月\\d*日"),
         time = str_extract(information,
                            pattern = "\\d*:\\d*:\\d*"),
         datetime = ymd_hms(paste(date, time)),
         afternoon = ifelse(str_detect(information, "下午"),
                            1, 0),
         datetime = case_when(
           afternoon == 1 ~ datetime + hours(12),
           afternoon == 0 & hour(datetime) == 12 ~ datetime - hours(12), 
           TRUE ~ datetime
         ),
         location = str_extract(information,
                                pattern = "(?<=#)\\d*(?=\\-)") %>% 
           as.numeric()) %>% 
  group_by(title) %>%
  arrange(location, datetime, .by_group = TRUE) %>%
  filter((location == lead(location) &
            substr(text, 1, 5) == substr(lead(text), 1, 5)))

text4 <- text3 %>% 
  mutate(date = str_extract(information,
                            pattern = "\\d*年\\d*月\\d*日"),
         time = str_extract(information,
                            pattern = "\\d*:\\d*:\\d*"),
         datetime = ymd_hms(paste(date, time)),
         afternoon = ifelse(str_detect(information, "下午"),
                            1, 0),
         datetime = case_when(
           afternoon == 1 ~ datetime + hours(12),
           afternoon == 0 & hour(datetime) == 12 ~ datetime - hours(12), 
           TRUE ~ datetime
         ),
         location = str_extract(information,
                                pattern = "(?<=#)\\d*(?=\\-)") %>% 
           as.numeric()) %>% 
  group_by(title) %>%
  arrange(location, datetime, .by_group = TRUE) %>% 
  anti_join(delete) %>% 
  ungroup() %>% 
  mutate(id = row_number(),
         line = str_replace_all(line, "=", "-"))

# 写出到文件

dfs <- text4 %>% 
  mutate(value = as.character(datetime)) %>% 
  select(title, value, id) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$empty,
    id = text4$id + .1)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$text,
    id = text4$id + .2)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$empty,
    id = text4$id + .3)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$line,
    id = text4$id + .4)) %>% 
  rbind(tibble(
    title = text4$title,
    value = text4$empty,
    id = text4$id + .5)) %>% 
  arrange(id) %>% 
  select(title, value) %>% 
  group_split(title, .keep = FALSE) 

index <- text4 %>% 
  distinct(title) %>% 
  mutate(title = str_extract(title,
                             pattern = "[^\\s]+"),
         title = str_replace_all(title, ":", "_"),
         title = str_replace_all(title, "\\?", "_"))

files <- str_c("files/", index$title, ".md")

walk2(dfs, files, write.table,
      row.names = FALSE,
      quote = FALSE,
      col.names = FALSE)
```

<div id="refs" class="references csl-bib-body hanging-indent">

<div id="ref-tidy-data" class="csl-entry">

Wickham, Hadley. 2014. “Tidy Data.” *The Journal of Statistical Software* 59. <http://www.jstatsoft.org/v59/i10/>.

</div>

</div>

[^1]: 比如：笔记的位置是根据做笔记的时间而不是笔记在书中的位置来的。

[^2]: 把笔记起始位置相同且开头5个字一样的笔记认定为重复笔记，只保留最新的那一条。

[^3]: 这是经过排序的行号，不存在重复。
