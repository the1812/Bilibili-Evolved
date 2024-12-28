import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'
import { isIframe, isNotHtml, matchUrlPattern, mountVueComponent } from '@/core/utils'
import { setupNotifyStyle } from './notify-style'
import { setupLinkPopupContentAlignStyle } from './link-popup-content-align-style'

export const entry: ComponentEntry = async ({ metadata: { name } }) => {
  // const url = document.URL.replace(location.search, '')
  // const isHome = url === 'https://www.bilibili.com/' || url === 'https://www.bilibili.com/index.html'
  if (
    isIframe() ||
    // (getComponentSettings('bilibiliSimpleNewHomeCompatible').enabled && isHome) ||
    isNotHtml()
  ) {
    return
  }

  addComponentListener(
    `${name}.padding`,
    value => {
      document.documentElement.style.setProperty('--navbar-bounds-padding', `${value}%`)
    },
    true,
  )
  addComponentListener(
    `${name}.searchBarWidth`,
    value => {
      document.documentElement.style.setProperty('--navbar-search-width', `${value}vw`)
    },
    true,
  )
  const globalFixedExclude = [
    'https://space.bilibili.com',
    'https://www.bilibili.com/read',
    'https://www.bilibili.com/opus',
    'https://www.bilibili.com/account/history',
    'https://www.bilibili.com/v/topic/detail',
  ]
  if (!globalFixedExclude.some(p => matchUrlPattern(p))) {
    addComponentListener(
      `${name}.globalFixed`,
      value => {
        document.body.classList.toggle('fixed-navbar', value)
      },
      true,
    )
  }
  // https://github.com/the1812/Bilibili-Evolved/issues/4459
  if (matchUrlPattern('https://www.bilibili.com/account/history')) {
    document.body.classList.add('history-page')
  }
  const CustomNavbar = await import('./CustomNavbar.vue')
  const customNavbar: Vue & {
    styles: string[]
    toggleStyle: (value: boolean, style: string) => void
  } = mountVueComponent(CustomNavbar)
  document.body.insertAdjacentElement('beforeend', customNavbar.$el)
  ;['fill', 'shadow', 'blur'].forEach(style => {
    addComponentListener(`${name}.${style}`, value => customNavbar.toggleStyle(value, style), true)
  })
  setupNotifyStyle()
  setupLinkPopupContentAlignStyle()
}
