---
title: 利用 Webhook 将 R 消息推送至钉钉和企业微信
author: shitao
date: '2023-06-02'
slug: send-message
categories: []
tags:
  - R
  - ChatGPT
description: 小王痛失网名。
image: img.jpg
math: ~
license: ~
hidden: no
comments: yes
---

公司新来的算法工程师工具包里有好多稀奇古怪的东西，其中一个是将代码运行时的信息发送到钉钉或者企业微信，非常实用。借鉴这个思路，我照猫画虎写了个 R 语言版本，过程中借助 ChatGPT ，大大提高了写代码的效率。

接下来介绍如何使用这个工具，并举例一些常用的场景。

# 安装

将 R 消息发送到钉钉（`send_message_ding()`）和企业微信（`send_message_wx()`）的功能已经封装在 [stfun](https://github.com/Shitao5/stfun/blob/main/R/send_message.R)  中。运行以下代码安装：

```r
if (!require(remotes)) install.packages("remotes")
remotes::install_github("Shitao5/stfun")
```

# 使用方法

## 添加 Webhook 机器人

Webhook 机器人需要添加在群中，如果想拥有一个私人的机器人（大概率如此），可以拉上两个人建群然后趁 ta 们不注意马上踢出去，只留下自己一人即可。

- 钉钉在「群设置 -> 智能群助手 -> 添加机器人」中添加自定义机器人（通过 Webhook 接入自定义服务）。

- 企业微信在「群设置 -> 群机器人 -> 添加」中添加自定义机器人。

添加机器人后可以自定义头像和名字。

相比于企业微信，钉钉的机器人需要添加安全设置，可以采用「自定义关键词」、「加签」或者「IP 地址（段）」的方法设置。我采用了自定义关键词的方式，定义了英文冒号和中文冒号为关键词，这样 R 中发出的消息必须包含两者之一才会在群中显示消息。

## 设置 Webhook

添加机器人后，会显示一个 Webhook 地址，复制后添加到 `options()` 中：

```r
# 添加钉钉 Webhook
options(webhook_ding = "https://oapi.dingtalk.com/robot/send?access_token=YOUR_ACCESS_TOKEN")

# 添加企业微信 Webhook
options(webhook_wx = "https://qyapi.weixin.qq.com/robot/send?access_token=YOUR_ACCESS_TOKEN")
```

## 运行函数发送消息

### 钉钉消息

发送钉钉消息（需注意满足安全设置）：

```r
# 发送信息
send_message_ding("Message: Hello, World!") 

# 发送带有时间戳的信息
send_message_ding("Message: Hello, World!",
                  include_timestamp = TRUE)

# 发送带有时间戳的信息并通过手机号 @其他人
send_message_ding("Message: Hello, World!",
                  include_timestamp = TRUE,
                  at_mobiles = "12345678912")
                  
# 发送带有时间戳的信息并 @所有人
send_message_ding("Message: Hello, World!",
                  include_timestamp = TRUE,
                  at_all = TRUE)
```

### 企业微信消息

```r
# 发送信息
send_message_wx("Message: Hello, World!") 

# 发送带有时间戳的信息
send_message_wx("Message: Hello, World!",
                include_timestamp = TRUE)

# 发送带有时间戳的信息并通过手机号 @其他人
send_message_wx("Message: Hello, World!",
                include_timestamp = TRUE,
                at_mobiles = "12345678912")
                  
# 发送带有时间戳的信息并 @所有人
send_message_wx("Message: Hello, World!",
                include_timestamp = TRUE,
                at_all = TRUE)
```

# 使用场景举例

机器人的作用和函数的运行提示是一样的，只不过它将信息发送到了钉钉或者企业微信上。一些常用的场景比如：

1. 代码运行状况远程提醒；

1. 需要长时间运行的代码，提示代码运行进度，用于监控代码运行效率；

1. 其他……
