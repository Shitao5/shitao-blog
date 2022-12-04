---
title: 解决 Kworker 导致的 CPU 占用率高问题
author: shitao
date: '2022-12-04'
slug: kworker-cpu
categories: []
tags:
  - Linux
description: ~
image: ~
math: ~
license: ~
hidden: no
comments: yes
---

近来常驻 Ubuntu 了，和它磨合起来。遇到的第一个问题就是 Kworker 占用了 CPU 1 核的 90% 以上，导致风扇呼呼非常大声，加之我的支架把电脑架得很高，让我觉得我耳边有一只准备起飞的灰机。

在我开机使用电脑的时候这个问题不会出现[^start]，但只要我挂起系统然后再次打开，灰机就又来了。

[^start]: 关机再开机确实可以（解决 | 推迟解决）很多问题。

当这个问题出现的时候，通过 `top` 可以看到 Kworker/0:1+kacpid 占用了 90% 以上的 CPU，难怪电脑风扇呼呼了。

查了很多解决方案，最终在这两个回答的帮助下解决了问题：

1. [Disable GPE ACPI interrupts on boot?](https://unix.stackexchange.com/questions/242013/disable-gpe-acpi-interrupts-on-boot)
2. [SOLVED: kworker kacpid/kacpi_notify hogging 60-70% of cpu](https://forums.linuxmint.com/viewtopic.php?f=18&t=319847&sid=18fafc4130fcbdad5c03ea32c035dcfe)

具体操作方法如下：

1. 运行 `grep . -r /sys/firmware/acpi/interrupts/`，查看哪个 gpe 显示的数值较大，我的电脑上是 `gpe6F`。
2. 运行 `sudo -s` 打开系统管理员权限。
3. 运行 `echo mask > /sys/firmware/acpi/interrupts/gpe6F`。
4. 运行 `update-grub`，然后 `reboot`。

至此，通过 `htop` 查看 CPU 的使用情况，就没有很高的占用率了，日常使用的时候基本上可以风扇不转，很安静，很棒。

至于这个解决问题的原理，非我目前所要探索的内容，有兴趣的小伙伴自由探索，也欢迎懂行的朋友和俺解释解释，在下先行谢过了！:hugs:
