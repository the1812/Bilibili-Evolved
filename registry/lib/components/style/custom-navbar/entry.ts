import type { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'
import { isIframe, isNotHtml, matchUrlPattern, mountVueComponent } from '@/core/utils'
import { setupNotifyStyle } from './notify-style'

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
    'https://www.bilibili.com/account/history',
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
  const [el, vm] = mountVueComponent(await import('./CustomNavbar.vue'))
  document.body.insertAdjacentElement('beforeend', el)
  ;['fill', 'shadow', 'blur'].forEach(style => {
    addComponentListener(`${name}.${style}`, value => vm.toggleStyle(value, style), true)
  })
  setupNotifyStyle()
}
