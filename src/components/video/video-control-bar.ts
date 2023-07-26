import { videoChange } from '@/core/observer'
import { matchUrlPattern } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'

export interface VideoControlBarItem {
  name: string
  displayName: string
  icon: string
  order: number
  action: (event: MouseEvent) => void | Promise<void>
}
const controlBarClass = '.be-video-control-bar-extend'
let controlBarInstance: Promise<Vue> = null
const controlBarItems: VideoControlBarItem[] = []
const initControlBar = lodash.once(async () => {
  if (!playerUrls.some(url => matchUrlPattern(url))) {
    return Promise.resolve<Vue>(null)
  }
  const { playerAgent } = await import('@/components/video/player-agent')

  // 更改原始 control bar，实现溢出时横向滚动的功能
  await (async () => {
    // **实现原理**
    //
    // 1. 在原来的控制栏（rawBottom）外包裹一层新元素（placeholder）
    // 2. 将 placeholder 替换到 rawBottom 的位置
    // 3. placeholder 的高度设为 rawBottom 的高度，并随其响应式更新
    // 4. rawBottom 设为绝对定位（相对于 placeholder） ，宽度设为 max-content，最小宽度设为视频的宽度（响应更新）
    // 5. 监听 rawBottom 上的滚动事件，通过设置 CSS 属性——translate, clip-path——来实现滚动效果
    //
    // **为什么不用 overflow**
    //
    // 使用 overflow 会使空间的弹出内容被遮盖

    const observeSizeChange = (el: Element, onChange: () => void) =>
      new ResizeObserver(onChange).observe(el)

    // 设置原 control bar 的样式，添加事件等
    const settingRawBottom = (rawBottom: HTMLElement): void => {
      const parent = rawBottom.parentElement
      // 设置与滚动相关的样式。scroll 值会自动限制到可滚动范围。返回当前实际的滚动值
      // 当容器或内容的宽度改变时，应调用该函数重设
      const resetScrollStyles = (scroll: number): number => {
        const content = rawBottom.offsetWidth
        const container = parent.offsetWidth
        const left = lodash.clamp(scroll, 0, content - container)
        const right = container - left - content
        rawBottom.style.translate = `-${left}px 0`
        rawBottom.style.clipPath = `margin-box chip(0 ${right}px 0 ${left}px)`
        return left
      }
      const getMinWidth = () => {
        const computed = getComputedStyle(rawBottom)
        return parent.offsetWidth - parseInt(computed.paddingLeft) - parseInt(computed.paddingRight)
      }
      // 更改样式
      rawBottom.style.minWidth = `${getMinWidth()}px`
      rawBottom.style.width = 'max-content'
      rawBottom.style.position = 'absolute'
      let scroll = resetScrollStyles(0)
      // 响应父元素或自身的宽度变化
      observeSizeChange(parent, () => {
        rawBottom.style.minWidth = `${getMinWidth()}px`
        scroll = resetScrollStyles(scroll)
      })
      observeSizeChange(rawBottom, () => (scroll = resetScrollStyles(scroll)))
      // 响应鼠标滚动
      rawBottom.addEventListener('wheel', e => {
        e.preventDefault()
        scroll = resetScrollStyles(scroll + e.deltaY)
      })
    }

    // 就地包装原 control bar
    const wrapRawBottonInPlace = (rawBottom: HTMLElement): void => {
      const placeholder = document.createElement('div')
      placeholder.classList.value = 'be-control-bar-placeholder'
      placeholder.style.position = 'relative'
      placeholder.style.width = '100%'
      const getMarginBoxHeight = (): number => {
        const computed = getComputedStyle(rawBottom)
        return (
          parseInt(computed.marginTop) + rawBottom.offsetHeight + parseInt(computed.marginBottom)
        )
      }
      placeholder.style.height = `${getMarginBoxHeight()}px`
      observeSizeChange(rawBottom, () => (placeholder.style.height = `${getMarginBoxHeight()}px`))
      const parent = rawBottom.parentNode
      parent.replaceChild(placeholder, rawBottom)
      placeholder.appendChild(rawBottom)
    }

    const rawBottom = await playerAgent.query.control.bottom()
    settingRawBottom(rawBottom)
    wrapRawBottonInPlace(rawBottom)
  })()

  return new Promise<Vue>(resolve => {
    videoChange(async () => {
      const time = await playerAgent.query.control.buttons.time()
      const VideoControlBar = await import('./VideoControlBar.vue').then(m => m.default)
      if (time === null || time.parentElement?.querySelector(controlBarClass) !== null) {
        return
      }
      const instance = new VideoControlBar({
        propsData: {
          items: controlBarItems,
        },
      }).$mount()
      time.insertAdjacentElement('afterend', instance.$el)
      resolve(instance)
    })
  })
})
/** 向视频控制栏添加按钮 */
export const addControlBarButton = async (button: VideoControlBarItem) => {
  if (!controlBarInstance) {
    controlBarInstance = initControlBar()
  }
  const created = await controlBarInstance
  if (!created) {
    return
  }
  controlBarItems.push(button)
}
