import { ComponentMetadata } from '@/components/types'
import { urlInclude, urlExclude } from './urls'
import { entry } from './entry'

const styleID = 'custom-navbar-style'
export const component: ComponentMetadata = {
  name: 'customNavbar',
  displayName: '自定义顶栏',
  entry,
  tags: [
    componentsTags.style,
    componentsTags.general,
  ],
  options: {
    hidden: {
      hidden: true,
      defaultValue: ['blank1', 'blank4', 'drawing', 'music', 'gamesIframe', 'bangumi', 'match'],
      displayName: '隐藏的元素',
    },
    order: {
      hidden: true,
      defaultValue: {},
      displayName: '元素顺序',
    },
    padding: {
      hidden: true,
      defaultValue: 10,
      displayName: '边缘间距(%)',
    },
    globalFixed: {
      defaultValue: false,
      displayName: '全局固定',
    },
    fill: {
      defaultValue: false,
      displayName: '主题色填充',
    },
    transparent: {
      defaultValue: true,
      displayName: '透明填充',
    },
    blur: {
      defaultValue: false,
      displayName: '背景模糊',
    },
    shadow: {
      defaultValue: true,
      displayName: '投影',
    },
    seasonLogo: {
      defaultValue: false,
      displayName: '使用季节Logo',
    },
    touch: {
      defaultValue: false,
      displayName: '触摸模式',
    },
  },
  urlInclude,
  urlExclude,
  instantStyles: [
    {
      name: styleID,
      style: () => import('./hide-original.scss'),
      important: true,
    },
  ],
  unload: async () => {
    const navbar = document.querySelectorAll('.custom-navbar,.custom-navbar-settings')
    navbar.forEach((it: HTMLElement) => (it.style.display = 'none'))
    // document.getElementById(styleID)?.remove()
  },
  reload: async () => {
    const navbar = document.querySelectorAll('.custom-navbar,.custom-navbar-settings')
    navbar.forEach((it: HTMLElement) => (it.style.display = 'flex'))
    // const { default: style } = await import('./hide-original.scss')
    // const { addImportantStyle } = await import('@/core/style')
    // addImportantStyle(style, styleID)
  },
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
}
