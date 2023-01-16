library(tidyverse)

readLines("./content/others2.md") %>%
  str_replace_all("\\[\\[", "") %>%
  str_replace_all("\\]\\]", "") %>%
  str_replace_all(" #.*", "") %>%
  writeLines("./content/others.md")
