/** 是否检测到 pakku.js 注入（会劫持页面 XHR/fetch 的弹幕请求） */
export const isPakkuActive = (): boolean => {
  try {
    if (document.querySelector('.__pakku_injected')) {
      return true
    }
    // pakku 在 content script 里给 XHR 打上 pakku_open
    if ((XMLHttpRequest.prototype as { pakku_open?: unknown }).pakku_open) {
      return true
    }
  } catch {
    // 环境受限时忽略
  }
  return false
}
