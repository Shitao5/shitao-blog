---
title: R 笔记：数据批量读取和导出
author: 吴诗涛
date: '2025-03-26'
slug: r-batch-data-io
---

Tidyverse 风格的数据批量读取与导出。

读取：

```r
# 批量读取 data_files 文件夹下的文件
dt = map(list.files("data_files/", full.names = TRUE), 
         \(x) read_csv(x, show_col_types = FALSE)) |> 
     list_rbind()
```

导出：

```r
# 拆分为 n 个 n_row 行的文件写出到 res 文件夹
n = 6
n_row = 5e5
dt |> 
  mutate(group = ceiling(row_number() / n_row)) |> 
  group_split(group) |> 
  walk2(1:n, \(x, y) write_csv(x |> select(-group),
                               paste0("res/part_", y, ".csv")))
```
