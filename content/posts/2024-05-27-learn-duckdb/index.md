---
title: DuckDB 学习笔记
author: 吴诗涛
date: '2024-05-27'
slug: learn-duckdb
---

本文配套了对应的 Slides：[DuckDB 学习笔记](../../slides/duckdb)。

---



去年了解到 [DuckDB](https://duckdb.org/) 的存在，因为没有适当的场景需要，便也没有专门学习。最近有了需要存储、快速使用一些较大数据的场景，趁机学习。

目前 DuckDB 吸引我的有两点：

1. 没有外部依赖，直接安装 **duckdb** 包即可使用。
1. 可以处理超过内存的数据。

# 使用方法一：DuckDB + SQL

这种方法相对简单，把数据存入 DuckDB 数据库后，用 SQL 查询即可。

## 创建 DuckDB 数据库


``` r
# install.packages("duckdb")
library(duckdb)

# 创建 DuckDB 连接，同时会在本地创建 local.duckdb 文件
con = dbConnect(duckdb(), dbdir = "local.duckdb")
```

## 向 DuckDB 数据库写入表

可以将 R 中的数据框写入到 DuckDB 数据库中：


``` r
# 写入 R 中的数据框
dbWriteTable(con, "table_iris", iris)
dbWriteTable(con, "table_mtcars", mtcars)
dbListTables(con)
#> [1] "table_iris"   "table_mtcars"
```

也可以将本地的文件直接导入到 DuckDB 数据库中，这个方法可以突破内存大小的限制：


``` r
# 创建本地 CSV 文件
data.frame(
  Species = c("setosa", "versicolor", "virginica"),
  code = LETTERS[1:3]
) |> write.csv("species_code.csv", row.names = FALSE)

# 将本地 CSV 文件直接导入 DuckDB
duckdb_read_csv(con, "table_code", "species_code.csv")
dbListTables(con)
#> [1] "table_code"   "table_iris"   "table_mtcars"
```

## 从 DuckDB 数据库删除表


``` r
dbRemoveTable(con, "table_mtcars")
dbListTables(con)
#> [1] "table_code" "table_iris"
```

## 使用 SQL 查询 DuckDB 数据库


``` r
dbGetQuery(con, "SELECT * FROM table_iris LIMIT 3;")
#>   Sepal.Length Sepal.Width Petal.Length Petal.Width Species
#> 1          5.1         3.5          1.4         0.2  setosa
#> 2          4.9         3.0          1.4         0.2  setosa
#> 3          4.7         3.2          1.3         0.2  setosa
```


``` r
dbGetQuery(con, "SELECT Species, COUNT(*) AS n
                 FROM table_iris
                 GROUP BY Species
                 ORDER BY n;")
#>      Species  n
#> 1     setosa 50
#> 2 versicolor 50
#> 3  virginica 50
```


``` r
# 表连接
dbGetQuery(con, "SELECT a.Species, code, n FROM
                 (
                   SELECT Species, COUNT(*) AS n
                   FROM table_iris
                   GROUP BY Species
                 ) a
                 LEFT JOIN table_code b
                 ON a.Species = b.Species;")
#>      Species code  n
#> 1     setosa    A 50
#> 2 versicolor    B 50
#> 3  virginica    C 50
```

## 断开 DuckDB 连接


``` r
# 断开数据库连接
dbDisconnect(con)
```

# 使用方法二：duckplyr


``` r
# install.packages("duckplyr")
library(duckplyr)
library(dplyr)

con = dbConnect(duckdb(), dbdir = "local.duckdb")
```

## 从 DuckDB 创建数据源

使用 `tbl()` 连接 DuckDB 数据库中的表，可以看到表的行数是 `??`，因为 **duckplyr** 采用惰性计算，只是生成了查询计划，并没有实际执行。


``` r
table_iris = tbl(con, "table_iris")
table_iris
#> # Source:   table<table_iris> [?? x 5]
#> # Database: DuckDB v0.10.2 [unknown@Linux 5.15.0-107-generic:R 4.4.0//home/shitao/git/shitao-blog/content/posts/2024-05-27-learn-duckdb/local.duckdb]
#>    Sepal.Length Sepal.Width Petal.Length Petal.Width Species
#>           <dbl>       <dbl>        <dbl>       <dbl> <fct>  
#>  1          5.1         3.5          1.4         0.2 setosa 
#>  2          4.9         3            1.4         0.2 setosa 
#>  3          4.7         3.2          1.3         0.2 setosa 
#>  4          4.6         3.1          1.5         0.2 setosa 
#>  5          5           3.6          1.4         0.2 setosa 
#>  6          5.4         3.9          1.7         0.4 setosa 
#>  7          4.6         3.4          1.4         0.3 setosa 
#>  8          5           3.4          1.5         0.2 setosa 
#>  9          4.4         2.9          1.4         0.2 setosa 
#> 10          4.9         3.1          1.5         0.1 setosa 
#> # ℹ more rows
```

## 使用管道操作数据

现在就可以和平常的数据一样进行分析了，要得到最终执行结果，需在管道最后接上 `collect()`。


``` r
table_iris |> 
  count(Species) |> 
  collect()
#> # A tibble: 3 × 2
#>   Species        n
#>   <fct>      <dbl>
#> 1 setosa        50
#> 2 versicolor    50
#> 3 virginica     50
```


``` r
table_code = tbl(con, "table_code")

table_iris |> 
  count(Species) |> 
  left_join(table_code, join_by(Species)) |> 
  select(Species, code, n) |> 
  collect()
#> # A tibble: 3 × 3
#>   Species    code      n
#>   <fct>      <chr> <dbl>
#> 1 setosa     A        50
#> 2 versicolor B        50
#> 3 virginica  C        50
```

## 断开 DuckDB 连接

数据库用完，记得断开连接哦！


``` r
# 断开数据库连接
dbDisconnect(con)
```



