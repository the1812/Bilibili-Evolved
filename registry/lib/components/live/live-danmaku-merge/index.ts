import { defineComponentMetadata } from '@/components/define'
import type { ComponentEntry } from '@/components/types'
import { addComponentListener, metadataToOptions, removeComponentListener } from '@/core/settings'
import { getDefaultStyleID } from '@/core/style'
import { isIframe, matchPattern } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { liveUrls } from '@/core/utils/urls'
import { applyScaleCssVars, ensureSubDocStyle, initMergeManagerForDoc } from './manager'
import { LiveDanmakuMergeOptions, liveDanmakuMergeOptions } from './options'
import { isBadgeVisible } from './renderer'
import { DANMAKU_CONTAINER_SELECTOR, DocInstance, SUBDOC_STYLE_ID } from './types'

const name = 'liveDanmakuMerge'
const defaultStyleId = getDefaultStyleID(name)
const console = useScopedConsole(name)
const activeOptions: LiveDanmakuMergeOptions = metadataToOptions(liveDanmakuMergeOptions)
const getOptions = () => activeOptions

const instances: DocInstance[] = []
let iframeScanTimer: number | null = null
let isRunning = false
let rootAbortController: AbortController | null = null

const loadMainStyleCss = lodash.once(() => import('./style.scss').then(m => m.default))

const syncAllScaleCssVars = () => {
  instances.forEach(inst => {
    applyScaleCssVars(inst.targetDoc, activeOptions)
    inst.syncBadges()
  })
}

const SCALE_CSS_OPTION_KEYS = new Set<keyof LiveDanmakuMergeOptions>([
  'badgeSymbolScaleRatio',
  'badgeNumScaleRatio',
])

const optionHandlers: {
  key: keyof LiveDanmakuMergeOptions
  handler: (val: number) => void
}[] = (Object.keys(activeOptions) as (keyof LiveDanmakuMergeOptions)[]).map(key => ({
  key,
  handler: val => {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return
    }
    activeOptions[key] = val
    if (SCALE_CSS_OPTION_KEYS.has(key)) {
      syncAllScaleCssVars()
    }
  },
}))

const shouldYieldToParentFrame = (): boolean => {
  if (!isIframe()) {
    return false
  }
  try {
    const parentUrl = unsafeWindow.parent.location.href.split('?')[0].split('#')[0]
    return liveUrls.some(pattern => matchPattern(parentUrl, pattern))
  } catch {
    // 嵌入跨域父页面时访问 parent.location 会抛出 SecurityError，此时按独立文档运行
    return false
  }
}

const removeInstance = (cleanupFn: () => void) => {
  const idx = instances.findIndex(inst => inst.cleanup === cleanupFn)
  if (idx !== -1) {
    instances.splice(idx, 1)
  }
}

const scanAndAttach = (targetDoc: Document) => {
  if (!targetDoc) {
    return
  }
  for (let i = instances.length - 1; i >= 0; i--) {
    const inst = instances[i]
    if (!inst.targetDoc.defaultView || inst.targetDoc.defaultView.closed) {
      inst.cleanup()
    }
  }
  if (instances.some(inst => inst.targetDoc === targetDoc)) {
    return
  }
  const inst = initMergeManagerForDoc(
    targetDoc,
    getOptions,
    loadMainStyleCss,
    defaultStyleId,
    removeInstance,
  )
  instances.push(inst)
  if (isBadgeVisible(activeOptions)) {
    inst.syncBadges()
  }
}

const isSameOriginIframeSrc = (iframe: HTMLIFrameElement): boolean => {
  const rawSrc = iframe.getAttribute('src')?.trim()
  if (!rawSrc || rawSrc.startsWith('about:') || rawSrc.startsWith('javascript:')) {
    return true
  }
  try {
    return new URL(rawSrc, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

const isLivePlayerSubDoc = (subDoc: Document): boolean => {
  const subUrl = subDoc.URL.split('?')[0].split('#')[0]
  if (liveUrls.some(pattern => matchPattern(subUrl, pattern))) {
    return true
  }
  return Boolean(subDoc.querySelector(DANMAKU_CONTAINER_SELECTOR))
}

const start = () => {
  if (shouldYieldToParentFrame()) {
    const cleanRedundantOwnStyle = () => {
      if (document.getElementById(SUBDOC_STYLE_ID)) {
        document.getElementById(defaultStyleId)?.remove()
      }
    }
    cleanRedundantOwnStyle()
    queueMicrotask(cleanRedundantOwnStyle)
    console.debug('检测到同源父直播页面，交由父框架统一托管弹幕合并')
    return
  }
  if (isRunning) {
    return
  }
  isRunning = true
  rootAbortController = new AbortController()

  optionHandlers.forEach(({ key, handler }) => {
    addComponentListener(`${name}.${key}`, handler, true)
  })

  scanAndAttach(document)

  const attachedIframes = new WeakSet<HTMLIFrameElement>()
  const tryAttachIframe = (iframe: HTMLIFrameElement) => {
    if (!isSameOriginIframeSrc(iframe)) {
      return
    }
    let subDoc: Document | null = null
    try {
      subDoc = iframe.contentDocument || iframe.contentWindow?.document || null
    } catch {
      // 动态跳转至跨域 iframe 时访问 contentWindow.document 会抛出 SecurityError
      return
    }
    if (!subDoc || !isLivePlayerSubDoc(subDoc)) {
      return
    }
    scanAndAttach(subDoc)
    loadMainStyleCss().then(cssText => {
      if (isRunning && subDoc) {
        ensureSubDocStyle(subDoc, cssText, defaultStyleId)
      }
    })
  }

  const scanIframes = () => {
    const iframes = document.querySelectorAll('iframe')
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i]
      if (!attachedIframes.has(iframe) && rootAbortController) {
        attachedIframes.add(iframe)
        iframe.addEventListener(
          'load',
          () => {
            tryAttachIframe(iframe)
          },
          { signal: rootAbortController.signal },
        )
      }
      tryAttachIframe(iframe)
    }
  }

  scanIframes()
  iframeScanTimer = window.setInterval(scanIframes, 3000)
  console.debug('直播重复弹幕合并膨胀组件已挂载运行')
}

const entry: ComponentEntry<LiveDanmakuMergeOptions> = () => {
  start()
}

const unload = () => {
  if (!isRunning) {
    return
  }
  isRunning = false
  rootAbortController?.abort()
  rootAbortController = null

  optionHandlers.forEach(({ key, handler }) => {
    removeComponentListener(`${name}.${key}`, handler)
  })

  if (iframeScanTimer !== null) {
    window.clearInterval(iframeScanTimer)
    iframeScanTimer = null
  }
  instances.splice(0).forEach(inst => inst.cleanup())
  console.debug('直播重复弹幕合并膨胀组件已完全卸载并清理')
}

const reload = () => {
  unload()
  start()
}

export const component = defineComponentMetadata({
  name,
  displayName: '直播重复弹幕合并膨胀',
  tags: [componentsTags.live],
  author: {
    name: 'ysl',
    link: 'https://github.com/ysl-ovo',
  },
  entry,
  reload,
  unload,
  options: liveDanmakuMergeOptions,
  urlInclude: liveUrls,
  instantStyles: [
    {
      name,
      style: () => import('./style.scss'),
    },
  ],
})
