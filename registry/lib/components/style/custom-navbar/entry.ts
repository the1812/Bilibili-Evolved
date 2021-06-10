import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'
import { isIframe, isNotHtml, mountVueComponent } from '@/core/utils'

export const entry: ComponentEntry = async ({ metadata: { name } }) => {
  // const url = document.URL.replace(location.search, '')
  // const isHome = url === 'https://www.bilibili.com/' || url === 'https://www.bilibili.com/index.html'
  if (
    isIframe()
    // (getComponentSettings('bilibiliSimpleNewHomeCompatible').enabled && isHome) ||
    || isNotHtml()
  ) {
    return
  }

  addComponentListener(`${name}.padding`, value => {
    document.documentElement.style.setProperty('--navbar-bounds-padding', `${value}%`)
  }, true)
  if (!document.URL.startsWith('https://space.bilibili.com')) {
    addComponentListener(`${name}.globalFixed`, value => {
      document.body.classList.toggle('fixed-navbar', value)
    }, true)
  }
  const CustomNavbar = await import('./CustomNavbar.vue')
  const customNavbar: Vue & {
    styles: string[]
    toggleStyle: (value: boolean, style: string) => void
  } = mountVueComponent(CustomNavbar)
  document.body.insertAdjacentElement('beforeend', customNavbar.$el);
  ['fill', 'shadow', 'blur'].forEach(style => {
    addComponentListener(
      `${name}.${style}`,
      value => customNavbar.toggleStyle(value, style),
      true,
    )
  })
}
