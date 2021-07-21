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
    '.bilibili-player-video video': ', .bilibili-player-video bwp-video',
  }
  const suffix = map[selector]
  if (suffix) {
    return selector + suffix
  }
  return selector
}
/**
 * 同 `document.querySelector`, 对 `<bwp-video>` 有额外处理
 * @param selector 选择器
 */
export function dq(selector: string): Element | null
/**
 * 在指定元素上进行 `querySelector`, 对 `<bwp-video>` 有额外处理
 * @param selector 元素
 * @param scopedSelector 选择器
 */
export function dq(element: Element, scopedSelector: string): Element | null
export function dq(selectorOrElement: Element | string, scopedSelector?: string): Element | null {
  if (!scopedSelector) {
    return document.querySelector(bwpVideoFilter(selectorOrElement as string))
  }
  return (selectorOrElement as Element).querySelector(bwpVideoFilter(scopedSelector))
}
/**
 * 同 `document.querySelectorAll` (返回转换过的真数组), 对 `<bwp-video>` 有额外处理
 * @param selector 选择器
 */
export function dqa(selector: string): Element[]
/**
 * 在指定元素上进行`querySelectorAll` (返回转换过的真数组), 对 `<bwp-video>` 有额外处理
 * @param selector 元素
 * @param scopedSelector 选择器
 */
export function dqa(element: Element, scopedSelector: string): Element[]
export function dqa(selectorOrElement: Element | string, scopedSelector?: string): Element[] {
  if (!scopedSelector) {
    return Array.from(document.querySelectorAll(bwpVideoFilter(selectorOrElement as string)))
  }
  return Array.from((selectorOrElement as Element).querySelectorAll(bwpVideoFilter(scopedSelector)))
}
/** 空函数 */
export const none = () => {
  // Do nothing
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
export const matchUrlPattern = (pattern: string | RegExp) => (
  matchPattern(document.URL.replace(window.location.search, ''), pattern)
)
/** 创建Vue组件的实例
 * @param module Vue组件模块对象
 * @param target 组件的挂载目标元素, 省略时不挂载直接返回
 */
export const mountVueComponent = <T>(module: VueModule, target?: Element | string) => {
  const instance = new Vue('default' in module ? module.default : module)
  // const instance = new Vue({ render: h => h('default' in module ? module.default : module) })
  return instance.$mount(target) as Vue & T
}
/** 是否处于其他网站的内嵌播放器中 */
export const isEmbeddedPlayer = () => window.location.host === 'player.bilibili.com' || document.URL.startsWith('https://www.bilibili.com/html/player.html')
/** 是否处于`<iframe>`中 */
export const isIframe = () => document.body && unsafeWindow.parent.window !== unsafeWindow
/** 当前页面是否不是 HTML 页面 (JSON, XML 页面等) */
export const isNotHtml = () => document.contentType !== 'text/html'
/** 在指定元素上触发简单事件
 * @param element 目标元素
 * @param eventName 事件名称
 */
export const raiseEvent = (element: HTMLElement, eventName: string) => {
  const event = document.createEvent('HTMLEvents')
  event.initEvent(eventName, true, true)
  element.dispatchEvent(event)
}
/** 根据图片URL生成`srcset`, 范围从`@1x`至`@4x`, 每`0.25x`产生一个`src`
 * @param src 图片URL
 * @param baseSize 图片尺寸, 传入数字代表宽高, 也可传入对象`{ width: number, height: number }`, 对象省略任一属性可表示等比缩放
 * @param extension 图片扩展名(不包含`.`), 默认为`jpg`
 */
export const getDpiSourceSet = (src: string, baseSize: number | {
  width?: number
  height?: number
}, extension = 'jpg') => {
  const dpis = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4]
  if (extension.startsWith('.')) {
    extension = extension.substring(1)
  }
  return dpis.map(dpi => {
    if (typeof baseSize === 'object') {
      if ('width' in baseSize && 'height' in baseSize) {
        return `${src}@${Math.trunc(baseSize.width * dpi)}w_${Math.trunc(baseSize.height * dpi)}h.${extension} ${dpi}x`
      } if ('width' in baseSize) {
        return `${src}@${Math.trunc(baseSize.width * dpi)}w.${extension} ${dpi}x`
      } if ('height' in baseSize) {
        return `${src}@${Math.trunc(baseSize.height * dpi)}h.${extension} ${dpi}x`
      }
      throw new Error(`Invalid argument 'baseSize': ${JSON.stringify(baseSize)}`)
    } else {
      return `${src}@${Math.trunc(baseSize * dpi)}w_${Math.trunc(baseSize * dpi)}h.${extension} ${dpi}x`
    }
  }).join(',')
}
/** 获取cookie值
 * @param name cookie名称
 */
export const getCookieValue = (name: string) => document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1')
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
 * @param hookFunc 钩子函数
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
    return original.call(this, ...args)
  } as any
  return original
}
/**
 * 根据传入的对象拼接处 URL 查询字符串
 * @param obj 参数对象
 */
export const formData = (obj: Record<string, any>) => Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('&')

/**
 * 移除一个数组中的元素
 * @param target 目标数组
 * @param property 数组元素判断
 */
export const deleteValue = <ItemType> (
  target: ItemType[],
  predicate: (value: ItemType, index: number, obj: ItemType[]) => boolean,
) => {
  const index = target.findIndex(predicate)
  if (index !== -1) {
    target.splice(index, 1)
  }
}

type ClickEvent = (e: MouseEvent) => void
/** 封装双击事件 */
export class DoubleClickEvent {
  /** 已绑定的元素 */
  elements: Element[] = []
  singleClickHandler: (e: MouseEvent) => void = none
  private clickedOnce = false
  private readonly doubleClickHandler = (e: MouseEvent) => {
    if (!this.clickedOnce) {
      this.clickedOnce = true
      setTimeout(() => {
        if (this.clickedOnce) {
          this.clickedOnce = false
          this.singleClickHandler?.(e)
        }
      }, 200)
    } else {
      this.clickedOnce = false
      this.handler?.(e)
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
  ) {
  }
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
    () => unsafeWindow.onLoginInfoLoaded !== undefined,
  )
  return new Promise<void>((resolve, reject) => {
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
export const aidReady = async () => {
  if (unsafeWindow.aid) {
    return unsafeWindow.aid
  }
  const { sq } = await import('../spin-query')
  const info = await sq(
    () => unsafeWindow?.player?.getVideoMessage?.() as { aid?: string },
    it => it?.aid !== undefined,
  ).catch(() => { throw new Error('Cannot find aid') })
  unsafeWindow.aid = info.aid
  return info.aid as string
}
/** 是否正在打字 */
export const isTyping = () => {
  const { activeElement } = document
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
  let url: string
  if (element.hasAttribute('data-src')) {
    url = element.getAttribute('data-src')
  } else if (element instanceof HTMLImageElement) {
    url = element.src
  } else {
    const { backgroundImage } = element.style
    if (!backgroundImage) {
      return null
    }
    const match = backgroundImage.match(/url\("(.+)"\)/)
    if (!match) {
      return null
    }
    url = match[1]
  }
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
