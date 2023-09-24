---
title: 修改 R 包源码
author: 吴诗涛
date: '2022-10-07'
slug: rpackage
categories: []
tags:
  - R
description: 临时修改源码。
image: ~
math: ~
license: ~
hidden: no
comments: yes
---




最近活跃在张敬信老师的 QQ 群答疑，遇到一个需要修改 R 包源码的问题，记录在此。

# 问题重现


```r
library(rstatix)
rstatix::cor_test(iris, Sepal.Length, Petal.Length)
```

```
#> # A tibble: 1 × 8
#>   var1         var2           cor statistic        p conf.low conf.high method 
#>   <chr>        <chr>        <dbl>     <dbl>    <dbl>    <dbl>     <dbl> <chr>  
#> 1 Sepal.Length Petal.Length  0.87      21.6 1.04e-47    0.827     0.906 Pearson
```

输出结果中 `cor` 只保留两位小数，而有时候我们需要更多位数。通过查看 rstatix 包函数源码发现：作者在[源码](https://github.com/kassambara/rstatix/blob/666db2884443286e409e7e6d85e28d48e139af83/R/cor_test.R#L189)中直接设置了保留 2 位，且没有办法通过传参修改位数。

<img src="imgs/source-code.png" width="330" style="display: block; margin: auto;" />

为此需要通过修改 `as_tidy_cor()` 函数的源码。

# 修改源码

最快捷的方法是利用 `trace()` 直接编辑源代码后保存：


```r
library(rstatix)
trace(rstatix:::as_tidy_cor, edit = T) # 修改后保存
```

```
#> Tracing function "as_tidy_cor" in package "rstatix (not-exported)"
```

```
#> [1] "as_tidy_cor"
```

<img src="imgs/update-source-code.png" width="474" style="display: block; margin: auto;" />

再次调用该函数，可以看到效果：


```r
rstatix::cor_test(iris, Sepal.Length, Petal.Length) # 输出结果变成 4 位（这里因控制台输出会变成 3 位，实际是 4 位）
```

```
#> # A tibble: 1 × 8
#>   var1         var2           cor statistic        p conf.low conf.high method 
#>   <chr>        <chr>        <dbl>     <dbl>    <dbl>    <dbl>     <dbl> <chr>  
#> 1 Sepal.Length Petal.Length  0.87      21.6 1.04e-47    0.827     0.906 Pearson
```

注意：这种方法是临时性的，仅当次使用有效。如果要永久修改，我的想法是复制整个 rstatix 包源码，修改源码后在本地调用。

# 收获

- 包开发者应该留一个保留位数的参数供使用者修改，直接保留两位很难满足需求。

- 经群友提醒，`F2` 键在 RStudio 中可以直接查看函数源代码。不过有些函数又依赖其他函数，有必要的话还是需要跑一趟 GitHub 找到问题到底在哪个函数里。
