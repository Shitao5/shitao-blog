---
title: 数据框批量处理行列
author: 吴诗涛
date: '2023-09-27'
slug: df-process
---


tidyverse 的生态越来越完善，一直把它当超大杯的 Excel 用。这里梳理下批量处理行和列的一些方法，主要会用到：

- `across()`
- `if_any()` 和 `if_all()`
- `starts_with()` 和 `end_with()`

另外，主要以 `\(x) foo(x)` 的方式传递匿名函数。

# 数据准备


```r
library(tidyverse)
```


```r
df <- tibble(
  x1 = 1:6,
  x2 = c(1:2, NA, 4:5, NA),
  x3 = c(5, 4, 3, NA, 0, NA),
  y = c("A", "C", "B", "B", "A", NA)
)

df
```

```
## # A tibble: 6 × 4
##      x1    x2    x3 y    
##   <int> <int> <dbl> <chr>
## 1     1     1     5 A    
## 2     2     2     4 C    
## 3     3    NA     3 B    
## 4     4     4    NA B    
## 5     5     5     0 A    
## 6     6    NA    NA <NA>
```

# 列批量处理

## 列筛选

### 全为 NA 的列


```r
# df %>% select(where(~ all(is.na(.))))
df %>% select(where(\(x) all(is.na(x))))
```

```
## # A tibble: 6 × 0
```

### 含有 NA 的列


```r
# df %>% select(where(~ any(is.na(.))))
df %>% select(where(\(x) any(is.na(x))))
```

```
## # A tibble: 6 × 3
##      x2    x3 y    
##   <int> <dbl> <chr>
## 1     1     5 A    
## 2     2     4 C    
## 3    NA     3 B    
## 4     4    NA B    
## 5     5     0 A    
## 6    NA    NA <NA>
```

也可以使用 `df %>% select(where(anyNA))`。

### 不含 NA 的列


```r
# df %>% select(where(~ all(!is.na(.))))
df %>% select(where(\(x) all(!is.na(x))))
```

```
## # A tibble: 6 × 1
##      x1
##   <int>
## 1     1
## 2     2
## 3     3
## 4     4
## 5     5
## 6     6
```

## 缺失值填充

`x` 开头的列缺失值填 `0`。


```r
df %>% mutate(across(starts_with("x"), \(x) replace_na(x, 0)))
```

```
## # A tibble: 6 × 4
##      x1    x2    x3 y    
##   <int> <int> <dbl> <chr>
## 1     1     1     5 A    
## 2     2     2     4 C    
## 3     3     0     3 B    
## 4     4     4     0 B    
## 5     5     5     0 A    
## 6     6     0     0 <NA>
```

## 列排序

`x` 开头的列全部放在 `y` 列后。


```r
# 也有 .before 参数
df %>% relocate(starts_with("x"), .after = y)
```

```
## # A tibble: 6 × 4
##   y        x1    x2    x3
##   <chr> <int> <int> <dbl>
## 1 A         1     1     5
## 2 C         2     2     4
## 3 B         3    NA     3
## 4 B         4     4    NA
## 5 A         5     5     0
## 6 <NA>      6    NA    NA
```

## 列计算

- 数值列都减 1：

  
  ```r
  df %>% mutate(across(where(is.numeric), \(x) x - 1))
  ```
  
  ```
  ## # A tibble: 6 × 4
  ##      x1    x2    x3 y    
  ##   <dbl> <dbl> <dbl> <chr>
  ## 1     0     0     4 A    
  ## 2     1     1     3 C    
  ## 3     2    NA     2 B    
  ## 4     3     3    NA B    
  ## 5     4     4    -1 A    
  ## 6     5    NA    NA <NA>
  ```

- 数值列若大于等于 5 则乘 2，小于 5 则减 1，缺失则为 -9999：

  
  ```r
  df %>% 
    mutate(across(where(is.numeric),
                  \(x) if_else(x >= 5, x * 2, x - 1, -9999)))
  ```
  
  ```
  ## # A tibble: 6 × 4
  ##      x1    x2    x3 y    
  ##   <dbl> <dbl> <dbl> <chr>
  ## 1     0     0    10 A    
  ## 2     1     1     3 C    
  ## 3     2 -9999     2 B    
  ## 4     3     3 -9999 B    
  ## 5    10    10    -1 A    
  ## 6    12 -9999 -9999 <NA>
  ```

# 行批量处理

## 行筛选

### 全为 NA 的行


```r
df %>% filter(if_all(everything(), is.na))
```

```
## # A tibble: 0 × 4
## # ℹ 4 variables: x1 <int>, x2 <int>, x3 <dbl>, y <chr>
```

### 含有 NA 的行


```r
df %>% filter(if_any(everything(), is.na))
```

```
## # A tibble: 3 × 4
##      x1    x2    x3 y    
##   <int> <int> <dbl> <chr>
## 1     3    NA     3 B    
## 2     4     4    NA B    
## 3     6    NA    NA <NA>
```

### 不含 NA 的行


```r
df %>% filter(!if_any(everything(), is.na))
```

```
## # A tibble: 3 × 4
##      x1    x2    x3 y    
##   <int> <int> <dbl> <chr>
## 1     1     1     5 A    
## 2     2     2     4 C    
## 3     5     5     0 A
```

## 行向计算

在 R 中，数据框主要以列的方向存储数据，因此行处理时需要特别注意。

比如：对 `x` 开头的行求和

- `rowSums()` + 列筛选

  
  ```r
  df %>% 
    mutate(x_sum = rowSums(across(starts_with("x")), na.rm = TRUE))
  ```
  
  ```
  ## # A tibble: 6 × 5
  ##      x1    x2    x3 y     x_sum
  ##   <int> <int> <dbl> <chr> <dbl>
  ## 1     1     1     5 A         7
  ## 2     2     2     4 C         8
  ## 3     3    NA     3 B         6
  ## 4     4     4    NA B         8
  ## 5     5     5     0 A        10
  ## 6     6    NA    NA <NA>      6
  ```

- `rowwise()` 行化处理

  
  ```r
  df %>% 
    rowwise() %>% 
    mutate(x_sum = sum(c_across(starts_with("x")), na.rm = TRUE)) %>% 
    as_tibble()  # 用于解除 rowwise()
  ```
  
  ```
  ## # A tibble: 6 × 5
  ##      x1    x2    x3 y     x_sum
  ##   <int> <int> <dbl> <chr> <dbl>
  ## 1     1     1     5 A         7
  ## 2     2     2     4 C         8
  ## 3     3    NA     3 B         6
  ## 4     4     4    NA B         8
  ## 5     5     5     0 A        10
  ## 6     6    NA    NA <NA>      6
  ```



