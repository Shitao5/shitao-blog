---
title: Shiny 中使用 tidyverse 的一个注意点
author: 吴诗涛
date: '2024-03-31'
slug: shiny-tidyverse
tags: [R]
---



最近在搭建 Shiny Dashboard 时发现一个需要注意的点：Shiny 的 `selectInput()` 返回值是字符串类型，而 tidyverse 由于使用了 [tidy evaluation](https://dplyr.tidyverse.org/articles/programming.html)，不接受字符串类型的参数，因此在定义函数时需要提前做好输入参数为字符串的准备。

解决方法根据 tidy evaluation 的两种类型而异。


```r
library(tidyverse)
```

针对使用 [Tidy selection](https://dplyr.tidyverse.org/articles/programming.html#tidy-selection) 的函数（如 `select()`），参数中如要传入字符串，可以使用 `any_of()` 或者 `all_of()`，具体可以在 dplyr 的[文档](https://dplyr.tidyverse.org/articles/programming.html#indirection-1)中看到：


```r
select_col = function(data, select_col_chr) {
  data %>% select(all_of(select_col_chr))
}

as_tibble(iris) %>% select_col(c("Species", "Sepal.Length"))
```

```
## # A tibble: 150 × 2
##   Species Sepal.Length
##   <fct>          <dbl>
## 1 setosa           5.1
## 2 setosa           4.9
## 3 setosa           4.7
## 4 setosa           4.6
## 5 setosa           5  
## # ℹ 145 more rows
```

针对使用 [Tidy selection](https://dplyr.tidyverse.org/articles/programming.html#tidy-selection) 的函数（如 `group_by()`），参数中如要传入字符串，可以使用 `pick()` 和 `{{ }}` ，具体可查看 rlang 的[文档](https://rlang.r-lib.org/reference/topic-data-mask-programming.html)：


```r
group_data = function(data, group_var_chr) {
  data %>% group_by(pick({{ group_var_chr }}))
}
```


```r
group_data(iris, c("Species", "Sepal.Length"))
```

```
## # A tibble: 150 × 5
## # Groups:   Species, Sepal.Length [57]
##   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
##          <dbl>       <dbl>        <dbl>       <dbl> <fct>  
## 1          5.1         3.5          1.4         0.2 setosa 
## 2          4.9         3            1.4         0.2 setosa 
## 3          4.7         3.2          1.3         0.2 setosa 
## 4          4.6         3.1          1.5         0.2 setosa 
## 5          5           3.6          1.4         0.2 setosa 
## # ℹ 145 more rows
```
