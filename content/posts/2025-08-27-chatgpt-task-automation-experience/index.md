---
title: ChatGPT 任务安排功能体验
author: 吴诗涛
date: '2025-08-27'
slug: chatgpt-task-automation-experience
---

很早在 ChatGPT 的「设置」里边看到有「安排」这一项，但一直没见到功能入口，也就没放在心上。最近在让它推荐管理学习资源时，它补了一句：

> 如果你愿意，我也可以每天固定时间给你推送 2–3 篇精选文章（中文+英文各一），比如工作日早上 9:00；或者按你关注的主题（如：质检看板、流程合规）定制。你只要告诉我时间与偏好就行。

抱着好奇心，我让它每天早上 9:15 推送，它随机开始安排，写了指令：

> Search for 2–3 fresh, reputable “management” resources each morning and send me a concise Chinese summary.
>
> Sources priority:  
> - 中文：哈佛商业评论中文版、麦肯锡中国洞察、BCG 洞察中文、贝恩观点、中欧知识、长江商学院观点、北大光华洞见、InfoQ（文化&方法/团队管理）。  
> - 英文：HBR Management Tip of the Day、MIT Sloan Management Review（短文为主）、Kellogg Insight、First Round Review。
>
> Rotate themes by day: 领导力、绩效&反馈、流程协作/质检、战略与组织文化、数据驱动管理（循环覆盖）。
>
> Output (in Chinese):  
> 1) 标题｜来源｜日期｜链接  
> 2) 3 个要点（每条 ≤ 30 字）  
> 3) “今日尝试”1 条（≤ 25 字）
>
> Also avoid重复来源，尽量选择最新 30 天内的内容。

多说一句，提示词写得还很讲究的嘞！

在「设置-通知-任务」可以选择任务更新的通知方式，有「推送」和「邮件」两种选择：

1. 「推送」是在创建任务的对话框中更新；
1. 「邮件」是往「设置-账户」中的电子邮箱发送更新链接，点击又回到创建任务的对话框了。

这两个是可以同时开启的，殊途同归，邮件鸡肋。

总体体验很不错：在对话框中就实现了任务安排，流程丝滑，给 OpenAi 的产品经理点个赞。
