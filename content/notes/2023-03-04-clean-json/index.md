---
title: 清洗数据框中的 JSON 列
author: shitao
date: '2023-03-04'
slug: clean-json
categories: []
tags:
  - R
description: ~
image: img.jpg
math: ~
license: ~
hidden: no
comments: yes
---



JSON 是一种轻量级、基于文本的数据交换格式，传输方便，也可以以字符串的形式保存在数据库中。一个简单的 JSON 文本长这样：

```json
{
  "语文": 89,
  "数学": 95,
  "英文": 92
}
```

JSON 由一组组「键/值对」以 `"键": 值` 的形式构成。上面的 JSON 文本表示一组成绩，其中语文 89 分，数学 95 分，英语 92 分。

JSON 并不是整洁数据，需要对 MySQL 中导出的 JSON 列进行清洗才能进行后续分析。

# 构建数据集

构建示例数据集，为张三和李四两位同学各自的三门学科成绩：


```r
library(tidyverse)

df <- tibble(name = c("张三", "李四"),
       score = c('{"语文": 89, "数学": 95, "英文": 92}',
              '{"语文": 78, "数学": 98, "科学": 87}'))
df
#> # A tibble: 2 × 2
#>   name  score                                       
#>   <chr> <chr>                                       
#> 1 张三  "{\"语文\": 89, \"数学\": 95, \"英文\": 92}"
#> 2 李四  "{\"语文\": 78, \"数学\": 98, \"科学\": 87}"
```

name 为姓名列，score 列为 JSON 形式的成绩列。接下来需要对 score 列进行清洗，使整个数据集成为「行为记录，列为变量」的整洁数据。

# 原始清洗方法

第一次遇到这样的数据时，因为时间有限，我直接以处理字符串的方法对 JSON 列进行处理：


```r
df %>% 
  separate_rows(score, sep = ", ") %>%  # 以 `, ` 为分隔分割行
  mutate(score = str_remove_all(score, "\"") %>%  # 去除键值对中的 `"`
                 str_remove_all("\\{") %>%  # 去除 JSON 周围的 `{`
                 str_remove_all("\\}")) %>%  # 去除 JSON 周围的 `}`
  separate(score, into = c("subject", "score"), sep = ": ") %>%  # 以 `: ` 为分割分裂列
  mutate(score = as.numeric(score))  # 将 score 转为数值型
#> # A tibble: 6 × 3
#>   name  subject score
#>   <chr> <chr>   <dbl>
#> 1 张三  语文       89
#> 2 张三  数学       95
#> 3 张三  英文       92
#> 4 李四  语文       78
#> 5 李四  数学       98
#> 6 李四  科学       87
```

# 改进

上面的方法比较粗糙，拓展性不强，比如说：如果键值对的键中存在 `: ` 或其他不利于分割列的字符，就容易卡住。

R 语言中有 **jsonlite** 和 **rjson** 类似的包用于读取 JSON 文本，但一次只能读取一条，读取后会形成多行数据框。由于 JSON 列有多行 JSON 文本，不能直接通过这些包读取，这是当时卡住我的地方。

今天想到可以通过嵌套数据框，先将 JSON 列中的每一个 JSON 文本嵌套，而后通过 `jsonlite::fromJSON()` 分别读取单个 JSON 文本，形成嵌套列，最后展开嵌套框列即可。

具体操作如下：

1. 以姓名分组，嵌套成绩列：

    
    ```r
    df %>% 
      group_by(name) %>% 
      nest(data = score) # 以姓名分组，嵌套成绩列
    #> # A tibble: 2 × 2
    #> # Groups:   name [2]
    #>   name  data            
    #>   <chr> <list>          
    #> 1 张三  <tibble [1 × 1]>
    #> 2 李四  <tibble [1 × 1]>
    ```

2. 读取嵌套的 JSON 文本：

    
    ```r
    df %>% 
      group_by(name) %>% 
      nest(data = score) %>% # 以姓名分组，嵌套成绩列
      rowwise() %>% 
      mutate(data = list(jsonlite::fromJSON(data[[1]]))) # 读取嵌套的 JSON 文本
    #> # A tibble: 2 × 2
    #> # Rowwise:  name
    #>   name  data            
    #>   <chr> <list>          
    #> 1 张三  <named list [3]>
    #> 2 李四  <named list [3]>
    ```

3. 将嵌套列纵向展开：


```r
df %>% 
  group_by(name) %>% 
  nest(data = score) %>% # 以姓名分组，嵌套成绩列
  rowwise() %>% 
  mutate(data = list(jsonlite::fromJSON(data[[1]]))) %>%  # 读取嵌套的 JSON 文本
  unnest_longer(data) # 将嵌套列纵向展开
#> # A tibble: 6 × 3
#>   name   data data_id
#>   <chr> <int> <chr>  
#> 1 张三     89 语文   
#> 2 张三     95 数学   
#> 3 张三     92 英文   
#> 4 李四     78 语文   
#> 5 李四     98 数学   
#> 6 李四     87 科学
```

调整一下列的位置即可得到和之前一样的结果。可以观察到的是：由于使用 `jsonlite::fromJSON()` 读取，并不需要手动将成绩修改为数值型。

# 再多做一步

上面演示用到的 JSON 只有一层，即「学科-成绩」。JSON 的层级可以很深，比如「班级-学生-学科-成绩」。深层级的 JSON 意味着数据前期加工没有到位，还有信息没有以结构化提出去。

如果遇上复杂层级的JSON，用文本处理的方法比较复杂，所幸的是改进后的方法稍作修改依然可以胜任。因为工作中这种情况不曾遇见，不开展细讲，把方法贴在这里，以备日后所需。

## 数据集


```r
df2 <- tibble(
  id = 1:2,
  score = c(
    '{"class":{"class_name":"Class 1","students":[{"name":"Alice","subjects":[{"subject_name":"Math","score":90},{"subject_name":"English","score":85},{"subject_name":"Science","score":92}]},{"name":"Bob","subjects":[{"subject_name":"Math","score":95},{"subject_name":"English","score":80},{"subject_name":"Science","score":88}]}]}}',
    '{"class":{"class_name":"Class 2","students":[{"name":"Charlie","subjects":[{"subject_name":"Math","score":85},{"subject_name":"English","score":80},{"subject_name":"Science","score":90}]},{"name":"David","subjects":[{"subject_name":"Math","score":92},{"subject_name":"English","score":87},{"subject_name":"Science","score":94}]}]}}'))

df2
#> # A tibble: 2 × 2
#>      id score                                                                   
#>   <int> <chr>                                                                   
#> 1     1 "{\"class\":{\"class_name\":\"Class 1\",\"students\":[{\"name\":\"Alice…
#> 2     2 "{\"class\":{\"class_name\":\"Class 2\",\"students\":[{\"name\":\"Charl…
```

## 清洗

1. 嵌套：

    
    ```r
    df2_1 <- df2 %>% 
      group_by(id) %>% 
      nest(data = c(score)) %>% 
      rowwise() %>% 
      mutate(data = jsonlite::fromJSON(data[[1]], flatten = TRUE)) %>% 
      unnest_longer(data)
    df2_1
    #> # A tibble: 4 × 3
    #>      id data         data_id   
    #>   <int> <named list> <chr>     
    #> 1     1 <chr [1]>    class_name
    #> 2     1 <df [2 × 2]> students  
    #> 3     2 <chr [1]>    class_name
    #> 4     2 <df [2 × 2]> students
    ```

2. 根据 JSON 的结构，需多做一步「长变宽」：

    
    ```r
    df2_2 <- df2_1 %>% 
      pivot_wider(id_cols = 1,
                  names_from = data_id,
                  values_from = data)
    df2_2
    #> # A tibble: 2 × 3
    #>      id class_name   students    
    #>   <int> <named list> <named list>
    #> 1     1 <chr [1]>    <df [2 × 2]>
    #> 2     2 <chr [1]>    <df [2 × 2]>
    ```

3. 继续开展：

    
    ```r
    df2_2 %>% 
      unnest(class_name) %>% 
      unnest(students) %>% 
      unnest(subjects)
    #> # A tibble: 12 × 5
    #>       id class_name name    subject_name score
    #>    <int> <chr>      <chr>   <chr>        <int>
    #>  1     1 Class 1    Alice   Math            90
    #>  2     1 Class 1    Alice   English         85
    #>  3     1 Class 1    Alice   Science         92
    #>  4     1 Class 1    Bob     Math            95
    #>  5     1 Class 1    Bob     English         80
    #>  6     1 Class 1    Bob     Science         88
    #>  7     2 Class 2    Charlie Math            85
    #>  8     2 Class 2    Charlie English         80
    #>  9     2 Class 2    Charlie Science         90
    #> 10     2 Class 2    David   Math            92
    #> 11     2 Class 2    David   English         87
    #> 12     2 Class 2    David   Science         94
    ```

得到整洁数据，后续操作就方便了，跟着想法造就好。
