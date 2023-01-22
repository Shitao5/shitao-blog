readLines("./content/others2.md") |>
  stringr::str_replace_all("\\[\\[", "") |>
  stringr::str_replace_all("\\]\\]", "") |>
  stringr::str_replace_all(" #.*", "") |>
  writeLines("./content/others.md")
