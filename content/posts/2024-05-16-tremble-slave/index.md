---
title: 颤抖吧！打工人
author: 吴诗涛
date: '2024-05-16'
slug: tremble-slave
---

<link href="{{< blogdown/postref >}}index_files/htmltools-fill/fill.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/htmlwidgets/htmlwidgets.js"></script>
<link href="{{< blogdown/postref >}}index_files/datatables-css/datatables-crosstalk.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/datatables-binding/datatables.js"></script>
<script src="{{< blogdown/postref >}}index_files/jquery/jquery-3.6.0.min.js"></script>
<link href="{{< blogdown/postref >}}index_files/dt-core/css/jquery.dataTables.min.css" rel="stylesheet" />
<link href="{{< blogdown/postref >}}index_files/dt-core/css/jquery.dataTables.extra.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/dt-core/js/jquery.dataTables.min.js"></script>
<link href="{{< blogdown/postref >}}index_files/crosstalk/css/crosstalk.min.css" rel="stylesheet" />
<script src="{{< blogdown/postref >}}index_files/crosstalk/js/crosstalk.min.js"></script>

钉钉导出的考勤时间表，每个员工一行数据，每天所有的打卡时间为一列。根据需求，计算**纯工时**：去除午休（12:00-13:30）和晚餐（如有，18:00-19:00）的工作时间。

``` r
library(tidyverse)
```

``` r
dt = readxl::read_xlsx("test.xlsx")
names(dt) = c("姓名", paste0("date", 1:30))
DT::datatable(dt |> select(1, 16:20))
```

<div class="datatables html-widget html-fill-item" id="htmlwidget-1" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-1">{"x":{"filter":"none","vertical":false,"data":[["1","2"],["甲","乙"],["09:00  \r\n19:16  \r\n20:30","08:46  \r\n20:34"],["09:03  \r\n20:34","08:40  \r\n20:38"],["08:59  \r\n18:54","08:43  \r\n18:07"],["09:04  \r\n20:39","08:42  \r\n20:59"],["09:03  \r\n19:32","08:47  \r\n18:08"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th> <\/th>\n      <th>姓名<\/th>\n      <th>date15<\/th>\n      <th>date16<\/th>\n      <th>date17<\/th>\n      <th>date18<\/th>\n      <th>date19<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"columnDefs":[{"orderable":false,"targets":0},{"name":" ","targets":0},{"name":"姓名","targets":1},{"name":"date15","targets":2},{"name":"date16","targets":3},{"name":"date17","targets":4},{"name":"date18","targets":5},{"name":"date19","targets":6}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>

请出 ChatGPT-4o 「帮助」打工人计算工时（单位：小时）[^1]：

``` r
# 创建一个函数来计算每日出勤时间
calculate_attendance_time <- function(times) {
  
  # 将日期数据转为数值秒数
  second = function(x) {
    hm(x) |> as.numeric()
  }
  
  times = second(times)
  noon = second("12:00")
  afternoon_start = second("13:30")
  evening_start = second("18:00")
  evening_end = second("19:00")
  latest_time = max(times)
  
  # 计算上午出勤时间
  morning_start <- min(times)
  morning_end <- ifelse(morning_start < noon, noon, morning_start)
  morning_time <- morning_end - morning_start
  
  # 计算下午出勤时间
  afternoon_start_time <- ifelse(latest_time > afternoon_start, afternoon_start, latest_time)
  afternoon_end_time = ifelse(latest_time > evening_end, evening_start, latest_time)
  afternoon_time <- afternoon_end_time - afternoon_start_time
  
  # 计算晚上出勤时间
  evening_time <- ifelse(latest_time > evening_end, latest_time - evening_end, 0)
  
  tibble(
    morning = morning_time / 3600,
    afternoon = afternoon_time / 3600,
    evening = evening_time / 3600,
    total = (morning_time + afternoon_time + evening_time) / 3600
  )
}
```

测试 `calculate_attendance_time()` 函数效果：

``` r
c("09:00", "21:00") |> calculate_attendance_time()  # 福报
#> # A tibble: 1 × 4
#>   morning afternoon evening total
#>     <dbl>     <dbl>   <dbl> <dbl>
#> 1       3       4.5       2   9.5
c("08:30", "22:16") |> calculate_attendance_time()  # 至尊打工人
#> # A tibble: 1 × 4
#>   morning afternoon evening total
#>     <dbl>     <dbl>   <dbl> <dbl>
#> 1     3.5       4.5    3.27  11.3
c("08:59", "18:24", "21:00", "21:01") |> calculate_attendance_time()  # 卡点
#> # A tibble: 1 × 4
#>   morning afternoon evening total
#>     <dbl>     <dbl>   <dbl> <dbl>
#> 1    3.02       4.5    2.02  9.53
c("8:55", "18:01") |> calculate_attendance_time()  # 你的生活我的梦
#> # A tibble: 1 × 4
#>   morning afternoon evening total
#>     <dbl>     <dbl>   <dbl> <dbl>
#> 1    3.08      4.52       0   7.6
c("10:00", "17:30") |> calculate_attendance_time()  # 宇宙尽头
#> # A tibble: 1 × 4
#>   morning afternoon evening total
#>     <dbl>     <dbl>   <dbl> <dbl>
#> 1       2         4       0     6
```

芜湖！没问题，批量计算工作日**纯工时**：

``` r
dt |> 
  pivot_longer(2:31, names_to = "date", values_to = "check") |> 
  drop_na(check) |> 
  mutate(
    res = map(str_split(check, "  \r\n"), calculate_attendance_time)
  ) |> 
  unnest_wider(res) |> 
  mutate(across(4:7, \(x) round(x, 2))) |> 
  select(-check)
#> # A tibble: 42 × 6
#>    姓名  date   morning afternoon evening total
#>    <chr> <chr>    <dbl>     <dbl>   <dbl> <dbl>
#>  1 甲    date1     2.93       4.5    2     9.43
#>  2 甲    date2     3          4.5    2.7  10.2 
#>  3 甲    date3     2.93       4.5    1.2   8.63
#>  4 甲    date7     2.95       4.5    0.77  8.22
#>  5 甲    date8     2.93       4.5    2.02  9.45
#>  6 甲    date9     3          4.5    2.1   9.6 
#>  7 甲    date11    3          4.5    1.7   9.2 
#>  8 甲    date12    2.95       4.5    0.13  7.58
#>  9 甲    date15    3          4.5    1.5   9   
#> 10 甲    date16    2.95       4.5    1.57  9.02
#> # ℹ 32 more rows
```

[^1]: `<-` 赋值的是 GPT 写的，`=` 赋值的是俺自己写的。
