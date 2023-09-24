---
title: 找点啥...
---

搜索关键词：

- 空格为 `AND`；

- `|` 为 `OR`；

- 匹配精确短语，请用双引号括起来。


<style type="text/css">
.main {
  width: 100%;
}
#search-input {
  width: 100%;
  font-size: 1.2em;
  padding: .5em;
}
.search-results b {
  background-color: yellow;
}
.search-preview {
  margin-left: 2em;
}
.single .main a, .single .main h2 {
  border-bottom: none;
}
</style>

<input type="search" id="search-input">

<div class="search-results">
<section>
<h2 class="toc-line"><a target="_blank"></a><span class="dots"></span><span class="page-num small"></span></h2>
<div class="search-preview"></div>
</section>
</div>

<script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@xiee/utils/js/fuse-search.min.js" defer></script>
