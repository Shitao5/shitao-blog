---
title: 识别连续数值
author: 吴诗涛
date: '2023-09-30'
slug: continous
tags: [R]
---

# 连续问题（前后差 1）

统计用户连续登录的天数、识别企业连续大额开票等问题，都包含了识别连续数值的操作。问题的关键在于为不同的连续区间分配不同的组号。

知乎上有关于连续登录天数的[回答](https://zhuanlan.zhihu.com/p/49285570)，识别连续数值分三步：

1. 对统计连续值的列（`x`）降序排序；
1. 生成行号列 `rn`；
1. 生成新列：`max_diff = max(x) - rn`；
1. 生成组号：`group = x - max_diff`。

最后生成的 `group` 就是为不同连续区间分配的不同组号，`group` 相同的 `x` 即为连续区间。

## 单用户示例


```r
library(tidyverse)
```


```r
# 单个用户示例数据
set.seed(0930)
df_single = tibble(
  x = c(1:2, 4, 6, 8:10),   # 需要识别连续的列
  y = sample.int(length(x)) # 随机数据，用于模拟真实情况
)

df_single %>% 
  arrange(-x) %>% 
  mutate(
    rn = row_number(),
    max_diff = max(x) - rn,
    group = x - max_diff
  ) %>% 
  arrange(x)  # 恢复示例数据的行序
```

```
## # A tibble: 7 × 5
##       x     y    rn max_diff group
##   <dbl> <int> <int>    <dbl> <dbl>
## 1     1     3     7        3    -2
## 2     2     1     6        4    -2
## 3     4     7     5        5    -1
## 4     6     2     4        6     0
## 5     8     6     3        7     1
## 6     9     5     2        8     1
## 7    10     4     1        9     1
```

`group` 列中组内数量大于 1 的即为存在连续登录的组别；组内个数为 1 即为不连续登录。

为代码简洁，将识别连续数值的操作包装为函数 `identify_continuous()`，该函数输入需要识别连续数值的向量名，返回对应组号向量 `group`：


```r
identify_continuous = function(vec_to_identify) {
  x_sorted = sort(vec_to_identify, decreasing = TRUE)
  rn = seq_len(length(vec_to_identify))
  group = x_sorted - (max(vec_to_identify) - rn)
  names(group) = as.character(x_sorted)
  unname(group[as.character(vec_to_identify)])
}

# 用单个用户示例数据测试 identify_continuous
df_single %>% mutate(group = identify_continuous(x))
```

```
## # A tibble: 7 × 3
##       x     y group
##   <dbl> <int> <dbl>
## 1     1     3    -2
## 2     2     1    -2
## 3     4     7    -1
## 4     6     2     0
## 5     8     6     1
## 6     9     5     1
## 7    10     4     1
```

`identify_continuous()` 处理结果与前面一致。

## 多用户示例

对于多用户，在单个用户的基础上对用户添加分组即可：


```r
# 多用户示例数据
set.seed(0930)
df_multi = tibble(
  user = rep(c("A", "B"), each = 7),
  x = c(1:2, 4, 6, 8:10,
        1:3, 5:7, 9),
  y = sample.int(length(x))
)

df_multi %>% 
  mutate(.by = user,
         group = identify_continuous(x)) %>%   # 识别每个用户连续区间
  # 做一些后续的统计
  summarise(.by = c(user, group),
            continuous_n = n(),       # 统计每个用户每次连续登录天数
            sum_y = sum(y)) %>%       # 统计每个用户每次连续登录的 y 之和
  filter(continuous_n > 1)            # 筛选连续区间
```

```
## # A tibble: 4 × 4
##   user  group continuous_n sum_y
##   <chr> <dbl>        <int> <int>
## 1 A        -2            2    10
## 2 A         1            3    20
## 3 B        -1            3    26
## 4 B         0            3    23
```

# 连续问题（前后差 n）

如果将前后差为 `\(n\)` 定义为连续，解决的方法是将行号列 `rn` 对应乘以 `\(n\)` 即可。

## 单用户示例

以 `$n = 2$` 为例，问题变成识别连续的偶数。


```r
# 连续偶数识别
df_single2 = df_single %>% mutate(x = x * 2)

df_single2 %>% 
  arrange(-x) %>% 
  mutate(
    rn = row_number() * 2,   # rn 对应乘以 2
    max_diff = max(x) - rn,
    group = x - max_diff
  ) %>% 
  arrange(x)  # 恢复示例数据的行序
```

```
## # A tibble: 7 × 5
##       x     y    rn max_diff group
##   <dbl> <int> <dbl>    <dbl> <dbl>
## 1     2     3    14        6    -4
## 2     4     1    12        8    -4
## 3     8     7    10       10    -2
## 4    12     2     8       12     0
## 5    16     6     6       14     2
## 6    18     5     4       16     2
## 7    20     4     2       18     2
```

优化函数 `identify_continuous()`，添加参数 `n`，用于控制连续前后差：


```r
identify_continuous = function(vec_to_identify, n = 1) {
  x_sorted = sort(vec_to_identify, decreasing = TRUE)
  rn = seq(from = 1, by = n, length.out = length(vec_to_identify))
  group =  x_sorted - (max(vec_to_identify) - rn)
  names(group) = as.character(x_sorted)
  unname(group[as.character(vec_to_identify)])
}

# 用单个用户示例数据测试 identify_continuous
df_single2 %>% mutate(group = identify_continuous(x, 2))
```

```
## # A tibble: 7 × 3
##       x     y group
##   <dbl> <int> <dbl>
## 1     2     3    -5
## 2     4     1    -5
## 3     8     7    -3
## 4    12     2    -1
## 5    16     6     1
## 6    18     5     1
## 7    20     4     1
```

## 多用户示例

同理，对多个用户，只需要添加分组，以 `$n = 3$` 为例：


```r
# 多用户示例数据
df_multi2 = df_multi %>% mutate(x = x * 3)

df_multi2 %>% 
  mutate(.by = user,
         group = identify_continuous(x, 3)) %>%   # 识别每个用户连续
  summarise(.by = c(user, group),
            continuous_n = n(),       # 统计每个用户每次连续登录天数
            sum_y = sum(y)) %>%       # 统计每个用户每次连续登录的 y 之和
  filter(continuous_n > 1)            # 筛选连续区间
```

```
## # A tibble: 4 × 4
##   user  group continuous_n sum_y
##   <chr> <dbl>        <int> <int>
## 1 A        -8            2    10
## 2 A         1            3    20
## 3 B        -5            3    26
## 4 B        -2            3    23
```
