import { styledComponentEntry } from '@/components/styled-component'
import { Options } from '.'

const resizeRegex = /@(\d+)[Ww](_(\d+)[Hh])?/

/** 排除 */
const excludeSelectors = ['#certify-img1', '#certify-img2']
/** 需要设置 height */
const heightSelectors = [
  // 动态头像框必须设高度
  // https://github.com/the1812/Bilibili-Evolved/issues/2030
  '.bili-avatar-img',
]
/** width 和 height 都得设置 */
const widthAndHeightSelectors = [
  // 首页 Logo
  // https://github.com/the1812/Bilibili-Evolved/issues/4480
  '.logo-img',
]
const originalImageInArticlesSelectors = ['.article-detail .article-content img']

const walk = (rootElement: Node, action: (node: HTMLElement) => void) => {
  const walker = document.createNodeIterator(rootElement, NodeFilter.SHOW_ELEMENT)
  let node = walker.nextNode()
  while (node) {
    action(node as HTMLElement)
    node = walker.nextNode()
  }
}

interface ImageResolutionHandler {
  getWidth: (width: number, element: HTMLElement) => number
  getHeight: (height: number, element: HTMLElement) => number
}

/**
 * 从开始元素`element`向下遍历所有子节点, 更换其中的图片URL至目标DPI
 * @param dpi 目标DPI
 * @param element 开始元素
 */
export const imageResolution = async (
  element: HTMLElement,
  resolutionHandler: ImageResolutionHandler,
) => {
  const { attributes } = await import('@/core/observer')
  const replaceSource = (
    getValue: (e: HTMLElement) => string | null,
    setValue: (e: HTMLElement, v: string) => void,
  ) => {
    const value = getValue(element)
    if (value === null) {
      return
    }
    if (excludeSelectors.some(it => element.matches(it))) {
      return
    }
    // 带 , 的 srcset 不处理
    if (value.includes(',')) {
      return
    }

    const match = value.match(resizeRegex)
    if (!match) {
      return
    }
    const [, currentWidth, , currentHeight] = match
    const lastWidth = parseInt(element.getAttribute('data-resolution-width') || '0')
    if (parseInt(currentWidth) >= lastWidth && lastWidth !== 0) {
      return
    }

    if (
      element.getAttribute('width') === null &&
      element.getAttribute('height') === null &&
      currentHeight !== undefined
    ) {
      if (widthAndHeightSelectors.some(selector => element.matches(selector))) {
        element.setAttribute('height', currentHeight)
        element.setAttribute('width', currentWidth)
      } else if (heightSelectors.some(selector => element.matches(selector))) {
        element.setAttribute('height', currentHeight)
      } else {
        element.setAttribute('width', currentWidth)
      }
    }

    const getReplacedValue = (newWidth: number, newHeight?: number) => {
      if (newWidth === Infinity || newHeight === Infinity) {
        return value.replace(resizeRegex, '@')
      }
      if (newHeight === undefined) {
        return value.replace(resizeRegex, `@${newWidth}w`)
      }
      return value.replace(resizeRegex, `@${newWidth}w_${newHeight}h`)
    }
    if (currentHeight !== undefined) {
      const newWidth = resolutionHandler.getWidth(parseInt(currentWidth), element)
      const newHeight = resolutionHandler.getHeight(parseInt(currentHeight), element)
      element.setAttribute('data-resolution-width', newWidth.toString())
      setValue(element, getReplacedValue(newWidth, newHeight))
    } else {
      const newWidth = resolutionHandler.getWidth(parseInt(currentWidth), element)
      element.setAttribute('data-resolution-width', newWidth.toString())
      setValue(element, getReplacedValue(newWidth))
    }
  }
  attributes(element, () => {
    replaceSource(
      e => e.getAttribute('src'),
      (e, v) => e.setAttribute('src', v),
    )
    replaceSource(
      e => e.getAttribute('srcset'),
      (e, v) => e.setAttribute('srcset', v),
    )
    replaceSource(
      e => e.style.backgroundImage,
      (e, v) => (e.style.backgroundImage = v),
    )
  })
}
export const startResolution = styledComponentEntry<Options>(
  () => import('./fix.scss'),
  async ({ settings }) => {
    const { allMutations } = await import('@/core/observer')
    const dpi =
      settings.options.scale === 'auto'
        ? window.devicePixelRatio
        : parseFloat(settings.options.scale)
    const handleResolution: ImageResolutionHandler = {
      getWidth: (currentWidth, element) => {
        if (
          settings.options.originalImageInArticles &&
          originalImageInArticlesSelectors.some(selector => element.matches(selector))
        ) {
          return Infinity
        }
        return Math.round(dpi * currentWidth)
      },
      getHeight: (currentHeight, element) => {
        if (
          settings.options.originalImageInArticles &&
          originalImageInArticlesSelectors.some(selector => element.matches(selector))
        ) {
          return Infinity
        }
        return Math.round(dpi * currentHeight)
      },
    }

    walk(document.body, it => imageResolution(it, handleResolution))
    allMutations(records => {
      records.forEach(record =>
        record.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            imageResolution(node, handleResolution)
            if (node.nodeName.toUpperCase() !== 'IMG') {
              walk(node, it => imageResolution(it, handleResolution))
            }
          }
        }),
      )
    })
  },
)
