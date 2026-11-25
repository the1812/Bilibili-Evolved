import {
  BADGE_CLASS,
  IMG_BASE_H_VAR,
  IMG_BASE_W_VAR,
  IMG_H_SCALED_CLASS,
  IMG_W_SCALED_CLASS,
  INFLATED_IMG_SELECTOR,
  ROLL_DANMAKU_SELECTOR,
} from './types'

const IGNORED_CLASS_PARTS = [BADGE_CLASS, 'fans-medal', 'medal', 'guard-icon', 'admin-icon']

export const normalizeDanmakuText = (text: string): string => {
  if (!text) {
    return ''
  }
  return text.replace(/\s+/gu, '')
}

// 将表情占位符折算为 2 个视觉字符，避免长 URL 过度拉大入场位移补偿
export const estimateDisplayLength = (rawText: string): number =>
  rawText.replace(/\[emoji:[^\]]+\]/g, '表情').length

const getClassString = (el: Element): string => {
  const cls = el.className || ''
  return typeof cls === 'string' ? cls : (cls as unknown as SVGAnimatedString).baseVal || ''
}

const isPositivePx = (value: string): boolean => {
  const trimmed = value.trim()
  return trimmed.endsWith('px') && parseFloat(trimmed) > 0
}

const recordImageBaseDimension = (
  img: HTMLImageElement,
  prop: 'width' | 'height',
  cssVar: string,
  scaledClass: string,
) => {
  if (img.classList.contains(scaledClass)) {
    return
  }
  const inlineVal = img.style[prop]
  if (isPositivePx(inlineVal)) {
    img.style.setProperty(cssVar, inlineVal.trim())
    img.classList.add(scaledClass)
  }
}

// 记录表情图片原生内联像素基准（零布局回流），配合 --bili-dm-scale 等比放大
export const syncInflatedImages = (el: HTMLElement): void => {
  const imgs = el.querySelectorAll<HTMLImageElement>(INFLATED_IMG_SELECTOR)
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i]
    recordImageBaseDimension(img, 'width', IMG_BASE_W_VAR, IMG_W_SCALED_CLASS)
    recordImageBaseDimension(img, 'height', IMG_BASE_H_VAR, IMG_H_SCALED_CLASS)
  }
}

export const isRollDanmakuElement = (el: Node | null | undefined): boolean => {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) {
    return false
  }
  const { classList } = el as HTMLElement
  if (classList.contains('bili-danmaku-x-top') || classList.contains('bili-danmaku-x-bottom')) {
    return false
  }
  return (
    classList.contains('bili-danmaku-x-dm') ||
    classList.contains('bili-dm') ||
    classList.contains('danmaku-item')
  )
}

export const filterNestedDanmaku = (
  elements: NodeListOf<HTMLElement> | HTMLElement[],
): HTMLElement[] =>
  Array.from(elements).filter(el => !el.parentElement?.closest?.(ROLL_DANMAKU_SELECTOR))

// 读取 B 站为自己发出的弹幕写入的内联边框色
export const extractSelfBorderColor = (el: HTMLElement): string | null => {
  const { borderStyle, borderWidth, borderColor } = el.style
  if (!borderStyle || borderStyle === 'none' || borderStyle === 'hidden') {
    return null
  }
  if (!borderWidth || parseFloat(borderWidth) <= 0) {
    return null
  }
  if (!borderColor || borderColor === 'transparent') {
    return null
  }
  return borderColor
}

const tryFastExtractText = (el: HTMLElement): string | null => {
  const { firstChild, childNodes } = el
  if (childNodes.length !== 1 || !firstChild) {
    return null
  }
  if (firstChild.nodeType === Node.TEXT_NODE) {
    return (firstChild.textContent || '').trim()
  }
  if (firstChild.nodeType !== Node.ELEMENT_NODE) {
    return null
  }
  const wrapper = firstChild as HTMLElement
  if (wrapper.tagName === 'IMG' || wrapper.querySelector('img')) {
    return null
  }
  const classStr = getClassString(wrapper)
  if (classStr.includes('badge') || classStr.includes('medal') || classStr.includes('icon')) {
    return null
  }
  const text = (wrapper.textContent || '').trim()
  return text || null
}

const formatEmojiToken = (img: HTMLImageElement): string => {
  const alt = img.getAttribute('alt')
  if (alt) {
    return `[emoji:${alt}]`
  }
  const rawSrc = img.getAttribute('src') || 'emoji'
  const cleanSrc = rawSrc.split('?')[0].split('@')[0]
  return `[emoji:${cleanSrc}]`
}

export const extractDanmakuText = (el: HTMLElement): string => {
  if (!el) {
    return ''
  }
  const fastText = tryFastExtractText(el)
  if (fastText !== null) {
    return fastText
  }

  let text = ''
  const stack: Node[] = [el]
  while (stack.length > 0) {
    const node = stack.pop()
    if (!node) {
      continue
    }
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || ''
      continue
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      continue
    }

    const element = node as HTMLElement
    const classStr = getClassString(element)
    if (IGNORED_CLASS_PARTS.some(part => classStr.includes(part))) {
      continue
    }

    if (classStr.includes('emoji') || classStr.includes('emoticon') || element.tagName === 'IMG') {
      const img =
        element.tagName === 'IMG' ? (element as HTMLImageElement) : element.querySelector('img')
      if (img) {
        text += formatEmojiToken(img)
        continue
      }
    }

    // 倒序入栈以保持正序遍历
    const children = node.childNodes
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i])
    }
  }
  return text.trim()
}
