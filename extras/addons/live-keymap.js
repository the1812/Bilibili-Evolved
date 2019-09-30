// ==UserScript==
// @name         Live Keymap
// @version      1.0.0
// @description  直播间快捷键扩展
// @author       Grant Howard
// @license      MIT
// @match        *://live.bilibili.com/*
// @match        *://live.bilibili.com
// @run-at       document-body
// @grant        unsafeWindow
// ==/UserScript==
document.addEventListener('keydown', e => {
  if (document.activeElement && ['input', 'textarea'].includes(document.activeElement.nodeName.toLowerCase())) {
    return
  }
  if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    document.querySelector('.blpui-volume-btn .blpui-btn').click()
  }
})