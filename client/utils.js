export function logError (error) {
  let finalMessage = error
  if (typeof error === 'object' && 'stack' in error) {
    if (settings.toastInternalError) {
      finalMessage = `${error.message}\n${error.stack}`
    } else {
      finalMessage = error.message
    }
  }
  Toast.error(finalMessage, '错误')
  console.error(error)
}
export function raiseEvent (element, eventName) {
  const event = document.createEvent('HTMLEvents')
  event.initEvent(eventName, true, true)
  element.dispatchEvent(event)
}
export async function loadLazyPanel (selector) {
  await SpinQuery.unsafeJquery()
  const panel = await SpinQuery.any(() => unsafeWindow.$(selector))
  if (!panel) {
    throw new Error(`Panel not found: ${selector}`)
  }
  panel.mouseover().mouseout()
}
export async function loadDanmakuSettingsPanel () {
  const style = document.createElement('style')
  style.innerText = `.bilibili-player-video-danmaku-setting-wrap { display: none !important; }`
  document.body.insertAdjacentElement('beforeend', style)
  await loadLazyPanel('.bilibili-player-video-danmaku-setting')
  setTimeout(() => style.remove(), 300)
}
export function contentLoaded (callback) {
  if (/complete|interactive|loaded/.test(document.readyState)) {
    callback()
  } else {
    document.addEventListener('DOMContentLoaded', () => callback())
  }
}
export function fullyLoaded (callback) {
  if (document.readyState === 'complete') {
    callback()
  } else {
    unsafeWindow.addEventListener('load', () => callback())
  }
}
export function fixed (number, precision = 1) {
  const str = number.toString()
  const index = str.indexOf('.')
  if (index !== -1) {
    if (str.length - index > precision + 1) {
      return str.substring(0, index + precision + 1)
    } else {
      return str
    }
  } else {
    return str + '.0'
  }
}
export function isEmbeddedPlayer () {
  return location.host === 'player.bilibili.com' || document.URL.startsWith('https://www.bilibili.com/html/player.html')
}
export function isIframe () {
  return document.body && unsafeWindow.parent.window !== unsafeWindow
}
export const languageNameToCode = {
  '日本語': 'ja-JP',
  'English': 'en-US',
  'Deutsch': 'de-DE'
}
export const languageCodeToName = {
  'ja-JP': '日本語',
  'en-US': 'English',
  'de-DE': 'Deutsch'
}
export function getI18nKey () {
  return settings.i18n ? languageNameToCode[settings.i18nLanguage] : 'zh-CN'
}
export const dq = (selector) => document.querySelector(selector)
export const dqa = (selector) => [...document.querySelectorAll(selector)]
export const UserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0`
export const EmptyImageUrl = 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>'
