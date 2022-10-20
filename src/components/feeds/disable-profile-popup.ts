import { select } from '@/core/spin-query'

let eventAttached = false
let counter = 0
export const DisableProfilePopupClass = 'disable-profile-popup'

/** 禁止动态首页 - 正在直播中鼠标经过时出现 profile 弹窗 */
export const disableProfilePopup = async () => {
  if (document.URL.replace(window.location.search, '') !== 'https://t.bilibili.com/') {
    return
  }
  const list = (await select('.live-up-list, .bili-dyn-live-users__body')) as HTMLElement
  if (list === null) {
    return
  }
  counter++
  if (eventAttached) {
    return
  }
  list.addEventListener(
    'mouseenter',
    e => {
      if (counter > 0) {
        e.stopImmediatePropagation()
      }
    },
    { capture: true },
  )
  eventAttached = true
}
/** 取消一次 {@link disableProfilePopup} 的效果, 可以用来配合其他地方的生命周期 */
export const enableProfilePopup = () => {
  counter--
}
