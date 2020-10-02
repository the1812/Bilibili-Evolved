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
  panel.mouseover()
  // 懒加载面板带有 300ms 的 denounce
  return new Promise(resolve => {
    setTimeout(() => {
      panel.mouseout()
      resolve()
    }, 310)
  })
}
export async function loadLazyPlayerSettingsPanel (buttonSelector, panelSelector) {
  // 暂时隐藏面板
  const style = document.createElement('style')
  style.innerText = `${panelSelector} { display: none !important; }`
  document.body.insertAdjacentElement('beforeend', style)
  await loadLazyPanel(buttonSelector)
  // 有些面板有 300ms 的 transition delay
  setTimeout(() => style.remove(), 300)
  return dq(panelSelector)
}
export async function loadDanmakuSettingsPanel () {
  return await loadLazyPlayerSettingsPanel('.bilibili-player-video-danmaku-setting', '.bilibili-player-video-danmaku-setting-wrap')
}
export async function loadSubtitleSettingsPanel () {
  return await loadLazyPlayerSettingsPanel('.bilibili-player-video-btn-subtitle', '.bilibili-player-video-subtitle-setting-wrap')
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
export const dq = (selector, scopedSelector) => {
  if (!scopedSelector) {
    return document.querySelector(selector)
  }
  return selector.querySelector(scopedSelector)
}
export const dqa = (selector, scopedSelector) => {
  if (!scopedSelector) {
    return [...document.querySelectorAll(selector)]
  }
  return [...selector.querySelectorAll(scopedSelector)]
}
export const UserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0`
export const EmptyImageUrl = 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>'
export const ascendingSort = (itemProp) => {
  return (a, b) => itemProp(a) - itemProp(b)
}
export const descendingSort = (itemProp) => {
  return (a, b) => itemProp(b) - itemProp(a)
}
export const formatFileSize = (bytes, fixed = 1) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let number = bytes
  let unitIndex = 0
  while (number >= 1024) {
    number /= 1024
    unitIndex++
  }
  return `${Math.round(number * (10 ** fixed)) / (10 ** fixed)}${units[unitIndex]}`
}
export const formatDuration = (time, fixed = 0) => {
  const second = (time % 60).toFixed(fixed)
  const minute = (Math.trunc(time / 60) % 60).toString()
  const hour = Math.trunc(time / 3600).toString()
  if (hour === '0') {
    return `${minute.padStart(2, '0')}:${second.padStart(2, '0')}`
  }
  return `${hour}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`
}
export const getDpiSourceSet = (src, baseSize, extension = 'jpg') => {
  const dpis = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4]
  if (extension.startsWith('.')) {
    extension = extension.substring(1)
  }
  return dpis.map(dpi => {
    if (typeof baseSize === 'object') {
      if ('width' in baseSize && 'height' in baseSize) {
        return `${src}@${Math.trunc(baseSize.width * dpi)}w_${Math.trunc(baseSize.height * dpi)}h.${extension} ${dpi}x`
      } else if ('width' in baseSize) {
        return `${src}@${Math.trunc(baseSize.width * dpi)}w.${extension} ${dpi}x`
      } else if ('height' in baseSize) {
        return `${src}@${Math.trunc(baseSize.height * dpi)}h.${extension} ${dpi}x`
      }
    } else {
      return `${src}@${Math.trunc(baseSize * dpi)}w_${Math.trunc(baseSize * dpi)}h.${extension} ${dpi}x`
    }
  }).join(",")
}
export const isOffline = () => typeof offlineData !== 'undefined'
export const getUID = () => document.cookie.replace(/(?:(?:^|.*;\s*)DedeUserID\s*\=\s*([^;]*).*$)|^.*$/, '$1')
export const scriptVersion = (() => {
  const match = GM.info.script.name.match(/Evolved \((.*)\)/)
  return match ? match[1] : 'Stable'
})()
export const getCsrf = () => document.cookie.replace(/(?:(?:^|.*;\s*)bili_jct\s*\=\s*([^;]*).*$)|^.*$/, '$1')
export const formatCount = (count) => {
  if (typeof count === 'string') {
    count = parseInt(count)
  }
  if (count > 100000000) {
    return Math.round(count / 10000000) / 10 + '亿'
  }
  if (count > 10000) {
    return Math.round(count / 1000) / 10 + '万'
  }
  return count + ''
}
export const escapeFilename = (filename, replacement = '') => {
  return filename.replace(/[\/\\:\*\?"<>\|]/g, replacement)
}
export function html (strings, ...values) {
  return [...strings].reduce((previous, current, index) => {
    const value = values[index]
    return previous + current + (value === undefined ? '' : value)
  }, '')
}
export const dashExtensions = ['.mp4', '.m4a']
export const dashFragmentExtension = 'm4s'
export const videoCondition = async () => {
  let cid = await SpinQuery.select(() => (unsafeWindow || window).cid)
  return Boolean(cid)
}
export const matchPattern = (str, pattern) => {
  if (typeof pattern === 'string') {
    return str.includes(pattern)
  }
  return pattern.test(str)
}
export const playerReady = () => {
  return SpinQuery.condition(
    () => {
      const danmakuInfo = dq('.video-data .dm')
      if (danmakuInfo) {
        return parseInt(danmakuInfo.textContent)
      }
      return NaN
    },
    it => !Number.isNaN(it),
  )
}
export const formData = (obj) => Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('&')
