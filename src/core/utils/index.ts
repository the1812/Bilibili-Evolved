import { VueModule } from '../common-types'

/**
 * 当查询 video 元素且被灰度了 WasmPlayer 时, 更换为对 bwp-video 的查询, 否则会找不到 video 元素
 * @param selector 选择器
 */
export const bwpVideoFilter = (selector: string) => {
  // if (!unsafeWindow.__ENABLE_WASM_PLAYER__) {
  //   return selector
  // }
  const map = {
    video: ', bwp-video',
    '.bilibili-player-video video':
      ', .bilibili-player-video bwp-video,.bpx-player-video-area bwp-video',
  }
  const suffix = map[selector]
  if (suffix) {
    return selector + suffix
  }
  return selector
}
type DocumentQuerySelector = {
  /**
   * 同 `document.querySelector`, 对 `<bwp-video>` 有额外处理
   * @param selector 选择器
   */
  (selector: string): Element | null
  /**
   * 在指定元素上进行 `querySelector`, 对 `<bwp-video>` 有额外处理
   * @param selector 元素
   * @param scopedSelector 选择器
   */
  (element: Element, scopedSelector: string): Element | null
}
export const dq: DocumentQuerySelector = (
  selectorOrElement: string | Element,
  scopedSelector?: string,
) => {
  if (!scopedSelector) {
    return document.querySelector(bwpVideoFilter(selectorOrElement as string))
  }
  return (selectorOrElement as Element).querySelector(bwpVideoFilter(scopedSelector))
}
type DocumentQuerySelectorAll = {
  /**
   * 同 `document.querySelectorAll` (返回转换过的真数组), 对 `<bwp-video>` 有额外处理
   * @param selector 选择器
   */
  (selector: string): Element[]
  /**
   * 在指定元素上进行`querySelectorAll` (返回转换过的真数组), 对 `<bwp-video>` 有额外处理
   * @param selector 元素
   * @param scopedSelector 选择器
   */
  (element: Element, scopedSelector: string): Element[]
}
export const dqa: DocumentQuerySelectorAll = (
  selectorOrElement: Element | string,
  scopedSelector?: string,
) => {
  if (!scopedSelector) {
    return Array.from(document.querySelectorAll(bwpVideoFilter(selectorOrElement as string)))
  }
  return Array.from((selectorOrElement as Element).querySelectorAll(bwpVideoFilter(scopedSelector)))
}
type DocumentEvaluate = {
  (xpathExpression: string): XPathResult
  (xpathExpression: string, contextNode: Node): XPathResult
  (xpathExpression: string, contextNode: Node, type: number): XPathResult
  (xpathExpression: string, contextNode: Node, type: number, result: XPathResult): XPathResult
}
export const de: DocumentEvaluate = (
  xpathExpression: string,
  contextNode?: Node,
  type?: number,
  result?: XPathResult,
) => document.evaluate(xpathExpression, contextNode, null, type, result)
type DocumentEvaluateAll = {
  (xpathExpression: string): Node[]
  (xpathExpression: string, contextNode: Node): Node[]
  (xpathExpression: string, contextNode: Node, order: boolean): Node[]
  (xpathExpression: string, contextNode: Node, order: boolean, result: XPathResult): Node[]
}
export const dea: DocumentEvaluateAll = (
  xpathExpression: string,
  contextNode?: Node,
  order?: boolean,
  result?: XPathResult,
) => {
  const xpathResult = de(
    xpathExpression,
    contextNode,
    order ? XPathResult.ORDERED_NODE_SNAPSHOT_TYPE : XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    result,
  )

  return Array.from({ length: xpathResult.snapshotLength }, (_, i) => xpathResult.snapshotItem(i))
}
type DocumentEvaluateAllIterable = {
  (xpathExpression: string): Iterable<Node>
  (xpathExpression: string, contextNode: Node): Iterable<Node>
  (xpathExpression: string, contextNode: Node, order: boolean): Iterable<Node>
  (xpathExpression: string, contextNode: Node, order: boolean, result: XPathResult): Iterable<Node>
}
export const deai: DocumentEvaluateAllIterable = (
  xpathExpression: string,
  contextNode?: Node,
  order?: boolean,
  result?: XPathResult,
) => {
  const xpathResult = de(
    xpathExpression,
    contextNode,
    order ? XPathResult.ORDERED_NODE_ITERATOR_TYPE : XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    result,
  )

  return {
    [Symbol.iterator]: () => ({
      next: () => {
        let node = null
        do {
          node = xpathResult.iterateNext()
          return node
            ? ({ done: false, value: node } as { done: false; value: Node })
            : ({ done: true } as { done: true; value: any })
        } while (node)
      },
    }),
  }
}
type DocumentEvaluateSingle = {
  <T extends Node>(xpathExpression: string): T | null
  <T extends Node>(xpathExpression: string, contextNode: Node): T | null
  <T extends Node>(xpathExpression: string, contextNode: Node, result: XPathResult): T | null
}
export const des: DocumentEvaluateSingle = <T extends Node>(
  xpathExpression: string,
  contextNode?: Node,
  result?: XPathResult,
) =>
  de(xpathExpression, contextNode, XPathResult.FIRST_ORDERED_NODE_TYPE, result)
    .singleNodeValue as T | null
/** 空函数 */
export const none = () => {
  // Do nothing
}
/** 页面是否使用了 Wasm 播放器 */
export const isBwpVideo = async () => {
  const { hasVideo } = await import('../spin-query')
  if (!(await hasVideo())) {
    return false
  }
  return (
    // eslint-disable-next-line no-underscore-dangle
    (unsafeWindow.__ENABLE_WASM_PLAYER__ as boolean) || Boolean(dq('#bilibili-player bwp-video'))
  )
}
/**
 * 等待一定时间
 * @param time 延迟的毫秒数
 */
export const delay = (time = 0) => new Promise<void>(r => setTimeout(() => r(), time))
/** 测试字符串是否包含子串或匹配正则
 * @param str 字符串
 * @param pattern 子串或正则表达式
 */
export const matchPattern = (str: string, pattern: string | RegExp) => {
  if (typeof pattern === 'string') {
    return str.includes(pattern)
  }
  return pattern.test(str)
}
/** 以`document.URL`作为被测字符串, 移除URL查询参数并调用`matchPattern` */
export const matchUrlPattern = (pattern: string | RegExp) =>
  matchPattern(document.URL.replace(window.location.search, ''), pattern)
/** 创建Vue组件的实例
 * @param module Vue组件模块对象
 * @param target 组件的挂载目标元素, 省略时不挂载直接返回
 */
export const mountVueComponent = <T>(module: VueModule, target?: Element | string): Vue & T => {
  const obj = 'default' in module ? module.default : module
  const getInstance = (o: any) => {
    if (o instanceof Function) {
      // eslint-disable-next-line new-cap
      return new o()
    }
    if (o.functional) {
      return new (Vue.extend(o))()
    }
    return new Vue(o)
  }
  return getInstance(obj).$mount(target) as Vue & T
}
/** 是否处于其他网站的内嵌播放器中 */
export const isEmbeddedPlayer = () =>
  window.location.host === 'player.bilibili.com' ||
  document.URL.startsWith('https://www.bilibili.com/html/player.html')
/** 是否处于`<iframe>`中 */
export const isIframe = () => document.body && unsafeWindow.parent.window !== unsafeWindow
/** 当前页面是否不是 HTML 页面 (JSON, XML 页面等) */
export const isNotHtml = () => document.contentType !== 'text/html'
/** 在指定元素上触发简单事件
 * @param element 目标元素
 * @param eventName 事件名称
 */
export const raiseEvent = (element: HTMLElement, eventName: string) => {
  const event = new Event(eventName)
  element.dispatchEvent(event)
}
/** 根据图片URL生成 `srcset`, 范围从 `@1x` 至 `@4x`, 每 `0.25x` 产生一个 `src`
 * @param src 图片URL
 * @param baseSize 图片尺寸, 传入数字代表宽高, 也可传入对象 `{ width: number, height: number }`, 对象省略任一属性可表示等比缩放
 * @param extension 图片扩展名(不包含 `.`), 默认从 `src` 读取, fallback 为 `jpg`
 */
export const getDpiSourceSet = (
  src: string,
  baseSize:
    | number
    | {
        width?: number
        height?: number
      },
  extension?: string,
) => {
  const dpis = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4]

  if (!extension) {
    const srcExtension = src.match(/.+\.(.+)$/)
    if (srcExtension) {
      extension = srcExtension[1]
    } else {
      extension = 'jpg'
    }
  }
  if (extension.startsWith('.')) {
    extension = extension.substring(1)
  }
  return dpis
    .map(dpi => {
      if (typeof baseSize === 'object') {
        if ('width' in baseSize && 'height' in baseSize) {
          return `${src}@${Math.trunc(baseSize.width * dpi)}w_${Math.trunc(
            baseSize.height * dpi,
          )}h.${extension} ${dpi}x`
        }
        if ('width' in baseSize) {
          return `${src}@${Math.trunc(baseSize.width * dpi)}w.${extension} ${dpi}x`
        }
        if ('height' in baseSize) {
          return `${src}@${Math.trunc(baseSize.height * dpi)}h.${extension} ${dpi}x`
        }
        throw new Error(`Invalid argument 'baseSize': ${JSON.stringify(baseSize)}`)
      } else {
        return `${src}@${Math.trunc(baseSize * dpi)}w_${Math.trunc(
          baseSize * dpi,
        )}h.${extension} ${dpi}x`
      }
    })
    .join(',')
}
/** 获取cookie值
 * @param name cookie名称
 */
export const getCookieValue = (name: string) =>
  document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1')
/** 获取UID, 未登录返回空字符串 */
export const getUID = () => getCookieValue('DedeUserID')
/** 获取CSRF Token */
export const getCsrf = () => getCookieValue('bili_jct')

/** 兼容v1的API, 仅按精度直接截断数字, 不做四舍五入, 若未达到精度会添加0
 * @param num 数字
 * @param precision 精度
 */
export const fixed = (num: number, precision = 1): string => {
  const factor = 10 ** precision
  let str = (Math.trunc(num * factor) / factor).toString()
  const index = str.indexOf('.')
  if (index > -1) {
    const currentPrecision = str.length - index - 1
    if (currentPrecision < precision) {
      str += '0'.repeat(precision - currentPrecision)
    }
  } else {
    str += `.${'0'.repeat(precision)}`
  }
  return str
}
/**
 * 在现有原型上添加钩子函数
 * @param type 原型
 * @param target 原型上的属性
 * @param hookFunc 钩子函数, 返回值表示是否调用原函数
 */
export const createHook = <ParentType, HookParameters extends any[], ReturnType = any>(
  type: ParentType,
  target: keyof ParentType,
  hookFunc: (...args: HookParameters) => boolean,
) => {
  const original: (...args: HookParameters) => ReturnType = type[target] as any
  type[target] = function hook(...args: HookParameters) {
    const shouldCallOriginal = hookFunc(...args)
    if (!shouldCallOriginal) {
      return undefined
    }
    return original?.call(this, ...args)
  } as any
  return () => (type[target] = original as any)
}
/**
 * 在现有原型上添加钩子函数 (原函数执行后再触发)
 * @param type 原型
 * @param target 原型上的属性
 * @param hookFunc 钩子函数
 */
export const createPostHook = <ParentType, HookParameters extends any[], ReturnType = any>(
  type: ParentType,
  target: keyof ParentType,
  hookFunc: (...args: HookParameters) => unknown,
) => {
  const original: (...args: HookParameters) => ReturnType = type[target] as any
  type[target] = function hook(...args: HookParameters) {
    const result = original?.call(this, ...args)
    hookFunc(...args)
    return result
  } as any
  return () => (type[target] = original as any)
}
/**
 * 阻止元素的对特定类型事件 (非 capture 类) 的处理
 * @param target 目标元素
 * @param event 事件类型
 * @param extraAction 在阻止前的额外判断, 返回 false 或 undefined 可以不阻止
 * @returns 取消阻止的函数
 */
export const preventEvent = (
  target: EventTarget,
  event: keyof HTMLElementEventMap | string,
  extraAction?: (e: Event) => boolean | void,
) => {
  const listener = (e: Event) => {
    if (extraAction?.(e) ?? true) {
      e.stopImmediatePropagation()
    }
  }
  target.addEventListener(event, listener, { capture: true })
  return () => {
    target.removeEventListener(event, listener, { capture: true })
  }
}
/**
 * 根据传入的对象拼接处 URL 查询字符串
 * @param obj 参数对象
 * @deprecated 请使用 URLSearchParams
 */
export const formData = (obj: Record<string, any>, config?: { encode?: boolean }) => {
  const { encode } = { encode: true, ...config }
  return Object.entries(obj)
    .map(([k, v]) => {
      if (encode) {
        return `${k}=${encodeURIComponent(v)}`
      }
      return `${k}=${v}`
    })
    .join('&')
}

/**
 * 移除一个数组中的元素
 * @param target 目标数组
 * @param predicate 数组元素判断
 */
export const deleteValue = <ItemType>(
  target: ItemType[],
  predicate: (value: ItemType, index: number, obj: ItemType[]) => boolean,
) => {
  const index = target.findIndex(predicate)
  if (index !== -1) {
    target.splice(index, 1)
    return true
  }
  return false
}
/**
 * 移除一个数组中所有符合条件的元素
 * @param target 目标数组
 * @param predicate 数组元素判断
 */
export const deleteValues = <ItemType>(
  target: ItemType[],
  predicate: (value: ItemType, index: number, obj: ItemType[]) => boolean,
) => {
  let foundDeleteItem = false
  do {
    foundDeleteItem = deleteValue(target, predicate)
  } while (foundDeleteItem)
  return foundDeleteItem
}

type ClickEvent = (e: MouseEvent) => void
/** 封装双击事件, 可以对元素原先的单击事件有更多控制. (纯粹想用双击事件直接用 dblclick) */
export class DoubleClickEvent {
  /** 已绑定的元素 */
  elements: Element[] = []
  /** 屏蔽单击事件时, 没有在短时间内完成双击才判定为单击, 并会运行此函数 */
  singleClickHandler: (e: MouseEvent) => void = none

  private clickedOnce = false
  private readonly stopPropagationHandler = (e: MouseEvent) => {
    e.stopImmediatePropagation()
  }
  private readonly doubleClickHandler = (e: MouseEvent) => {
    if (!this.clickedOnce) {
      this.clickedOnce = true
      setTimeout(() => {
        if (this.clickedOnce) {
          this.clickedOnce = false
          if (this.preventSingle) {
            this.singleClickHandler?.(e)
          }
        }
      }, 200)
    } else {
      this.clickedOnce = false
      Promise.resolve().then(() => {
        this.handler?.(e)
      })
    }
    if (this.preventSingle) {
      e.stopImmediatePropagation()
    }
  }
  constructor(
    /** 双击的回调函数 */
    public handler: ClickEvent,
    /** 检测双击时是否屏蔽单击事件 */
    public preventSingle = false,
  ) {}
  /**
   * 绑定双击事件
   * @param element 目标元素
   */
  bind(element: Element) {
    if (this.elements.indexOf(element) === -1) {
      this.elements.push(element)
      element.addEventListener('click', this.doubleClickHandler, {
        capture: true,
      })
      element.addEventListener('dblclick', this.stopPropagationHandler, { capture: true })
    }
  }
  /**
   * 取消绑定双击事件
   * @param element 目标元素
   */
  unbind(element: Element) {
    const index = this.elements.indexOf(element)
    if (index === -1) {
      return
    }
    this.elements.splice(index, 1)
    element.removeEventListener('click', this.doubleClickHandler, {
      capture: true,
    })
    element.removeEventListener('dblclick', this.stopPropagationHandler, { capture: true })
  }
}
/** 等待播放器准备好, 如果过早注入 DOM 元素可能会导致爆炸
 *
 * https://github.com/the1812/Bilibili-Evolved/issues/1076
 * https://github.com/the1812/Bilibili-Evolved/issues/770
 */
export const playerReady = async () => {
  const { sq } = await import('../spin-query')
  const { logError } = await import('./log')
  await sq(
    () => unsafeWindow,
    () => unsafeWindow.UserStatus !== undefined,
  )
  return new Promise<void>((resolve, reject) => {
    const isJudgementVideo =
      document.URL.replace(window.location.search, '') ===
        'https://www.bilibili.com/blackboard/newplayer.html' && document.URL.includes('fjw=true')
    if (isJudgementVideo) {
      /* 如果是风纪委员里的内嵌视频, 永远不 resolve
        https://github.com/the1812/Bilibili-Evolved/issues/2340
      */
      return
    }
    if (isEmbeddedPlayer()) {
      return
    }
    if (unsafeWindow.onLoginInfoLoaded) {
      unsafeWindow.onLoginInfoLoaded(resolve)
    } else {
      logError(new Error('utils.playerReady 失败'))
      console.error(`typeof onLoginInfoLoaded === ${typeof unsafeWindow.onLoginInfoLoaded}`)
      reject()
    }
  })
}
/**
 * 等待视频页面的 aid, 如果是合集类页面, 会从 player API 中获取 aid 并赋值到 window 上
 */
// export const aidReady = async () => {
//   if (unsafeWindow.aid) {
//     return unsafeWindow.aid
//   }
//   const { sq } = await import('../spin-query')
//   const info = await sq(
//     () => unsafeWindow?.player?.getVideoMessage?.() as { aid?: string },
//     it => it?.aid !== undefined,
//   )
//   if (!info) {
//     return null
//   }
//   unsafeWindow.aid = info.aid.toString()
//   return info.aid as string
// }

/** 获取当前聚焦的元素 */
export const getActiveElement = () => {
  let { activeElement } = document
  while (activeElement.shadowRoot !== null) {
    activeElement = activeElement.shadowRoot.activeElement
  }
  return activeElement
}
/** 是否正在打字 */
export const isTyping = () => {
  const activeElement = getActiveElement()
  if (!activeElement) {
    return false
  }
  if (activeElement.hasAttribute('contenteditable')) {
    return true
  }
  return ['input', 'textarea'].includes(activeElement.nodeName.toLowerCase())
}
/**
 * 提取元素中的可能的图片信息 (src, data-src, background-image 等). 如果是经过缩放的图, 会自动去除缩放参数返回原图链接
 * @param element 元素
 * @returns 图片的链接和扩展名
 */
export const retrieveImageUrl = (element: HTMLElement) => {
  if (!(element instanceof HTMLElement)) {
    return null
  }
  const url = (() => {
    if (element.hasAttribute('data-src')) {
      return element.getAttribute('data-src')
    }
    if (element instanceof HTMLImageElement) {
      return element.src
    }
    if (element instanceof HTMLPictureElement && dq(element, 'img')) {
      const image = dq(element, 'img') as HTMLImageElement
      return image.src
    }
    if (dq(element, 'picture img')) {
      const image = dq(element, 'picture img') as HTMLImageElement
      return image.src
    }
    const { backgroundImage } = element.style
    if (!backgroundImage) {
      return null
    }
    const match = backgroundImage.match(/url\("(.+)"\)/)
    if (!match) {
      return null
    }
    return match[1]
  })()

  const thumbMatch = url.match(/^(.+)(\..+?)(@.+)$/)
  if (thumbMatch) {
    return {
      url: thumbMatch[1] + thumbMatch[2],
      extension: thumbMatch[2],
    }
  }
  const noThumbMatch = url.match(/^(.+)(\..+?)$/)
  if (!noThumbMatch) {
    return null
  }
  return {
    url: noThumbMatch[1] + noThumbMatch[2],
    extension: noThumbMatch[2],
  }
}
/**
 * 等待标签页处于前台时(未失去焦点, 未最小化)再执行动作
 * @param action 要执行的动作
 */
export const waitForForeground = (action: () => void) => {
  const runAction = () => {
    if (document.visibilityState === 'visible') {
      action()
      document.removeEventListener('visibilitychange', runAction)
      return true
    }
    return false
  }
  const isNowForeground = runAction()
  if (isNowForeground) {
    return
  }
  document.addEventListener('visibilitychange', runAction)
}
/**
 * 暂时或永久禁用滚动 (window.scrollTo)
 * - 暂时: 传入 `action` 时会在 `action` 执行完毕后解除禁用
 * - 永久: 不传入 `action`, 返回一个解除禁用的函数可供调用
 * @param action 需要在禁止滚动时进行的操作
 */
export const disableWindowScroll = async (action?: () => unknown | Promise<unknown>) => {
  // eslint-disable-next-line prefer-arrow-callback
  const restore = createHook(unsafeWindow, 'scrollTo', function hook() {
    return false
  })
  if (action) {
    await action()
    restore()
    return none
  }
  return restore
}
/**
 * 生成一个对组件选项进行数字校验的函数, 可选择设置数字范围
 * @param clampLower 最小值
 * @param clampUpper 最大值
 */
export const getNumberValidator =
  (clampLower = -Infinity, clampUpper = Infinity) =>
  (value: number, oldValue: number) =>
    lodash.isNumber(Number(value)) ? lodash.clamp(value, clampLower, clampUpper) : oldValue
/**
 * 将文本转换为 PascalCase
 * @param text 文本
 */
export const pascalCase = (text: string) => lodash.upperFirst(lodash.camelCase(text))

/**
 * 生成一段随机 ID (产生十六进制字符, 如 `4ae127a4`)
 * @param length 长度
 */
export const getRandomId = (length = 8) => {
  const typedArray = new Uint8Array(Math.ceil(length / 2))
  crypto.getRandomValues(typedArray)
  return [...typedArray]
    .map(it => it.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length)
}

/**
 * 在未开发完成的代码处占位，抑制编译器、eslint、IDE 等的报错
 *
 * @example
 * ```typescript
 * const uncompleted = (arg1: number, arg2: string): number => {
 *   return todo(arg1, arg2)
 * }
 * ```
 */
export const todo = (...args: unknown[]): never => {
  throw new Error(`todo. args: ${JSON.stringify(args)}`)
}

/**
 * 标记永远不会被执行到的位置
 *
 * @example
 * ```typescript
 * switch (code) {
 *   case 0:
 *     return 0
 *   case 1:
 *     return 1
 *   default:
 *     unreachable()
 * }
 * ```
 */
export const unreachable = (): never => {
  throw new Error(`unreachable`)
}

/** 是否为流量计费网络 (不支持的浏览器仍按 false 算) */
export const isDataSaveMode = () => {
  return navigator.connection?.saveData ?? false
}

/**
 * 模拟一次点击 (依次触发 `pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click` 事件)
 * @param target 点击的目标元素
 * @param eventParams 事件参数
 */
export const simulateClick = (target: EventTarget, eventParams?: PointerEventInit) => {
  const mouseDownEvent = new MouseEvent('mousedown', eventParams)
  const mouseUpEvent = new MouseEvent('mouseup', eventParams)
  const pointerDownEvent = new PointerEvent('pointerdown', eventParams)
  const pointerUpEvent = new PointerEvent('pointerup', eventParams)
  const clickEventEvent = new MouseEvent('click', eventParams)
  target.dispatchEvent(pointerDownEvent)
  target.dispatchEvent(mouseDownEvent)
  target.dispatchEvent(pointerUpEvent)
  target.dispatchEvent(mouseUpEvent)
  target.dispatchEvent(clickEventEvent)
}

/** 尝试获取元素对应的 Vue Data (仅适用于 Vue 2 组件) */
export const getVue2Data = (el: any) =>
  // eslint-disable-next-line no-underscore-dangle
  el.__vue__ ?? el.parentElement.__vue__ ?? el.children[0].__vue__ ?? el.__vueParentComponent
