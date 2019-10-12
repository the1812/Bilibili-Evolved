// ==UserScript==
// @name         Bilibili Evolved (Preview)
// @version      1.9.11
// @description  Bilibili Evolved 的预览版, 可以抢先体验新功能.
// @author       Grant Howard, Coulomb-G
// @copyright    2019, Grant Howard (https://github.com/the1812) & Coulomb-G (https://github.com/Coulomb-G)
// @license      MIT
// @match        *://*.bilibili.com/*
// @run-at       document-start
// @updateURL    https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js
// @downloadURL  https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js
// @supportURL   https://github.com/the1812/Bilibili-Evolved/issues
// @homepage     https://github.com/the1812/Bilibili-Evolved
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.setClipboard
// @grant        GM.info
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// @connect      *
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://code.jquery.com/jquery-3.4.0.min.js
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js
// @require      https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js
// @icon         https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/logo-small.png
// @icon64       https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/logo.png
// ==/UserScript==
Vue.config.productionTip = false
Vue.config.devtools = false
import { logError, raiseEvent, loadLazyPanel, contentLoaded, fixed } from './utils'
import { settings, loadSettings, settingsChangeHandlers } from './settings'
import { Ajax, setupAjaxHook } from './ajax'
import { loadResources } from './resource-loader'
import { Toast } from './toast-holder'
import { DoubleClickEvent } from './double-click-event'
import { Observer } from './observer'
import { SpinQuery } from './spin-query'
import { ColorProcessor } from './color-processor'
// [Offline build placeholder]
import { ResourceType } from './resource-type'
import { Resource } from './resource'
import { resourceManifest } from './resource-manifest'
import { StyleManager } from './style-manager'
import { ResourceManager } from './resource-manager'
import { getScriptBlocker } from './script-blocker'

(async () => {
  if (await GM.getValue('customNavbar') === true
    && document.URL === 'https://message.bilibili.com/pages/nav/index_new_sync') {
    if (await GM.getValue('useDarkStyle') === true) {
      document.documentElement.style.setProperty('--theme-color', await GM.getValue('customStyleColor'))
      if (typeof offlineData === 'undefined') {
        const cache = await GM.getValue('cache', {})
        if ('darkStyle' in cache) {
          const style = document.createElement('style')
          style.innerHTML = cache.darkStyle
          style.id = 'dark-style'
          document.head.insertAdjacentElement('afterbegin', style)
        }
      } else {
        const style = document.createElement('style')
        style.innerHTML = Object.entries(offlineData).find(([key]) => {
          return key.includes('/dark.min.css')
        })[1]
        style.id = 'dark-style'
        document.head.insertAdjacentElement('afterbegin', style)
      }
    }
    return
  }
  try {
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
    await loadSettings()
    getScriptBlocker().then(scriptBlocker => {
      scriptBlocker.start()
    })
    if (settings.ajaxHook) {
      setupAjaxHook()
    }
    const resources = new ResourceManager()
    events.init.complete()
    resources.styleManager.prefetchStyles()
    // if (settings.customNavbar) {
    //   contentLoaded(() => {
    //     document.body.classList.add('custom-navbar-loading')
    //     if (settings.useDarkStyle) {
    //       document.body.classList.add('dark')
    //     }
    //   })
    // }
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
      getI18nKey,
      dq,
      dqa,
      UserAgent,
      EmptyImageUrl,
      ascendingSort,
      descendingSort,
      formatFileSize,
      formatDuration,
      getDpiSourceSet,
      getScriptBlocker,
      resources,
      theWorld: waitTime => {
        if (waitTime > 0) {
          setTimeout(() => { debugger }, waitTime)
        } else {
          debugger
        }
      },
      newHomePage: () => {
        document.cookie = 'INTVER=1; domain=.bilibili.com; path=/; expires=Fri, 21 Aug 2020 02:13:04 GMT'
      },
      monkeyInfo: GM.info,
      monkeyApis: {
        getValue: GM.getValue,
        setValue: GM.setValue,
        setClipboard: GM.setClipboard,
        xhr: GM.xmlHttpRequest,
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
    const loadingMode = settings.scriptLoadingMode
    switch (loadingMode) {
      case '延后':
        fullyLoaded(applyScripts)
        break
      case '同时':
        contentLoaded(applyScripts)
        break
      case '自动':
      case '延后(自动)':
        {
          const quickLoads = [
            '//live.bilibili.com',
          ]
          if (quickLoads.some(it => document.URL.includes(it))) {
            contentLoaded(applyScripts)
          } else {
            fullyLoaded(applyScripts)
          }
          break
        }
      case '同时(自动)':
        {
          const delayLoads = [
            '//www.bilibili.com/video/av',
            '//www.bilibili.com/bangumi/play',
          ]
          if (delayLoads.some(it => document.URL.includes(it))) {
            fullyLoaded(applyScripts)
          } else {
            contentLoaded(applyScripts)
          }
          break
        }
      default:
        break
    }
  } catch (error) {
    logError(error)
  }
})()