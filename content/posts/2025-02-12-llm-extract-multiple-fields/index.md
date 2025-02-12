---
title: 利用大模型批量提取多字段
author: 吴诗涛
date: '2025-02-12'
slug: llm-extract-multiple-fields
---

今天看到卡兹克的[文章](https://mp.weixin.qq.com/s/Rcxlb6ykyngTIJRt_nLdEQ)，讲飞书的多维表格接入 DeepSeek，降低大模型应用于实际工作的门槛。我也按照文章的步骤在飞书中进行了尝试，确实非常方便和提效。相信不出几天其他办公软件厂商也会添加上这个功能，这是时代给打工人的福利。

减少重复工作，似乎一直是编程的优势。编写好能完成单个任务的函数（函数内部可调用大模型），然后在所有相似任务上循环使用这个函数，完成任务。现在飞书通过类似 Excel 下拉的方式达成减少重复工作的目的，本质上和编程的思路是一样的，但更容易被大众使用。

想起春节假期 DeepSeek 爆火的时候，[Hadley](https://hadley.nz/) 正好完善了 [ellmer 包](https://ellmer.tidyverse.org/index.html) 对 DeepSeek 的支持：[`chat_deepseek()`](https://ellmer.tidyverse.org/reference/chat_deepseek.html) 函数。在 R 语言中也能方便地调用 DeepSeek 了。

我更愿意在编程中使用大模型，这更像是用大模型助力工作流中的一环，对于很少使用飞书或类似办公软件处理数据的我来说，为了用大模型而把数据倒腾到办公软件里边，反而是舍本逐末了。

目前，在 R 中使用大模型，我主要用 ellmer 包，大致流程演示如下，使用的大模型是 Kimi。

# 在环境变量中保存秘钥

为了调用 API 方便，可以将大模型 API 秘钥记录在环境变量中：


``` r
usethis::edit_r_environ()
```

运行后将打开环境变量配置文件，记录各个模型的 API 秘钥后保存，重启 R 即可。配置文件如下：

```r
MOONSHOT_API_KEY = "sk-xxxx"  # Kimi
DASHSCOPE_API_KEY = "sk-xxx"  # 百炼
```

# 在工作流中使用大模型

以从每个人的自我介绍中获取姓名、年龄、出生地和大学专业为例。

## 数据准备


``` r
library(tibble)
library(tidyr)
library(dplyr)
library(purrr)
library(ellmer)

dt = tibble(
  个人介绍 = c(
    "大家好，我是张明，33岁，出生在浙江嘉兴。我在大学时主修计算机科学……",
    "你好，我是李瑶，26岁，出生于浙江温州。我本科读的是市场营销专业……",
    "大家好，我是王涛，28岁，来自广州。毕业于电子工程专业……",
    "你好，我叫陈丽，1999年3月出生，南京人。我是金融专业毕业的……"
  )
)
dt
```

```
## # A tibble: 4 × 1
##   个人介绍                                                          
##   <chr>                                                             
## 1 大家好，我是张明，33岁，出生在浙江嘉兴。我在大学时主修计算机科学……
## 2 你好，我是李瑶，26岁，出生于浙江温州。我本科读的是市场营销专业……  
## 3 大家好，我是王涛，28岁，来自广州。毕业于电子工程专业……            
## 4 你好，我叫陈丽，1999年3月出生，南京人。我是金融专业毕业的……
```
    
## 编写调用大模型函数

这步重点实现以下目标：

1. 调用大模型；
1. 设定合适的提示词；
1. 确定需提取的字段，若有多个字段，最终输出列表；
1. 包装函数，针对单个任务实现目标。


``` r
extract_info = function(text) {
  chat = chat_openai(
    system_prompt = "你是一位数据标注师，请你从个人介绍中提取姓名、年龄、出生地和大学专业。注意：今天是2025年2月12日，出生地以'省份-地区'的形式输出。",
    model = "moonshot-v1-8k",
    base_url = "https://api.moonshot.cn/v1",
    api_key = Sys.getenv("MOONSHOT_API_KEY"),
  )

  type_sentiment = type_object(
    姓名 = type_string("姓名"),
    年龄 = type_integer("年龄"),
    出生地 = type_string("出生地"),
    大学专业 = type_string("大学主修专业")
  )

  chat$extract_data(text, type = type_sentiment)
}
```


``` r
# 函数使用示例
extract_info("我叫张三，今年23岁，来自宜兴，本科期间学习经济学专业。")
```

```
## $姓名
## [1] "张三"
## 
## $年龄
## [1] 23
## 
## $出生地
## [1] "江苏-宜兴"
## 
## $大学专业
## [1] "经济学"
```

## 批量调用，获取结果列表


``` r
res = dt |> mutate(信息列表 = map(个人介绍, extract_info))
res
```

```
## # A tibble: 4 × 2
##   个人介绍                                                          信息列表    
##   <chr>                                                             <list>      
## 1 大家好，我是张明，33岁，出生在浙江嘉兴。我在大学时主修计算机科学………… <named list>
## 2 你好，我是李瑶，26岁，出生于浙江温州。我本科读的是市场营销专业……  <named list>
## 3 大家好，我是王涛，28岁，来自广州。毕业于电子工程专业……            <named list>
## 4 你好，我叫陈丽，1999年3月出生，南京人。我是金融专业毕业的……       <named list>
```

## 展开结果列表，得到最终结果


``` r
res |> unnest_wider(信息列表) |> select(-个人介绍)
```

```
## # A tibble: 4 × 4
##   姓名   年龄 出生地    大学专业  
##   <chr> <int> <chr>     <chr>     
## 1 张明     33 浙江-嘉兴 计算机科学
## 2 李瑶     26 浙江-温州 市场营销  
## 3 王涛     28 广东-广州 电子工程  
## 4 陈丽     26 江苏-南京 金融
```

在应用大模型的时候，需要仔细检查，设定好提示词，谨防大模型幻觉。
