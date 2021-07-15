import { styledComponentEntry } from '@/components/styled-component'

const resizeRegex = /@(\d+)[Ww]_(\d+)[Hh]/
const excludeSelectors = [
  '#certify-img1',
  '#certify-img2',
]
const walk = (rootElement: Node, action: (node: HTMLElement) => void) => {
  const walker = document.createNodeIterator(rootElement, NodeFilter.SHOW_ELEMENT)
  let node = walker.nextNode()
  while (node) {
    action(node as HTMLElement)
    node = walker.nextNode()
  }
}
/**
 * 从开始元素`element`向下遍历所有子节点, 更换其中的图片URL至目标DPI
 * @param dpi 目标DPI
 * @param element 开始元素
 */
export const imageResolution = async (dpi: number, element: HTMLElement) => {
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
    const match = value.match(resizeRegex)
    if (!match) {
      return
    }
    let [, width, height] = match
    const lastWidth = parseInt(element.getAttribute('data-resolution-width') || '0')
    if (parseInt(width) >= lastWidth && lastWidth !== 0) {
      return
    }
    if (element.getAttribute('width') === null && element.getAttribute('height') === null) {
      if (element.classList.contains('bili-avatar-img')) {
        // 动态头像框必须设高度
        // https://github.com/the1812/Bilibili-Evolved/issues/2030
        element.setAttribute('height', height)
      } else {
        element.setAttribute('width', width)
      }
    }
    width = Math.round(dpi * parseInt(width)).toString()
    height = Math.round(dpi * parseInt(height)).toString()
    element.setAttribute('data-resolution-width', width)
    setValue(element, value.replace(resizeRegex, `@${width}w_${height}h`))
  }
  attributes(element, () => {
    replaceSource(e => e.getAttribute('src'), (e, v) => e.setAttribute('src', v))
    replaceSource(e => e.style.backgroundImage, (e, v) => (e.style.backgroundImage = v))
  })
}
export const startResolution = styledComponentEntry(() => import('./fix.scss'),
  async ({ settings }) => {
    const { allMutations } = await import('@/core/observer')
    const dpi = settings.options.scale === 'auto'
      ? window.devicePixelRatio
      : parseFloat(settings.options.scale)
    walk(document.body, it => imageResolution(dpi, it))
    allMutations(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          imageResolution(dpi, node)
          if (node.nodeName.toUpperCase() !== 'IMG') {
            walk(node, it => imageResolution(dpi, it))
          }
        }
      }))
    })
  })
