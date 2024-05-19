---
title: Markdown 文档拆分与脚注编号重排
author: 吴诗涛
date: '2024-05-19'
slug: markdown-split-footnote-renumbering
---



把一个 Markdown 文档按照一级标题拆分为多个，同时将位于文档最后的脚注拆分到对应的文档末尾并重排编号。这个问题俺问了 ChatGPT，它丢给我一段 Lua 脚本，并使用 Pandoc 过滤器确实搞定了。俺想着这样有点丢面儿，自己用 R 也写了一个。于是乎这里记录了这两种方式。

使用 `test.md` 测试文档：

```md
 # 标题 1

## 1.1

这里有脚注一[^1]

## 1.2

这里有脚注二[^2]

# 标题 2

## 2.1

这里有脚注三[^3]

## 2.2

这里有脚注四[^4]

[^1]: 脚注一。

[^2]: 脚注二。

[^3]: 脚注三。

[^4]: 脚注四。 
```

# Lua + Pandoc

1. 新建一个 `split_by_chapter.lua` 脚本：
      
    ```lua
     -- split_by_chapter.lua
    local chapter_counter = 0
    local chapters = {}
    local current_chapter = nil
    
    function Pandoc(doc)
      for i, elem in ipairs(doc.blocks) do
        if elem.t == "Header" and elem.level == 1 then
          if current_chapter then
            table.insert(chapters, current_chapter)
          end
          chapter_counter = chapter_counter + 1
          current_chapter = {filename = string.format("lua/chapter%02d.md", chapter_counter), blocks = {elem}}
        elseif current_chapter then
          table.insert(current_chapter.blocks, elem)
        else
          current_chapter = {filename = string.format("lua/chapter%02d.md", chapter_counter), blocks = {elem}}
        end
      end
      if current_chapter then
        table.insert(chapters, current_chapter)
      end
    
      for _, chapter in ipairs(chapters) do
        local chapter_doc = pandoc.Pandoc(chapter.blocks, doc.meta)
        local file = io.open(chapter.filename, "w")
        file:write(pandoc.write(chapter_doc, 'gfm'))
        file:close()
      end
      return pandoc.Pandoc({}, doc.meta)
    end 
    ```
      
2. 调用 Pandoc：
    
    ```bash
    pandoc test.md --lua-filter=split_by_chapter.lua -t markdown
    ```
    
3. 查看结果：
      
    
    ```r
    list.files("lua")
    #> [1] "chapter01.md" "chapter02.md"
    ```
    
    `lua/chapter01.md`：
    
    ```md
     # 标题 1
    
    ## 1.1
    
    这里有脚注一[^1]
    
    ## 1.2
    
    这里有脚注二[^2]
    
    [^1]: 脚注一。
    
    [^2]: 脚注二。 
    ```
    
    `lua/chapter02.md`：
    
    ```md
     # 标题 2
    
    ## 2.1
    
    这里有脚注三[^1]
    
    ## 2.2
    
    这里有脚注四[^2]
    
    [^1]: 脚注三。
    
    [^2]: 脚注四。 
    ```

# R

放到俺比较熟悉的 tidyverse 框架下解决。

1. 读取 `test.md`，将正文和脚注分为两张表，正文表分章节，脚注表提取编号：

    
    ```r
    library(tidyverse)
    
    text = tibble(text = readLines("test.md"))
    
    # 正文
    main = text |> filter(!str_detect(text, "^\\[\\^")) |> 
      mutate(
        chatpter = ifelse(str_detect(text, "^# "), row_number(), NA_integer_),
      ) |> 
      fill(chatpter, .direction = "down") |> 
      group_by(chapter = consecutive_id(chatpter)) |> 
      reframe(
        text = paste0(text, collapse = "\n")
      )
    main
    #> # A tibble: 2 × 2
    #>   chapter text                                                                  
    #>     <int> <chr>                                                                 
    #> 1       1 "# 标题 1\n\n## 1.1\n\n这里有脚注一[^1]\n\n## 1.2\n\n这里有脚注二[^2]…
    #> 2       2 "# 标题 2\n\n## 2.1\n\n这里有脚注三[^3]\n\n## 2.2\n\n这里有脚注四[^4]…
    
    # 脚注
    footnotes = text |> filter(str_detect(text, "^\\[\\^")) |> 
      mutate(
        id = str_extract(text, "(?<=\\[\\^)\\d+(?=\\])")
      )
    footnotes
    #> # A tibble: 4 × 2
    #>   text           id   
    #>   <chr>          <chr>
    #> 1 [^1]: 脚注一。 1    
    #> 2 [^2]: 脚注二。 2    
    #> 3 [^3]: 脚注三。 3    
    #> 4 [^4]: 脚注四。 4
    ```
    
2. 从正文中提取每个章节包含的脚注编号，与脚注表连接后，将每章脚注合并在一起：
    
    
    ```r
    # 获取脚注所属章节
    main_footnotes = main |> 
      mutate(
        footnotes = str_extract_all(text, "(?<=\\[\\^)\\d+(?=\\])")
      ) |> 
      unnest_longer(footnotes) |> 
      left_join(footnotes, join_by(footnotes == id)) |> 
      reframe(
        .by = chapter,
        footnotes = paste0(text.y, collapse = "\n\n")
      )
    main_footnotes
    #> # A tibble: 2 × 2
    #>   chapter footnotes                         
    #>     <int> <chr>                             
    #> 1       1 "[^1]: 脚注一。\n\n[^2]: 脚注二。"
    #> 2       2 "[^3]: 脚注三。\n\n[^4]: 脚注四。"
    ```

3. 根据章节号，将正文和脚注合并，并将章节号改为后续写出的路径名：

    
    ```r
    # 将脚注合并至章节末尾
    res = main |> 
      left_join(main_footnotes, join_by(chapter)) |> 
      transmute(
        filename = sprintf("R/chapter%02d.md", chapter),
        text = ifelse(is.na(footnotes), text, paste0(text, "\n", footnotes))  # 需注意无脚注的情况
      )
    res
    #> # A tibble: 2 × 2
    #>   filename       text                                                          
    #>   <chr>          <chr>                                                         
    #> 1 R/chapter01.md "# 标题 1\n\n## 1.1\n\n这里有脚注一[^1]\n\n## 1.2\n\n这里有脚…
    #> 2 R/chapter02.md "# 标题 2\n\n## 2.1\n\n这里有脚注三[^3]\n\n## 2.2\n\n这里有脚…
    ```

4. 将每章的脚注重新编号，从 1 开始。这一步的思路是：提取每一章中用到的脚注编号，去重后为每一个脚注生成重新编号所需对应的编号，而后递归对文本进行替换。最后再加上一步：把多余的换行符（3 个及以上）替换为 2 个。
    
    
    ```r
    # 替换脚注为从 1 开始
    res2 = res |> 
      mutate(
        footnote_id = str_extract_all(text, "(?<=\\[\\^)\\d+(?=\\])"),
        footnote_id = map(footnote_id, \(x) paste0("\\[\\^", x, "\\]") |> unique())
      ) |> 
      unnest_longer(footnote_id) |> 
      mutate(
        .by = filename,
        replace_footnote_id = paste0("\\[\\^", row_number(), "\\]")
      ) |> 
      reframe(
        .by = c(filename, text),
        footnote_id_list = list(footnote_id),   # 递归被替换列表
        replace_footnote_id_list = list(replace_footnote_id)  # 递归替换对应列表
      ) |> 
      rowwise() |>   # 递归需要，将数据框转为横向
      transmute(
        filename,
        text = reduce2(footnote_id_list, replace_footnote_id_list,
                       \(x, y, z) str_replace_all(x, y, z), .init = text) # 递归替换
      ) |> 
      as_tibble() |>   # 将数据框恢复为纵向
      mutate(
        text = str_replace_all(text, "\\\n{3,}", "\\\n\\\n") # 3个及以上的换行符替换为2个
      )
    res2
    #> # A tibble: 2 × 2
    #>   filename       text                                                          
    #>   <chr>          <chr>                                                         
    #> 1 R/chapter01.md "# 标题 1\n\n## 1.1\n\n这里有脚注一[^1]\n\n## 1.2\n\n这里有脚…
    #> 2 R/chapter02.md "# 标题 2\n\n## 2.1\n\n这里有脚注三[^1]\n\n## 2.2\n\n这里有脚…
    ```

5. 写出对应结果：
    
    
    ```r
    # 写出 Markdown
    walk2(res2$text, res2$filename, \(x, y) writeLines(text = x, con = y))
    ```

6. 查看结果：

    
    ```r
    list.files("R")
    #> [1] "chapter01.md" "chapter02.md"
    ```
    
    `R/chapter01.md`：
    
    ```md
     # 标题 1
    
    ## 1.1
    
    这里有脚注一[^1]
    
    ## 1.2
    
    这里有脚注二[^2]
    
    [^1]: 脚注一。
    
    [^2]: 脚注二。 
    ```
    
    `R/chapter02.md`：
    
    ```md
     # 标题 2
    
    ## 2.1
    
    这里有脚注三[^1]
    
    ## 2.2
    
    这里有脚注四[^2]
    
    [^1]: 脚注三。
    
    [^2]: 脚注四。 
    ```

# 确认结果一致


```r
identical(readLines("R/chapter01.md"), readLines("lua/chapter01.md"))
#> [1] TRUE
identical(readLines("R/chapter02.md"), readLines("lua/chapter02.md"))
#> [1] TRUE
```

大功告成！
