---
title: 太空大战
author: shitao
date: '2022-09-07'
slug: game
description: 在小时候的游戏里「王者归来」。
categories:
  - 记录
tags:
  - 日常
image: ~
style:
  background: '#2a9d8f'
  color: '#fff'
---

上次和叶寻兄[谈到](https://shitao.netlify.app/life/jiudiannao/)小时候玩的游戏。现在连4399都要实名登录，玩游戏的「门槛」越来越高了。
近日，下载了「金山打字通」，重温小学时在机房玩的小游戏。

<img src="imgs/jinshan.jpg" width="40%" style="display: block; margin: auto;" />

打了几年的字，搜狗输入法累计输入213万，终于在「生死时速」游戏中让小偷怀疑人生，可算是「君子报仇，十年不晚」呐！

最有意思的是「太空大战」这个游戏。玩法是输入敌机上面的字母，就可以发射炮弹将其摧毁，摧毁一架得1500分；若是输入了敌机上暂时没有的字母，则会减400分。右上角的倒计时结束后会提升难度：敌机数量会变多，移动速度会变快，甚至会有两个重叠在一起的情况。

<img src="imgs/fu.jpg" width="40%" style="display: block; margin: auto;" />

一共玩了两次，第一次认认真真，确保正确率，玩到159万分；第二次发现了好办法，当后面眼花缭乱的时候，开启「摆烂」模式：直接乱敲键盘，理想状态就是26键一起下去。然而，这竟是一个更好的策略。当我祭出神魔乱舞，屏幕上的敌机就被悉数毁灭。


<img src="imgs/scores.jpg" width="40%" style="display: block; margin: auto;" />

这个策略小时候也用过，结果就是得了个负分。假设屏幕上最大敌机数量为$t$，大致计算了一下，要达到神魔乱舞还能得分，$t$应大于$t_0$，$t_0$应满足：

$$
1500 \times t_0 = 400 \times (26-t_0)
$$

按照经济学的说法，这个$t_0$是均衡点。神魔乱舞的得分$Y$与$t$是线性关系：

<img src="/life/2022-09-07-game/index.zh-cn_files/figure-html/unnamed-chunk-4-1.png" width="35%" style="display: block; margin: auto;" />

当确保屏幕上有6个以上敌机的时候，使用神魔乱舞就可以慢慢加分了。小时候竟如此生疏，过不了这个「坎」。

PS：很粗略的估计，欢迎拍砖。
