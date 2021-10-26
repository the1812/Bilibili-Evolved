import { waitForControlBar } from '@/components/live/live-control-bar'
import { ComponentMetadata } from '@/components/types'
import { addStyle } from '@/core/style'
import { liveUrls } from '@/core/utils/urls'
import giftBoxStyle from './gift-box.scss'

const fullscreenGiftBoxClass = 'fullscreen-gift-box'
const entry = async () => {
  let giftBoxButton: HTMLDivElement
  waitForControlBar({
    init: () => addStyle(giftBoxStyle, 'fullscreen-gift-box'),
    callback: async controlBar => {
      const rightController = dq(controlBar, '.right-area') as HTMLDivElement
      if (!rightController) {
        console.warn('[fullscreenGiftBox] ref elements not found', rightController === null)
        return
      }
      if (dq(rightController, `.${fullscreenGiftBoxClass}`)) {
        return
      }
      if (!giftBoxButton) {
        const originalGiftBoxClass = '.gift-package'
        giftBoxButton = document.createElement('div')
        giftBoxButton.innerHTML = '包裹'
        giftBoxButton.classList.add(fullscreenGiftBoxClass)
        giftBoxButton.addEventListener('click', () => {
          const button = dq(originalGiftBoxClass) as HTMLElement
          button?.click()
        })
      }
      rightController.appendChild(giftBoxButton)
    },
  })
}

export const component: ComponentMetadata = {
  name: 'liveGiftBox',
  displayName: '直播全屏包裹',
  description: {
    'zh-CN': '在直播的网页全屏(不能是全屏)模式下往控制栏添加包裹按钮',
  },
  urlInclude: liveUrls,
  tags: [componentsTags.live],
  entry,
  reload: () => document.body.classList.remove(`${fullscreenGiftBoxClass}-unloaded`),
  unload: () => document.body.classList.add(`${fullscreenGiftBoxClass}-unloaded`),
}
