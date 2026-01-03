---
title: 学前端
author: 吴诗涛
date: '2023-12-31'
slug: fundamentals
---

不管是在用的 Hugo[^1] 还是 Quarto 博客，本质都是从简单易写的文档生成美观的网页。如果不满足于各类网页模板，希望有个性化的效果，自然离不开 HTML、CSS 和 JavaScript。

在我搭博客的初期，很多功能始于尝试，终于瞎猫碰到死耗子，放弃于积累不足、气运不佳。12 月，俺终于腾出手来，[开始](https://learn.shitao5.org/posts/20231217-web/)摸索学习前端知识。

似乎一旦下定决心去学习某个方向的知识，时不时就会有相关的学习资料出现。[*Introduction to Modern Statistics (2nd Ed)*](https://openintro-ims2.netlify.app/) 这本书是用 Quarto 写的，在 `scss/ims-style.scss` 中定义了不少样式[^2]，把整本书装点得有模有样。在我学习了一点 CSS 后，我发现了里边的魔法：

在 `scss/ims-style.scss` 中定义好类，比如：

```css
/* important */

.important {
  padding: 1em 1em 1em 4em;
  margin-top: 30px;
  margin-bottom: 30px;
  background: #f5f5f5 5px center/3em no-repeat;
  border-top: 1px solid #E97583;   
  border-bottom: 1px solid #E97583;  
  background-image: url("images/_icons/important.png");
  background-position: 0.5em 1em;
}
```

而后使用 Quarto 的语法，渲染出的网页就会有上面定义的效果：

```md
::: {.important}
Something important.
:::
```

这是前端中最基础的内容，却可以让网页焕然一新。等学了更多的前端知识，肯定会有更有趣的效果等着我吧！

[^1]: blogdown 包装的。

[^2]: 准确说是 CSS 中的类。
