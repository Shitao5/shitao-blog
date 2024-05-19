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
