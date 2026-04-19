---
title: Mac 键位优化：让冷门按键变成快捷入口
author: 吴诗涛
date: '2026-04-19'
slug: mac-unused-keys-shortcuts-hammerspoon
---

Windows 系统支持 `Win + 数字键` 打开或切换任务栏中对应位置的应用。我已习惯将微信固定在任务栏最左侧、Logseq 第二、浏览器第三。

在使用 Mac 系统后没有了这样的快捷方式，即使触控板很丝滑，还是需要花时间去寻找和打开软件，差点意思。盯着键盘看了会，发现有两个键位使用率非常低，干脆用来设置成微信和 Logseq 的快捷键吧。这两个键是：空格右侧的 command 和 option。

最终实现的效果是按下右侧的 command 就可以打开或隐藏微信，右侧的 option 对应的是 Logseq。

设置的过程也非常简单：向 codex 许愿。它的方案是采用 Hammerspoon 进行自定义设置，配置文件如下：

<details>
  <summary>Hammerspoon 配置</summary>

```lua
require("hs.ipc")

local function toggleLogseq()
  local app = hs.appfinder.appFromName("Logseq")

  if app and app:isFrontmost() then
    app:hide()
    return
  end

  hs.application.launchOrFocus("Logseq")
end

local function toggleWeChat()
  local front = hs.application.frontmostApplication()
  local frontBundle = front and front:bundleID() or nil
  local wechatApp = hs.application.applicationsForBundleID("com.tencent.xinWeChat")[1]
  local isWeChatFrontmost = frontBundle == "com.tencent.xinWeChat"
    or frontBundle == "com.tencent.flue.WeChatAppEx"
    or frontBundle == "com.tencent.flue.helper.renderer"

  if isWeChatFrontmost and wechatApp then
    wechatApp:hide()
    return
  end

  hs.application.launchOrFocusByBundleID("com.tencent.xinWeChat")
end

hs.hotkey.bind({}, "f18", toggleLogseq)
hs.hotkey.bind({}, "f19", toggleWeChat)
```

</details>
