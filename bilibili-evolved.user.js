// ==UserScript==
// @name         Bilibili Evolved
// @version      1.8.12
// @description  增强哔哩哔哩Web端体验: 下载视频, 音乐, 封面, 弹幕; 自定义播放器的画质, 模式, 布局; 自定义顶栏, 删除广告, 使用夜间模式; 以及增加对触屏设备的支持等.
// @author       Grant Howard, Coulomb-G
// @copyright    2019, Grant Howard (https://github.com/the1812) & Coulomb-G (https://github.com/Coulomb-G)
// @license      MIT
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @run-at       document-start
// @updateURL    https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.user.js
// @downloadURL  https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.user.js
// @supportURL   https://github.com/the1812/Bilibili-Evolved/issues
// @homepage     https://github.com/the1812/Bilibili-Evolved
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_info
// @require      https://code.jquery.com/jquery-3.4.0.min.js
// @require      https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js
// @icon         https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/images/logo-small.png
// @icon64       https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/images/logo.png
// ==/UserScript==
function logError (error) {
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
function raiseEvent (element, eventName) {
  const event = document.createEvent('HTMLEvents')
  event.initEvent(eventName, true, true)
  element.dispatchEvent(event)
}
async function loadLazyPanel (selector) {
  await SpinQuery.unsafeJquery()
  const panel = await SpinQuery.any(() => unsafeWindow.$(selector))
  if (!panel) {
    throw new Error(`Panel not found: ${selector}`)
  }
  panel.mouseover().mouseout()
}
async function loadDanmakuSettingsPanel () {
  const style = document.createElement('style')
  style.innerText = `.bilibili-player-video-danmaku-setting-wrap { display: none !important; }`
  document.body.insertAdjacentElement('beforeend', style)
  await loadLazyPanel('.bilibili-player-video-danmaku-setting')
  setTimeout(() => style.remove(), 300)
}
function contentLoaded (callback) {
  if (/complete|interactive|loaded/.test(document.readyState)) {
    callback()
  } else {
    document.addEventListener('DOMContentLoaded', () => callback())
  }
}
function fullyLoaded (callback) {
  if (document.readyState === 'complete') {
    callback()
  } else {
    unsafeWindow.addEventListener('load', () => callback())
  }
}
function fixed (number, precision = 1) {
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
function isEmbeddedPlayer () {
  return location.host === 'player.bilibili.com' || document.URL.startsWith('https://www.bilibili.com/html/player.html')
}
function isIframe () {
  return document.body && unsafeWindow.parent.window !== unsafeWindow
}
const languageNameToCode = {
  '日本語': 'ja-JP',
  'English': 'en-US',
  'Deutsch': 'de-DE'
}
const languageCodeToName = {
  'ja-JP': '日本語',
  'en-US': 'English',
  'de-DE': 'Deutsch'
}
function getI18nKey () {
  return settings.i18n ? languageNameToCode[settings.i18nLanguage] : 'zh-CN'
}
const dq = (selector) => document.querySelector(selector)
const dqa = (selector) => [...document.querySelectorAll(selector)]
const UserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0`
const EmptyImageUrl = 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>'
const formatFileSize = (bytes, fixed = 1) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let number = bytes
  let unitIndex = 0
  while (number >= 1024) {
    number /= 1024
    unitIndex++
  }
  return `${Math.round(number * (10 ** fixed)) / (10 ** fixed)}${units[unitIndex]}`
}

const customNavbarDefaultOrders = {
  blank1: 0,
  logo: 1,
  category: 2,
  rankingLink: 3,
  drawingLink: 4,
  musicLink: 5,
  gamesIframe: 6,
  livesIframe: 7,
  shopLink: 8,
  mangaLink: 9,
  blank2: 10,
  search: 11,
  userInfo: 12,
  messages: 13,
  activities: 14,
  bangumiLink: 15,
  watchlaterList: 16,
  favoritesList: 17,
  historyList: 18,
  upload: 19,
  blank3: 20,
}
const settings = {
  useDarkStyle: false,
  compactLayout: false,
  // showBanner: true,
  hideBanner: false,
  expandDanmakuList: true,
  expandDescription: true,
  watchLaterRedirect: true,
  touchNavBar: false,
  touchVideoPlayer: false,
  customControlBackgroundOpacity: 0.64,
  customControlBackground: true,
  darkScheduleStart: '18:00',
  darkScheduleEnd: '6:00',
  darkSchedule: false,
  blurVideoControl: false,
  toast: true,
  fullTweetsTitle: true,
  fullPageTitle: false,
  removeVideoTopMask: false,
  removeLiveWatermark: true,
  harunaScale: true,
  removeAds: true,
  hideTopSearch: false,
  touchVideoPlayerDoubleTapControl: false,
  customStyleColor: '#00A0D8',
  preserveRank: true,
  blurBackgroundOpacity: 0.382,
  useDefaultPlayerMode: false,
  applyPlayerModeOnPlay: true,
  defaultPlayerMode: '常规',
  useDefaultVideoQuality: false,
  defaultVideoQuality: '自动',
  useDefaultDanmakuSettings: false,
  enableDanmaku: true,
  rememberDanmakuSettings: false,
  danmakuSettings: {
    subtitlesPreserve: false,
    smartMask: false,
  },
  defaultPlayerLayout: '新版',
  defaultBangumiLayout: '旧版',
  useDefaultPlayerLayout: false,
  skipChargeList: false,
  comboLike: false,
  autoLightOff: false,
  useCache: true,
  autoContinue: false,
  allowJumpContinue: false,
  autoPlay: false,
  showDeadVideoTitle: false,
  deadVideoTitleProvider: '稍后再看',
  useBiliplusRedirect: false,
  biliplusRedirect: false,
  framePlayback: true,
  useCommentStyle: true,
  imageResolution: false,
  imageResolutionScale: 'auto',
  toastInternalError: false,
  i18n: false,
  i18nLanguage: '日本語',
  playerFocus: false,
  playerFocusOffset: -10,
  oldTweets: false,
  simplifyLiveroom: false,
  simplifyLiveroomSettings: {
    vip: true,
    fansMedal: true,
    title: true,
    userLevel: true,
    guard: true,
    systemMessage: true,
    welcomeMessage: true,
    giftMessage: true,
    guardPurchase: true,
    popup: false,
    skin: false,
  },
  customNavbar: true,
  customNavbarFill: true,
  allNavbarFill: true,
  customNavbarShadow: true,
  customNavbarCompact: false,
  customNavbarBlur: false,
  customNavbarBlurOpacity: 0.7,
  customNavbarOrder: { ...customNavbarDefaultOrders },
  customNavbarHidden: ['bangumiLink'],
  customNavbarBoundsPadding: 5,
  playerShadow: false,
  narrowDanmaku: true,
  favoritesRedirect: true,
  outerWatchlater: true,
  hideOldEntry: true,
  videoScreenshot: false,
  hideBangumiReviews: false,
  filenameFormat: '[title][ - ep]',
  sideBarOffset: 0,
  noLiveAutoplay: false,
  hideHomeLive: false,
  noMiniVideoAutoplay: false,
  useDefaultVideoSpeed: false,
  defaultVideoSpeed: '1',
  hideCategory: false,
  foldComment: true,
  downloadVideoDefaultDanmaku: '无',
  aria2RpcOption: {
    secretKey: '',
    dir: '',
    host: '127.0.0.1',
    port: '6800',
    method: 'get',
    skipByDefault: false,
  },
  cache: {},
}
const fixedSettings = {
  guiSettings: true,
  viewCover: true,
  notifyNewVersion: true,
  clearCache: true,
  downloadVideo: true,
  downloadDanmaku: true,
  downloadAudio: true,
  playerLayout: true,
  medalHelper: true,
  about: true,
  forceWide: false,
  useNewStyle: false,
  overrideNavBar: false,
  touchVideoPlayerAnimation: false,
  latestVersionLink: 'https://github.com/the1812/Bilibili-Evolved/raw/master/bilibili-evolved.user.js',
  currentVersion: GM_info.script.version,
}
const settingsChangeHandlers = {}
function addSettingsListener (key, handler, initCall) {
  if (!settingsChangeHandlers[key]) {
    settingsChangeHandlers[key] = [handler]
  } else {
    settingsChangeHandlers[key].push(handler)
  }
  if (initCall) {
    const value = settings[key]
    handler(value, value)
  }
}
function removeSettingsListener (key, handler) {
  const handlers = settingsChangeHandlers[key]
  if (!handlers) {
    return
  }
  handlers.splice(handlers.indexOf(handler), 1)
}
function loadSettings () {
  for (const key in fixedSettings) {
    settings[key] = fixedSettings[key]
    GM_setValue(key, fixedSettings[key])
  }
  if (Object.keys(languageCodeToName).includes(navigator.language)) {
    settings.i18n = true
    settings.i18nLanguage = languageCodeToName[navigator.language]
  }
  for (const key in settings) {
    let value = GM_getValue(key)
    if (value === undefined) {
      value = settings[key]
      GM_setValue(key, settings[key])
    } else if (settings[key] !== undefined && value.constructor === Object) {
      value = Object.assign(settings[key], value)
    }
    Object.defineProperty(settings, key, {
      get () {
        return value
      },
      set (newValue) {
        value = newValue
        GM_setValue(key, newValue)

        const handlers = settingsChangeHandlers[key]
        if (handlers) {
          if (key === 'useDarkStyle') {
            setTimeout(() => handlers.forEach(h => h(newValue, value)), 200)
          } else {
            handlers.forEach(h => h(newValue, value))
          }
        }
        const input = document.querySelector(`input[key=${key}]`)
        if (input !== null) {
          if (input.type === 'checkbox') {
            input.checked = newValue
          } else if (input.type === 'text' && !input.parentElement.classList.contains('gui-settings-dropdown')) {
            input.value = newValue
          }
        }
      }
    })
  }
}
function saveSettings (newSettings) {
}
function onSettingsChange () {
  console.warn('此功能已弃用.')
}

class Ajax {
  static send (xhr, body, text = true) {
    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => resolve(text ? xhr.responseText : xhr.response))
      xhr.addEventListener('error', () => reject(xhr.status))
      xhr.send(body)
    })
  }
  static getBlob (url) {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.open('GET', url)
    return this.send(xhr, undefined, false)
  }
  static getBlobWithCredentials (url) {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.open('GET', url)
    xhr.withCredentials = true
    return this.send(xhr, undefined, false)
  }
  static async getJson (url) {
    return JSON.parse(await this.getText(url))
  }
  static async getJsonWithCredentials (url) {
    return JSON.parse(await this.getTextWithCredentials(url))
  }
  static getText (url) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    return this.send(xhr)
  }
  static getTextWithCredentials (url) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.withCredentials = true
    return this.send(xhr)
  }
  static postText (url, body) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    return this.send(xhr, body)
  }
  static postTextWithCredentials (url, body) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    return this.send(xhr, body)
  }
  static postJson (url, json) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    return this.send(xhr, JSON.stringify(json), false)
  }
  static postJsonWithCredentials (url, json) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/json')
    return this.send(xhr, JSON.stringify(json), false)
  }
  static getHandlers (name) {
    name = name.toLowerCase()
    let handlers = Ajax[name]
    if (handlers === undefined) {
      handlers = Ajax[name] = []
    }
    return handlers
  }
  static addEventListener (type, handler) {
    const handlers = Ajax.getHandlers(type)
    handlers.push(handler)
  }
  static removeEventListener (type, handler) {
    const handlers = Ajax.getHandlers(type)
    handlers.splice(handlers.indexOf(handler), 1)
  }
}
// https://github.com/the1812/Bilibili-Evolved/issues/84
function setupAjaxHook () {
  const original = {
    open: XMLHttpRequest.prototype.open,
    send: XMLHttpRequest.prototype.send
  }
  const fireHandlers = (name, thisArg, ...args) => Ajax.getHandlers(name).forEach(it => it.call(thisArg, ...args))
  const hook = (name, thisArgs, ...args) => {
    fireHandlers('before' + name, thisArgs, ...args)
    const returnValue = original[name].call(thisArgs, ...args)
    fireHandlers('after' + name, thisArgs, ...args)
    return returnValue
  }
  const hookOnEvent = (name, thisArg) => {
    if (thisArg[name]) {
      const originalHandler = thisArg[name]
      thisArg[name] = (...args) => {
        fireHandlers('before' + name, thisArg, ...args)
        originalHandler.apply(thisArg, args)
        fireHandlers('after' + name, thisArg, ...args)
      }
    } else {
      thisArg[name] = (...args) => {
        fireHandlers('before' + name, thisArg, ...args)
        fireHandlers('after' + name, thisArg, ...args)
      }
    }
  }
  XMLHttpRequest.prototype.open = function (...args) { return hook('open', this, ...args) }
  XMLHttpRequest.prototype.send = function (...args) {
    hookOnEvent('onreadystatechange', this)
    hookOnEvent('onload', this)
    return hook('send', this, ...args)
  }
}
function downloadText (url, load, error) // The old method for compatibility
{
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)

  if (load !== undefined) // callback
  {
    xhr.addEventListener('load', () => load && load(xhr.responseText))
    xhr.addEventListener('error', () => error && error(xhr.status))
    xhr.send()
  } else {
    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => resolve(xhr.responseText))
      xhr.addEventListener('error', () => reject(xhr.status))
      xhr.send()
    })
  }
}

function loadResources () {
  Resource.root = 'https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/'
  Resource.all = {}
  Resource.displayNames = {}
  Resource.reloadables = [
    'useDarkStyle',
    'hideBanner',
    'customNavbar',
    'playerShadow',
    'narrowDanmaku',
    'compactLayout',
    'useCommentStyle',
    'removeVideoTopMask',
    'hideOldEntry',
    'hideBangumiReviews',
    'videoScreenshot',
    'blurVideoControl',
    'customControlBackground',
    'harunaScale',
    'removeLiveWatermark',
    'framePlayback',
    'hideCategory',
  ]
  for (const [key, data] of Object.entries(Resource.manifest)) {
    const resource = new Resource(data.path, { styles: data.styles, alwaysPreview: data.alwaysPreview })
    resource.key = key
    resource.dropdown = data.dropdown
    if (data.displayNames) {
      resource.displayName = data.displayNames[key]
      Object.assign(Resource.displayNames, data.displayNames)
    }
    if (data.style) {
      const styleKey = key + 'Style'
      const style = Resource.all[styleKey] = new Resource(data.path.replace('.js', '.css'), { alwaysPreview: data.alwaysPreview })
      style.key = styleKey
      switch (data.style) {
        case 'instant':
        {
          resource.styles.push(styleKey)
          break
        }
        case true:
        {
          resource.dependencies.push(style)
          break
        }
        case 'important':
        {
          resource.styles.push({
            key: styleKey,
            important: true
          })
          break
        }
        default:
        {
          if (typeof data.style === 'object') {
            resource.styles.push(Object.assign({ key: styleKey }, data.style))
          }
          break
        }
      }
    }
    if (data.html === true) {
      const htmlKey = key + 'Html'
      const html = Resource.all[htmlKey] = new Resource(data.path.replace('.js', '.html'), { alwaysPreview: data.alwaysPreview })
      html.key = htmlKey
      resource.dependencies.push(html)
    }
    Resource.all[key] = resource
  }
  for (const [key, data] of Object.entries(Resource.manifest)) {
    if (data.dependencies) {
      Resource.all[key].dependencies.push(...data.dependencies.map(name => Resource.all[name]))
    }
  }
}

// Placeholder class for Toast
class Toast
{
    constructor() { }
    show() { }
    dismiss() { }
    static show() { }
    static info() { }
    static success() { }
    static error() { }
}
class DoubleClickEvent
{
    constructor(handler, singleClickHandler = null)
    {
        this.handler = handler;
        this.singleClickHandler = singleClickHandler;
        this.elements = [];
        this.clickedOnce = false;
        this.doubleClickHandler = e =>
        {
            if (!this.clickedOnce)
            {
                this.clickedOnce = true;
                setTimeout(() =>
                {
                    if (this.clickedOnce)
                    {
                        this.clickedOnce = false;
                        this.singleClickHandler && this.singleClickHandler(e);
                    }
                }, 200);
            }
            else
            {
                this.clickedOnce = false;
                this.handler && this.handler(e);
            }
        };
    }
    bind(element)
    {
        if (this.elements.indexOf(element) === -1)
        {
            this.elements.push(element);
            element.addEventListener("click", this.doubleClickHandler);
        }
    }
    unbind(element)
    {
        const index = this.elements.indexOf(element);
        if (index === -1)
        {
            return;
        }
        this.elements.splice(index, 1);
        element.removeEventListener("click", this.doubleClickHandler);
    }
}
let cidHooked = false
const videoChangeCallbacks = []
class Observer {
  constructor (element, callback) {
    this.element = element
    this.callback = callback
    this.observer = null
    this.options = undefined
  }
  start () {
    if (this.element) {
      this.observer = new MutationObserver(this.callback)
      this.observer.observe(this.element, this.options)
    }
    return this
  }
  stop () {
    this.observer && this.observer.disconnect()
    return this
  }
  static observe (selector, callback, options) {
    callback([])
    let elements = selector
    if (typeof selector === 'string') {
      elements = [...document.querySelectorAll(selector)]
    } else if (!Array.isArray(selector)) {
      elements = [selector]
    }
    return elements.map(
      it => {
        const observer = new Observer(it, callback)
        observer.options = options
        return observer.start()
      })
  }
  static childList (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: true,
      subtree: false,
      attributes: false
    })
  }
  static childListSubtree (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: true,
      subtree: true,
      attributes: false
    })
  }
  static attributes (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: false,
      subtree: false,
      attributes: true
    })
  }
  static attributesSubtree (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: false,
      subtree: true,
      attributes: true
    })
  }
  static all (selector, callback) {
    return Observer.observe(selector, callback, {
      childList: true,
      subtree: true,
      attributes: true
    })
  }
  static async videoChange (callback) {
    const cid = await SpinQuery.select(() => unsafeWindow.cid)
    if (cid === null) {
      return
    }
    if (!cidHooked) {
      let hookedCid = cid
      Object.defineProperty(unsafeWindow, 'cid', {
        get () {
          return hookedCid
        },
        set (newId) {
          hookedCid = newId
          if (!Array.isArray(newId)) {
            videoChangeCallbacks.forEach(it => it())
          }
        }
      })
      cidHooked = true
    }
    // callback();
    const videoContainer = await SpinQuery.select('#bofqi video')
    if (videoContainer) {
      Observer.childList(videoContainer, callback)
    } else {
      callback()
    }
    videoChangeCallbacks.push(callback)
  }
}

class SpinQuery {
  constructor (query, condition, action, failed) {
    this.maxRetry = 15
    this.retry = 0
    this.queryInterval = 1000
    this.query = query
    this.condition = condition
    this.action = action
    this.failed = failed
  }
  start () {
    this.tryQuery(this.query, this.condition, this.action, this.failed)
  }
  tryQuery (query, condition, action, failed) {
    if (this.retry < this.maxRetry) {
      const result = query()
      if (condition(result)) {
        action(result)
      } else {
        if (document.hasFocus()) {
          this.retry++
        }
        setTimeout(() => this.tryQuery(query, condition, action, failed), this.queryInterval)
      }
    } else {
      typeof failed === 'function' && failed()
    }
  }
  static condition (query, condition, action, failed) {
    if (action !== undefined) {
      new SpinQuery(query, condition, action, failed).start()
    } else {
      return new Promise((resolve) => {
        new SpinQuery(query, condition, it => resolve(it), () => resolve(null)).start()
      })
    }
  }
  static select (query, action, failed) {
    if (typeof query === 'string') {
      const selector = query
      query = () => document.querySelector(selector)
    }
    return SpinQuery.condition(query, it => it !== null && it !== undefined, action, failed)
  }
  static any (query, action, failed) {
    if (typeof query === 'string') {
      const selector = query
      query = () => $(selector)
    }
    return SpinQuery.condition(query, it => it.length > 0, action, failed)
  }
  static count (query, count, action, failed) {
    if (typeof query === 'string') {
      const selector = query
      query = () => document.querySelectorAll(selector)
    }
    return SpinQuery.condition(query, it => it.length === count, action, failed)
  }
  static unsafeJquery (action, failed) {
    return SpinQuery.condition(() => unsafeWindow.$, jquery => jquery !== undefined, action, failed)
  }
}

class ColorProcessor
{
    constructor(hex)
    {
        this.hex = hex;
    }
    get rgb()
    {
        return this.hexToRgb(this.hex);
    }
    get rgba()
    {
        return this.hexToRgba(this.hex);
    }
    getHexRegex(alpha, shorthand)
    {
        const repeat = shorthand ? "" : "{2}";
        const part = `([a-f\\d]${repeat})`;
        const count = alpha ? 4 : 3;
        const pattern = `#?${part.repeat(count)}`;
        return new RegExp(pattern, "ig");
    }
    hexToRgbOrRgba(hex, alpha)
    {
        const isShortHand = hex.length < 6;
        if (isShortHand)
        {
            const shorthandRegex = this.getHexRegex(alpha, true);
            hex = hex.replace(shorthandRegex, function (...args)
            {
                let result = "";
                let i = 1;
                while (args[i])
                {
                    result += args[i].repeat(2);
                    i++;
                }
                return result;
            });
        }

        const regex = this.getHexRegex(alpha, false);
        const regexResult = regex.exec(hex);
        if (regexResult)
        {
            const color = {
                r: parseInt(regexResult[1], 16),
                g: parseInt(regexResult[2], 16),
                b: parseInt(regexResult[3], 16),
            };
            if (regexResult[4])
            {
                color.a = parseInt(regexResult[4], 16) / 255;
            }
            return color;
        }
        else if (alpha)
        {
            const rgb = this.hexToRgbOrRgba(hex, false);
            if (rgb)
            {
                rgb.a = 1;
                return rgb;
            }
        }
        return null;
    }
    hexToRgb(hex)
    {
        return this.hexToRgbOrRgba(hex, false);
    }
    hexToRgba(hex)
    {
        return this.hexToRgbOrRgba(hex, true);
    }
    rgbToString(color)
    {
        if (color.a)
        {
            return `rgba(${color.r},${color.g},${color.b},${color.a})`;
        }
        return `rgb(${color.r},${color.g},${color.b})`;
    }
    rgbToHsb(rgb)
    {
        const { r, g, b, } = rgb;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        const s = Math.round((max === 0 ? 0 : delta / max) * 100);
        const v = Math.round(max / 255 * 100);

        let h;
        if (delta === 0)
        {
            h = 0;
        }
        else if (r === max)
        {
            h = (g - b) / delta % 6;
        }
        else if (g === max)
        {
            h = (b - r) / delta + 2;
        }
        else if (b === max)
        {
            h = (r - g) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0)
        {
            h += 360;
        }

        return { h: h, s: s, b: v, };
    }
    get hsb()
    {
        return this.rgbToHsb(this.rgb);
    }
    get grey()
    {
        const color = this.rgb;
        return 1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
    }
    get foreground()
    {
        const color = this.rgb;
        if (color && this.grey < 0.35)
        {
            return "#000";
        }
        return "#fff";
    }
    makeImageFilter(originalRgb)
    {
        const { h, s, } = this.rgbToHsb(originalRgb);
        const targetColor = this.hsb;

        const hue = targetColor.h - h;
        const saturate = ((targetColor.s - s) / 100 + 1) * 100;
        // const brightness = ((targetColor.b - b) / 100 + 1) * 100;
        const filter = `hue-rotate(${hue}deg) saturate(${saturate}%)`;
        return filter;
    }
    get blueImageFilter()
    {
        const blueColor = {
            r: 0,
            g: 160,
            b: 213,
        };
        return this.makeImageFilter(blueColor);
    }
    get pinkImageFilter()
    {
        const pinkColor = {
            r: 251,
            g: 113,
            b: 152,
        };
        return this.makeImageFilter(pinkColor);
    }
    get brightness()
    {
        return `${this.foreground === "#000" ? "100" : "0"}%`;
    }
    get filterInvert()
    {
        return this.foreground === "#000" ? "invert(0)" : "invert(1)";
    }
}
// [Offline build placeholder]
class ResourceType
{
    constructor(name, preprocessor)
    {
        this.name = name;
        this.preprocessor = preprocessor || (text => text);
    }
    static fromUrl(url)
    {
        if (url.indexOf(".css") !== -1)
        {
            return this.style;
        }
        else if (url.indexOf(".html") !== -1 || url.indexOf(".htm") !== -1)
        {
            return this.html;
        }
        else if (url.indexOf(".js") !== -1)
        {
            return this.script;
        }
        else if (url.indexOf(".txt") !== -1)
        {
            return this.text;
        }
        else
        {
            return this.unknown;
        }
    }
    static get style()
    {
        return new ResourceType("style");
    }
    static get html()
    {
        return new ResourceType("html");
    }
    static get script()
    {
        return new ResourceType("script");
    }
    static get text()
    {
        return new ResourceType("text");
    }
    static get unknown()
    {
        return new ResourceType("unknown");
    }
}
class Resource
{
    get downloaded()
    {
        return this.text !== null;
    }
    constructor(url, { styles = [], alwaysPreview = false } = {})
    {
        this.rawUrl = Resource.root + "min/" + url;
        this.dependencies = [];
        // this.priority = priority;
        this.styles = styles;
        this.text = null;
        this.key = null;
        this.alwaysPreview = alwaysPreview;
        this.type = ResourceType.fromUrl(url);
        this.displayName = "";
    }
    get url()
    {
        if (typeof offlineData === "undefined" && this.alwaysPreview)
        {
            return this.rawUrl.replace("/master/", "/preview/");
        }
        return this.rawUrl;
    }
    flatMapPolyfill()
    {
        if (Array.prototype.flatMap === undefined)
        {
            const flatMap = function (mapFunc)
            {
                return this
                    .map(mapFunc)
                    .reduce((acc, it) => acc.concat(it), []);
            };
            return flatMap;
        }
        else
        {
            return Array.prototype.flatMap;
        }
    }
    loadCache()
    {
        const key = this.key;
        if (!settings.cache || !settings.cache[key])
        {
            return null;
        }
        else
        {
            return settings.cache[key];
        }
    }
    async download()
    {
        const key = this.key;
        return new Promise((resolve, reject) =>
        {
            if (this.downloaded)
            {
                resolve(this.text);
            }
            else
            {
                const flattenStyles = this.flatMapPolyfill()
                    .bind(this.styles)(it => typeof it === "object" ? it.key : it);
                Promise.all(this.dependencies
                    .concat(flattenStyles.map(it => Resource.all[it]))
                    .map(r => r.download())
                )
                    .then(() =>
                    {
                        // +#Offline build placeholder
                        if (settings.useCache)
                        {
                            const cache = this.loadCache(key);
                            if (cache !== null)
                            {
                                this.text = cache;
                                resolve(cache);
                            }
                            Ajax.getText(this.url).then(text =>
                            {
                                this.text = this.type.preprocessor(text);
                                if (text === null)
                                {
                                    reject("download failed");
                                }
                                if (cache !== this.text)
                                {
                                    if (cache === null)
                                    {
                                        resolve(this.text);
                                    }
                                    if (typeof offlineData === "undefined")
                                    {
                                        settings.cache = Object.assign(settings.cache, {
                                            [key]: this.text
                                        });
                                        saveSettings(settings);
                                    }
                                }
                            }).catch(error => reject(error));
                        }
                        else
                        {
                            Ajax.getText(this.url)
                                .then(text =>
                                {
                                    this.text = this.type.preprocessor(text);
                                    resolve(this.text);
                                })
                                .catch(error => reject(error));
                        }
                        // -#Offline build placeholder
                    });
            }
        });
    }
    getStyle(id)
    {
        const style = this.text;
        if (style === null)
        {
            logError("Attempt to get style which is not downloaded.");
        }
        // let attributes = `id='${id}'`;
        // if (this.priority !== undefined)
        // {
        //     attributes += ` priority='${this.priority}'`;
        // }
        // return `<style ${attributes}>${style}</style>`;
        const styleElement = document.createElement("style");
        styleElement.id = id;
        styleElement.innerText = style;
        return styleElement;
    }
    getPriorStyle()
    {
        if (this.priority !== undefined)
        {
            let insertPosition = this.priority - 1;
            let formerStyle = $(`style[priority='${insertPosition}']`);
            while (insertPosition >= 0 && formerStyle.length === 0)
            {
                formerStyle = $(`style[priority='${insertPosition}']`);
                insertPosition--;
            }
            if (insertPosition < 0)
            {
                return null;
            }
            else
            {
                return formerStyle;
            }
        }
        else
        {
            return null;
        }
    }
    applyStyle(id, important)
    {
        if (!document.querySelector(`#${id}`))
        {
            const style = this.getStyle(id);
            // const priorStyle = this.getPriorStyle();
            // if (priorStyle === null)
            // {
            //     if (important)
            //     {
            //         $("html").append(element);
            //     }
            //     else
            //     {
            //         $("head").prepend(element);
            //     }
            // }
            // else
            // {
            //     priorStyle.after(element);
            // }
            if (important)
            {
                document.body.insertAdjacentElement("beforeend", style);
            }
            else
            {
                document.head.insertAdjacentElement("afterbegin", style);
            }
        }
    }
}
Resource.manifest = {
  style: {
    path: 'style.min.css'
  },
  oldStyle: {
    path: 'old.min.css'
  },
  scrollbarStyle: {
    path: 'scrollbar.min.css'
  },
  darkStyle: {
    path: 'dark.min.css',
    alwaysPreview: true
  },
  darkStyleImportant: {
    path: 'dark-important.min.css',
    alwaysPreview: true
  },
  darkStyleNavBar: {
    path: 'dark-navbar.min.css',
    alwaysPreview: true
  },
  touchPlayerStyle: {
    path: 'touch-player.min.css'
  },
  navbarOverrideStyle: {
    path: 'override-navbar.min.css'
  },
  noBannerStyle: {
    path: 'no-banner.min.css'
  },
  imageViewerStyle: {
    path: 'image-viewer.min.css'
  },
  imageViewerHtml: {
    path: 'image-viewer.min.html'
  },
  iconsStyle: {
    path: 'icons.min.css'
  },
  settingsSideBar: {
    path: 'settings-side-bar.min.js'
  },
  textValidate: {
    path: 'text-validate.min.js'
  },
  themeColors: {
    path: 'theme-colors.min.js'
  },
  settingsTooltipStyle: {
    path: 'settings-tooltip.min.css'
  },
  settingsTooltipJapanese: {
    path: 'settings-tooltip.ja-JP.min.js'
  },
  settingsTooltipChinese: {
    path: 'settings-tooltip.zh-CN.min.js'
  },
  settingsTooltipEnglish: {
    path: 'settings-tooltip.en-US.min.js'
  },
  settingsTooltip: {
    path: 'settings-tooltip.loader.min.js',
    dependencies: [
      'settingsTooltipStyle'
    ]
  },
  settingsSearch: {
    path: 'settings-search.min.js'
  },
  guiSettings: {
    path: 'gui-settings.min.js',
    html: true,
    style: 'instant',
    dependencies: [
      'textValidate',
      'settingsSideBar',
      'themeColors',
      'settingsTooltip',
      'settingsSearch'
    ],
    styles: [
      {
        key: 'iconsStyle',
        important: true
      }
    ],
    displayNames: {
      guiSettings: '设置',
      blurSettingsPanel: '模糊设置面板背景',
      clearCache: '清除缓存',
      settingsTooltip: '设置项帮助',
      settingsSearch: '搜索设置',
      sideBarOffset: '侧栏垂直偏移量'
    }
  },
  useDarkStyle: {
    path: 'dark-styles.min.js',
    alwaysPreview: true,
    styles: [
      'darkStyle',
      'scrollbarStyle',
      {
        key: 'darkStyleNavBar',
        important: true,
        condition () {
          return !settings.useNewStyle && ($('#banner_link').length === 0 ||
            $('#banner_link').length > 0 &&
            settings.overrideNavBar &&
            !settings.showBanner)
        }
      },
      {
        key: 'darkStyleImportant',
        important: true,
        condition: () => true
      }
    ],
    displayNames: {
      useDarkStyle: '夜间模式'
    }
  },
  tweetsStyle: {
    path: 'tweets.min.css'
  },
  useNewStyle: {
    path: 'new-styles.min.js',
    dependencies: [
      'style',
      'oldStyle'
    ],
    styles: [
      'tweetsStyle',
      {
        key: 'scrollbarStyle',
        condition: () => document.URL !== `https://h.bilibili.com/`
      }
    ],
    displayNames: {
      useNewStyle: '样式调整',
      blurBackgroundOpacity: '顶栏(对横幅)透明度'
    }
  },
  hideBanner: {
    path: 'hide-banner.min.js',
    style: true,
    displayNames: {
      hideBanner: '隐藏顶部横幅'
    }
  },
  touchNavBar: {
    path: 'touch-navbar.min.js',
    displayNames: {
      touchNavBar: '顶栏触摸优化'
    }
  },
  touchVideoPlayer: {
    path: 'touch-player.min.js',
    styles: [
      'touchPlayerStyle'
    ],
    displayNames: {
      touchVideoPlayer: '播放器触摸支持',
      touchVideoPlayerAnimation: '启用实验性动画效果',
      touchVideoPlayerDoubleTapControl: '启用双击控制'
    }
  },
  expandDanmakuList: {
    path: 'expand-danmaku.min.js',
    displayNames: {
      expandDanmakuList: '自动展开弹幕列表'
    }
  },
  removeAds: {
    path: 'remove-promotions.min.js',
    style: 'instant',
    displayNames: {
      removeAds: '删除广告'
    }
  },
  watchLaterRedirect: {
    path: 'watchlater.min.js',
    displayNames: {
      watchLaterRedirect: '稍后再看重定向'
    }
  },
  hideTopSearch: {
    path: 'hide-top-search.min.js',
    displayNames: {
      hideTopSearch: '隐藏搜索推荐'
    }
  },
  harunaScale: {
    path: 'haruna-scale.min.js',
    displayNames: {
      harunaScale: '缩放直播看板娘'
    }
  },
  removeLiveWatermark: {
    path: 'remove-watermark.min.js',
    displayNames: {
      removeLiveWatermark: '删除直播水印'
    }
  },
  fullTweetsTitle: {
    path: 'full-tweets-title.min.js',
    style: 'instant',
    displayNames: {
      fullTweetsTitle: '展开动态标题'
    }
  },
  fullPageTitle: {
    path: 'full-page-title.min.js',
    style: 'instant',
    displayNames: {
      fullPageTitle: '展开选集标题'
    }
  },
  viewCover: {
    path: 'view-cover.min.js',
    dependencies: [
      'imageViewerHtml',
      'videoInfo',
      'title'
    ],
    styles: [
      'imageViewerStyle'
    ],
    displayNames: {
      viewCover: '查看封面'
    }
  },
  notifyNewVersion: {
    path: 'notify-new-version.min.js',
    displayNames: {
      notifyNewVersion: '检查更新'
    }
  },
  toast: {
    path: 'toast.min.js',
    style: 'instant',
    displayNames: {
      toast: '显示消息',
      toastInternalError: '显示内部错误消息'
    }
  },
  removeVideoTopMask: {
    path: 'remove-top-mask.min.js',
    displayNames: {
      removeVideoTopMask: '删除视频标题层'
    }
  },
  blurVideoControl: {
    path: 'blur-video-control.min.js',
    style: 'instant',
    displayNames: {
      blurVideoControl: '模糊视频控制栏背景'
    }
  },
  darkSchedule: {
    path: 'dark-schedule.min.js',
    displayNames: {
      darkSchedule: '夜间模式计划时段',
      darkScheduleStart: '起始时间',
      darkScheduleEnd: '结束时间'
    }
  },
  clearCache: {
    path: 'clear-cache.min.js',
    displayNames: {
      useCache: '启用缓存'
    }
  },
  downloadVideo: {
    path: 'download-video.min.js',
    html: true,
    style: 'instant',
    dependencies: ['title'],
    displayNames: {
      'downloadVideo': '下载视频',
      'batchDownload': '批量下载',
      'aria2Rpc': 'aria2 RPC',
    }
  },
  downloadDanmaku: {
    path: 'download-danmaku.min.js',
    dependencies: [
      'title',
      'videoInfo',
      'danmakuConverter'
    ],
    displayNames: {
      'downloadDanmaku': '下载弹幕'
    }
  },
  danmakuConverter: {
    path: 'danmaku-converter.min.js'
  },
  videoInfo: {
    path: 'video-info.min.js'
  },
  videoStory: {
    path: 'video-story.min.js'
  },
  about: {
    path: 'about.min.js',
    html: true,
    style: 'important',
    displayNames: {
      'about': '关于'
    }
  },
  customControlBackground: {
    path: 'custom-control-background.min.js',
    style: {
      key: 'customControlBackgroundStyle',
      condition: () => settings.customControlBackgroundOpacity > 0
    },
    displayNames: {
      customControlBackground: '控制栏着色',
      customControlBackgroundOpacity: '不透明度'
    }
  },
  useDefaultPlayerMode: {
    path: 'default-player-mode.min.js',
    displayNames: {
      useDefaultPlayerMode: '使用默认播放器模式',
      defaultPlayerMode: '默认播放器模式',
      autoLightOff: '播放时自动关灯',
      applyPlayerModeOnPlay: '播放时应用模式'
    },
    dropdown: {
      key: 'defaultPlayerMode',
      items: ['常规', '宽屏', '网页全屏', '全屏']
    }
  },
  useDefaultVideoQuality: {
    path: 'default-video-quality.min.js',
    displayNames: {
      useDefaultVideoQuality: '使用默认视频画质',
      defaultVideoQuality: '画质设定'
    },
    dropdown: {
      key: 'defaultVideoQuality',
      items: ['1080P60', '1080P+', '1080P', '720P60', '720P', '480P', '360P', '自动']
    }
  },
  comboLike: {
    path: 'combo-like.min.js',
    displayNames: {
      comboLike: '素质三连触摸支持'
    }
  },
  autoContinue: {
    path: 'auto-continue.min.js',
    displayNames: {
      autoContinue: '自动从历史记录点播放',
      allowJumpContinue: '允许跨集跳转'
    }
  },
  expandDescription: {
    path: 'expand-description.min.js',
    style: 'instant',
    displayNames: {
      expandDescription: '自动展开视频简介'
    }
  },
  defaultDanmakuSettingsStyle: {
    path: 'default-danmaku-settings.min.css'
  },
  useDefaultDanmakuSettings: {
    path: 'default-danmaku-settings.min.js',
    styles: [
      {
        key: 'defaultDanmakuSettingsStyle',
        condition: () => settings.rememberDanmakuSettings
      }
    ],
    displayNames: {
      useDefaultDanmakuSettings: '使用默认弹幕设置',
      enableDanmaku: '开启弹幕',
      rememberDanmakuSettings: '记住弹幕设置'
    }
  },
  skipChargeList: {
    path: 'skip-charge-list.min.js',
    style: 'instant',
    displayNames: {
      skipChargeList: '跳过充电鸣谢'
    }
  },
  playerLayout: {
    path: 'default-player-layout.min.js',
    displayNames: {
      useDefaultPlayerLayout: '指定播放器布局',
      defaultPlayerLayout: '视频区布局',
      defaultBangumiLayout: '番剧区布局'
    },
    dropdown: [
      {
        key: 'defaultPlayerLayout',
        items: ['旧版', '新版']
      },
      {
        key: 'defaultBangumiLayout',
        items: ['旧版', '新版']
      }
    ]
  },
  compactLayout: {
    path: 'compact-layout.min.js',
    style: true,
    displayNames: {
      compactLayout: '首页使用紧凑布局'
    }
  },
  medalHelper: {
    path: 'medal-helper.min.js',
    html: true,
    style: 'instant',
    displayNames: {
      medalHelper: '直播勋章快速更换'
    }
  },
  showDeadVideoTitle: {
    path: 'show-dead-video-title.min.js',
    displayNames: {
      showDeadVideoTitle: '显示失效视频信息',
      useBiliplusRedirect: '失效视频重定向',
      deadVideoTitleProvider: '信息来源',
    },
    dropdown: {
      key: 'deadVideoTitleProvider',
      items: ['稍后再看'],
    },
  },
  autoPlay: {
    path: 'auto-play.min.js',
    displayNames: {
      autoPlay: '自动播放视频'
    }
  },
  useCommentStyle: {
    path: 'comment.min.js',
    style: 'important',
    displayNames: {
      useCommentStyle: '简化评论区'
    }
  },
  title: {
    path: 'title.min.js',
    displayNames: {
      filenameFormat: '文件命名格式'
    }
  },
  imageResolution: {
    path: 'image-resolution.min.js',
    displayNames: {
      imageResolution: '高分辨率图片'
    }
  },
  biliplusRedirect: {
    path: 'biliplus-redirect.min.js',
    displayNames: {
      biliplusRedirect: 'BiliPlus跳转支持'
    }
  },
  framePlayback: {
    path: 'frame-playback.min.js',
    style: 'instant',
    html: true,
    displayNames: {
      framePlayback: '启用逐帧调整'
    }
  },
  downloadAudio: {
    path: 'download-audio.min.js',
    displayNames: {
      downloadAudio: '下载音频'
    }
  },
  i18nEnglish: {
    path: 'i18n.en-US.min.js',
    alwaysPreview: true
  },
  i18nJapanese: {
    path: 'i18n.ja-JP.min.js',
    alwaysPreview: true
  },
  i18nTraditionalChinese: {
    path: 'i18n.zh-TW.min.js',
    alwaysPreview: true
  },
  i18nGerman: {
    path: 'i18n.de-DE.min.js',
    alwaysPreview: true
  },
  i18n: {
    path: 'i18n.min.js',
    alwaysPreview: true,
    style: 'important',
    displayNames: {
      i18n: '界面翻译',
      i18nLanguage: '语言',
      i18nEnglish: '英语翻译模块',
      i18nJapanese: '日语翻译模块',
      i18nGerman: '德语翻译模块',
      i18nTraditionalChinese: '繁体翻译模块'
    },
    dropdown: {
      key: 'i18nLanguage',
      // items: Object.keys(languageCodeMap),
      items: [`日本語`, `English`]
    }
  },
  playerFocus: {
    path: 'player-focus.min.js',
    displayNames: {
      playerFocus: '自动定位到播放器',
      playerFocusOffset: '定位偏移量'
    }
  },
  simplifyLiveroom: {
    path: 'simplify-liveroom.min.js',
    style: 'important',
    displayNames: {
      simplifyLiveroom: '简化直播间'
    }
  },
  oldTweets: {
    path: 'old-tweets.min.js',
    displayNames: {
      oldTweets: '旧版动态跳转支持'
    }
  },
  customNavbar: {
    path: 'custom-navbar.min.js',
    style: 'instant',
    html: true,
    displayNames: {
      customNavbar: '使用自定义顶栏',
      customNavbarFill: '主题色填充',
      customNavbarShadow: '投影',
      customNavbarCompact: '紧凑布局',
      customNavbarBlur: '背景模糊',
      customNavbarBlurOpacity: '模糊层不透明度',
      allNavbarFill: '填充其他顶栏'
    }
  },
  favoritesRedirect: {
    path: 'favorites-redirect.min.js',
    displayNames: {
      favoritesRedirect: '收藏夹视频重定向'
    }
  },
  outerWatchlater: {
    path: 'outer-watchlater.min.js',
    style: 'important',
    displayNames: {
      outerWatchlater: '外置稍后再看'
    }
  },
  playerShadow: {
    path: 'player-shadow.min.js',
    displayNames: {
      playerShadow: '播放器投影'
    }
  },
  narrowDanmaku: {
    path: 'narrow-danmaku.min.js',
    displayNames: {
      narrowDanmaku: '强制保留弹幕栏'
    }
  },
  hideOldEntry: {
    path: 'hide-old-entry.min.js',
    displayNames: {
      hideOldEntry: '隐藏返回旧版'
    }
  },
  batchDownload: {
    path: 'batch-download.min.js'
  },
  slip: {
    path: 'slip.min.js',
    displayNames: {
      slip: 'Slip.js'
    }
  },
  debounce: {
    path: 'debounce.min.js',
    displayNames: {
      slip: 'debounce.js'
    }
  },
  videoScreenshot: {
    path: 'screenshot.min.js',
    style: true,
    displayNames: {
      videoScreenshot: '启用视频截图'
    },
    dependencies: [
      'title'
    ]
  },
  hideBangumiReviews: {
    path: 'hide-bangumi-reviews.min.js',
    displayNames: {
      hideBangumiReviews: '隐藏番剧点评'
    }
  },
  noLiveAutoplay: {
    path: 'no-live-autoplay.min.js',
    displayNames: {
      noLiveAutoplay: '禁止直播首页自动播放',
      hideHomeLive: '隐藏首页推荐直播',
    }
  },
  noMiniVideoAutoplay: {
    path: 'no-mini-video-autoplay.min.js',
    displayNames: {
      noMiniVideoAutoplay: '禁止小视频自动播放',
    }
  },
  hideCategory: {
    path: 'hide-category.min.js',
    displayNames: {
      hideCategory: '隐藏分区栏',
    },
  },
  foldComment: {
    path: 'fold-comment.min.js',
    style: true,
    displayNames: {
      foldComment: '快速收起动态评论区',
    },
  },
  useDefaultVideoSpeed: {
    path: 'default-video-speed.min.js',
    displayNames: {
      useDefaultVideoSpeed: '使用默认播放速度',
      defaultVideoSpeed: '默认播放速度',
    },
    dropdown: {
      key: 'defaultVideoSpeed',
      items: ['0.5', '0.75', '1', '1.25', '1.5', '2.0'],
    }
  },
  aria2Rpc: {
    path: 'aria2-rpc.min.js',
  },
}
const resourceManifest = Resource.manifest

class StyleManager
{
    constructor(resources)
    {
        this.resources = resources;
    }
    getDefaultStyleId(key)
    {
        return key.replace(/([a-z][A-Z])/g,
            g => `${g[0]}-${g[1].toLowerCase()}`);
    }
    applyStyle(key, id)
    {
        if (id === undefined)
        {
            id = this.getDefaultStyleId(key);
        }
        Resource.all[key].applyStyle(id, false);
    }
    removeStyle(key)
    {
        const style = document.querySelector(`#${this.getDefaultStyleId(key)}`);
        style && style.remove();
    }
    applyImportantStyle(key, id)
    {
        if (id === undefined)
        {
            id = this.getDefaultStyleId(key);
        }
        Resource.all[key].applyStyle(id, true);
    }
    applyStyleFromText(text, id)
    {
        if (!id)
        {
            document.head.insertAdjacentHTML("afterbegin", text);
        }
        else
        {
            const style = document.createElement("style");
            style.id = id;
            style.innerText = text;
            document.head.insertAdjacentElement("afterbegin", style);
        }
    }
    applyImportantStyleFromText(text, id)
    {
        if (!id)
        {
            document.body.insertAdjacentHTML("beforeend", text);
        }
        else
        {
            const style = document.createElement("style");
            style.id = id;
            style.innerText = text;
            document.body.insertAdjacentElement("beforeend", style);
        }
    }
    getStyle(key, id)
    {
        return Resource.all[key].getStyle(id);
    }
    fetchStyleByKey(key)
    {
        if (settings[key] !== true)
        {
            return;
        }
        Resource.all[key].styles
            .filter(it => it.condition !== undefined ? it.condition() : true)
            .forEach(it =>
            {
                const important = typeof it === "object" ? it.important : false;
                const key = typeof it === "object" ? it.key : it;
                Resource.all[key].download().then(() =>
                {
                    if (important)
                    {
                        contentLoaded(() => this.applyImportantStyle(key));
                    }
                    else
                    {
                        this.applyStyle(key);
                    }
                });
            });
    }
    prefetchStyles()
    {
        for (const key in Resource.all)
        {
            if (typeof offlineData !== "undefined" || settings.useCache && settings.cache[key])
            {
                this.fetchStyleByKey(key);
            }
        }
    }
}
class ResourceManager {
  constructor () {
    this.data = Resource.all
    this.skippedImport = []
    this.attributes = {}
    this.styleManager = new StyleManager(this)
    const styleMethods = Object.getOwnPropertyNames(StyleManager.prototype).filter(it => it !== 'constructor')
    for (const key of styleMethods) {
      this[key] = function (...params) {
        this.styleManager[key](...params)
      }
    }
    this.setupColors()
  }
  setupColors () {
    this.color = new ColorProcessor(settings.customStyleColor)
    settings.foreground = this.color.foreground
    settings.blueImageFilter = this.color.blueImageFilter
    settings.pinkImageFilter = this.color.pinkImageFilter
    settings.brightness = this.color.brightness
    settings.filterInvert = this.color.filterInvert

    const hexToRgba = input => this.color.rgbToString(this.color.hexToRgba(input))
    let styles = []
    styles.push('--theme-color:' + settings.customStyleColor)
    for (let opacity = 10; opacity <= 90; opacity += 10) {
      const color = this.color.hexToRgba(settings.customStyleColor)
      color.a = opacity / 100
      styles.push(`--theme-color-${opacity}:` + this.color.rgbToString(color))
    }
    styles.push('--foreground-color:' + settings.foreground)
    styles.push('--foreground-color-b:' + hexToRgba(settings.foreground + 'b'))
    styles.push('--foreground-color-d:' + hexToRgba(settings.foreground + 'd'))
    styles.push('--blue-image-filter:' + settings.blueImageFilter)
    styles.push('--pink-image-filter:' + settings.pinkImageFilter)
    styles.push('--brightness:' + settings.brightness)
    styles.push('--invert-filter:' + settings.filterInvert)
    styles.push('--blur-background-opacity:' + settings.blurBackgroundOpacity)
    // styles.push("--custom-control-background-opacity:" + settings.customControlBackgroundOpacity);
    this.applyStyleFromText(`html{${styles.join(';')}}`, 'bilibili-evolved-variables')
  }
  resolveComponentName (componentName) {
    const keyword = '/' + componentName.replace('./', '').replace('../', '') + '.min.js'
    for (const [name, value] of Object.entries(Resource.all)) {
      if (value.url.endsWith(keyword)) {
        return name
      }
    }
    return componentName
  }
  resolveComponent (componentName) {
    const resource = Resource.all[this.resolveComponentName(componentName)]
    if (!resource) {
      this.skippedImport.push(componentName)
    }
    return resource
  }
  importAsync (componentName) {
    return new Promise(resolve => {
      const resource = this.resolveComponent(componentName)
      if (!resource) {
        resolve(unsafeWindow.bilibiliEvolved)
      }
      if (!Object.keys(this.attributes).includes(resource.key)) {
        if (resource.type.name === 'html' || resource.type.name === 'style') {
          resource.download().then(() => resolve(this.import(componentName)))
        } else {
          this.fetchByKey(resource.key).then(() => resolve(this.import(componentName)))
        }
      } else {
        resolve(this.import(componentName))
      }
    })
  }
  import (componentName) {
    const resource = this.resolveComponent(componentName)
    if (!resource) {
      return unsafeWindow.bilibiliEvolved
    }
    if (resource.type.name === 'html' || resource.type.name === 'style') {
      if (!resource.downloaded) {
        console.error(`Import failed: component "${componentName}" is not loaded.`)
        return null
      }
      return resource.text
    } else {
      const attribute = this.attributes[this.resolveComponentName(componentName)]
      if (attribute === undefined) {
        console.error(`Import failed: component "${componentName}" is not loaded.`)
        return null
      }
      return attribute.export
    }
  }
  async fetchByKey (key) {
    const resource = Resource.all[key]
    if (!resource) {
      return null
    }
    const text = await resource.download().catch(reason => {
      console.error(`Download error, XHR status: ${reason}`)
      let toastMessage = `无法下载组件<span>${Resource.all[key].displayName}</span>`
      if (settings.toastInternalError) {
        toastMessage += '\n' + reason
      }
      Toast.error(toastMessage, '错误')
    })
    await Promise.all(resource.dependencies
      .filter(it => it.type.name === 'style')
      .map(it => this.styleManager.fetchStyleByKey(it.key)))
    await Promise.all(resource.dependencies
      .filter(it => it.type.name === 'script')
      .map(it => this.fetchByKey(it.key)))
    this.applyComponent(key, text)
  }
  async fetch () {
    const isCacheValid = this.validateCache()
    let loadingToast = null
    if (settings.toast === true) {
      await this.fetchByKey('toast')
      unsafeWindow.bilibiliEvolved.Toast = Toast = this.attributes.toast.export.Toast || this.attributes.toast.export
      if (!isCacheValid && settings.useCache) {
        loadingToast = Toast.info(/* html */`<div class="loading"></div>正在初始化脚本`, '初始化')
      }
    }
    const promises = []
    for (const key in settings) {
      if (settings[key] === true && key !== 'toast') {
        const promise = this.fetchByKey(key)
        if (promise) {
          promises.push(promise)
        }
      }
    }
    await Promise.all(promises)
    saveSettings(settings)
    if (loadingToast) {
      loadingToast.dismiss()
    }
    this.applyReloadables() // reloadables run sync
    // await this.applyDropdownOptions();
    this.applyWidgets() // No need to wait the widgets
  }
  applyReloadables () {
    const checkAttribute = (key, attributes) => {
      if (attributes.reload && attributes.unload) {
        addSettingsListener(key, newValue => {
          if (newValue === true) {
            attributes.reload()
          } else {
            attributes.unload()
          }
        })
      }
    }
    for (const key of Resource.reloadables) {
      const attributes = this.attributes[key]
      if (attributes === undefined) {
        const fetchListener = async newValue => {
          if (newValue === true) {
            await this.styleManager.fetchStyleByKey(key)
            await this.fetchByKey(key)
            removeSettingsListener(key, fetchListener)
            checkAttribute(key, this.attributes[key])
          }
        }
        addSettingsListener(key, fetchListener)
      } else {
        checkAttribute(key, attributes)
      }
    }
  }
  applyComponent (key, text) {
    const func = eval(text)
    if (func) {
      try {
        const attribute = func(settings, this) || {}
        this.attributes[key] = attribute
      } catch (error) {
        console.error(`Failed to apply feature "${key}": ${error}`)
        let toastMessage = `加载组件<span>${Resource.all[key].displayName}</span>失败`
        if (settings.toastInternalError) {
          toastMessage += '\n' + error
        }
        Toast.error(toastMessage, '错误')
      }
    }
  }
  async applyWidget (info) {
    let condition = true
    if (typeof info.condition === 'function') {
      condition = info.condition()
      if (typeof condition === 'object' && 'then' in condition) {
        condition = await condition.catch(() => { return false })
      }
    }
    if (condition === true) {
      if (info.content) {
        document.querySelector('.widgets-container').insertAdjacentHTML('beforeend', info.content)
      }
      if (info.success) {
        info.success()
      }
    }
  }
  async applyWidgets () {
    await Promise.all(Object.values(this.attributes)
      .filter(it => it.widget)
      .map(it => this.applyWidget(it.widget))
    )
  }
  async applyDropdownOptions () {
    async function applyDropdownOption (info) {
      if (Array.isArray(info)) {
        await Promise.all(info.map(applyDropdownOption))
      } else {
        const dropdownInput = dq(`.gui-settings-dropdown input[key=${info.key}]`)
        dropdownInput.value = settings[info.key]
        dropdownInput.setAttribute('data-name', settings[info.key])
        const dropdown = dropdownInput.parentElement
        const list = dropdown.querySelector('ul')
        const input = dropdown.querySelector('input')
        info.items.forEach(itemHtml => {
          list.insertAdjacentHTML('beforeend', `<li data-name="${itemHtml}">${itemHtml}</li>`)
        })
        list.querySelectorAll('li').forEach(li => li.addEventListener('click', () => {
          input.value = li.innerText
          input.setAttribute('data-name', li.getAttribute('data-name'))
          settings[info.key] = li.getAttribute('data-name')
        }))
      }
    }
    const manifests = Object.values(Resource.manifest).filter(it => it.dropdown).map(it => it.dropdown)
    Object.values(Resource.all)
      // .concat(Object.values(this.attributes))
      .filter(it => it.dropdown)
      .map(it => it.dropdown)
      .forEach(it => {
        if (!manifests.some(m => m.key === it.key)) {
          manifests.push(it)
        }
      })
    await Promise.all(manifests.map(it => applyDropdownOption(it)))
  }
  toggleStyle (content, id) {
    if (id === undefined) { // content is resource name
      this.styleManager.applyStyle(content)
      return {
        reload: () => this.styleManager.applyStyle(content),
        unload: () => this.styleManager.removeStyle(content)
      }
    } else { // content is style text
      this.styleManager.applyStyleFromText(content, id)
      return {
        reload: () => this.styleManager.applyStyleFromText(content, id),
        unload: () => document.getElementById(id).remove()
      }
    }
  }
  validateCache () {
    if (typeof offlineData !== 'undefined') { // offline version always has cache
      return true
    }
    if (Object.getOwnPropertyNames(settings.cache).length === 0) { // has no cache
      return false
    }
    if (settings.cache.version === undefined) { // Has newly downloaded cache
      settings.cache = Object.assign(settings.cache, { version: settings.currentVersion })
      // settings.cache.version = settings.currentVersion;
      saveSettings(settings)
      return true
    }
    if (settings.cache.version !== settings.currentVersion) { // Has old version cache
      settings.cache = {}
      saveSettings(settings)
      return false
    }
    return true // Has cache
  }
}


try {
  Vue.config.productionTip = false
  Vue.config.devtools = false
  setupAjaxHook()
  const events = {}
  for (const name of ['init', 'styleLoaded', 'scriptLoaded']) {
    events[name] = {
      completed: false,
      subscribers: [],
      complete () {
        this.completed = true
        this.subscribers.forEach(it => it())
      }
    }
  }
  if (unsafeWindow.bilibiliEvolved === undefined) {
    unsafeWindow.bilibiliEvolved = { addons: [] }
  }
  Object.assign(unsafeWindow.bilibiliEvolved, {
    subscribe (type, callback) {
      const event = events[type]
      if (callback) {
        if (event && !event.completed) {
          event.subscribers.push(callback)
        } else {
          callback()
        }
      } else {
        return new Promise((resolve) => this.subscribe(type, () => resolve()))
      }
    }
  })
  contentLoaded(() => {
    document.body.classList.add('round-corner')
  })
  loadResources()
  loadSettings()
  const resources = new ResourceManager()
  events.init.complete()
  resources.styleManager.prefetchStyles()
  events.styleLoaded.complete()

  Object.assign(unsafeWindow.bilibiliEvolved, {
    SpinQuery,
    Toast,
    Observer,
    DoubleClickEvent,
    ColorProcessor,
    StyleManager,
    ResourceManager,
    Resource,
    ResourceType,
    Ajax,
    resourceManifest,
    loadSettings,
    saveSettings,
    onSettingsChange,
    logError,
    raiseEvent,
    loadLazyPanel,
    contentLoaded,
    fixed,
    settings,
    settingsChangeHandlers,
    addSettingsListener,
    removeSettingsListener,
    isEmbeddedPlayer,
    isIframe,
    resources,
    theWorld: waitTime => {
      if (waitTime > 0) {
        setTimeout(() => { debugger }, waitTime)
      } else {
        debugger
      }
    },
    monkeyInfo: GM_info,
    monkeyApis: {
      getValue: GM_getValue,
      setValue: GM_setValue,
      setClipboard: GM_setClipboard,
      addValueChangeListener: () => console.warn('此功能已弃用.')
    }
  })
  const applyScripts = () => resources.fetch()
    .then(() => {
      events.scriptLoaded.complete()
      const addons = new Proxy(unsafeWindow.bilibiliEvolved.addons || [], {
        apply: function (target, thisArg, argumentsList) {
          return thisArg[target].apply(this, argumentsList)
        },
        set: function (target, property, value) {
          if (target[property] === undefined) {
            resources.applyWidget(value)
          }
          target[property] = value
          return true
        }
      })
      addons.forEach(it => resources.applyWidget(it))
      Object.assign(unsafeWindow.bilibiliEvolved, { addons })
    })
    .catch(error => logError(error))
  contentLoaded(applyScripts)
} catch (error) {
  logError(error)
}
