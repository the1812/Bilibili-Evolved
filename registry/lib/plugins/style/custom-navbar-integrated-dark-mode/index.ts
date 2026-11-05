import { PluginMetadata } from '@/plugins/plugin'
import { getCookieValue, getVue2Data } from '@/core/utils'
import { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'

type OfficialTheme = 'light' | 'dark'
type BiliHeaderContainer = HTMLElement & {
  __vue_app__?: { _instance?: { props?: { theme?: string } } }
}

const themeStyleLinkSelector = '#__css-map__'
const themeStyleFilterSelector = '#__css-map-filter__'
const appContainerSelector = '#app'
const headerContainerSelector = '#biliMainHeader'
const officialDarkClass = 'bili_dark'
const themeStyleBaseUrl = '//s1.hdslb.com/bfs/seed/jinkela/short/bili-theme'

// #__css-map-filter__ (若有) 是深色补丁样式, light 时整体注释
const updateMapFilter = (theme: OfficialTheme) => {
  const mapFilter = dq(themeStyleFilterSelector) as HTMLElement | null
  if (!mapFilter) {
    return
  }
  // 先取本体, 重复执行稳定
  const css = mapFilter.innerText.trim().replace(/^[/*]+|[*/]+$/g, '')
  mapFilter.innerHTML = theme === 'light' ? `/*${css}*/` : css
}

// 动态页、消息页等页面的背景图由根组件的 themeSwitchHandler 驱动
const callThemeSwitchHandler = (theme: OfficialTheme) => {
  try {
    getVue2Data(dq(appContainerSelector))?.themeSwitchHandler?.(theme)
  } catch {
    // #app 为空时 getVue2Data 会抛错, 此时页面也没有该回调
  }
}

const updateHostCookie = (targetMode: OfficialTheme) => {
  cookieStore.set({
    name: 'theme_style',
    value: targetMode,
    path: '/',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    domain: 'bilibili.com',
  })
}

// 等效于官方顶栏的主题切换流程
export const applyOfficialTheme = (theme: OfficialTheme) => {
  const headerContainer = dq(headerContainerSelector) as BiliHeaderContainer | null
  // 头部强制浅色的页面不应用
  // eslint-disable-next-line no-underscore-dangle
  if (headerContainer?.__vue_app__?._instance?.props?.theme === 'light') {
    return
  }
  document.documentElement.classList.toggle(officialDarkClass, theme === 'dark')
  const themeStyleLink = dq(themeStyleLinkSelector) as HTMLLinkElement | null
  if (themeStyleLink) {
    themeStyleLink.href = `${themeStyleBaseUrl}/${theme}.css`
    updateMapFilter(theme)
  }
  callThemeSwitchHandler(theme)
  updateHostCookie(theme)
}

export const plugin: PluginMetadata = {
  name: 'customNavbar.items.integratedDarkMode',
  displayName: '自定义顶栏 - 深色模式开关',
  async setup({ addData }) {
    addData('customNavbar.items', (items: CustomNavbarItemInit[]) => {
      items.push({
        name: 'integratedDarkMode',
        displayName: '深色模式开关',
        content: () => import('./NavbarIntegratedDarkMode.vue'),
        clickAction: () => {
          applyOfficialTheme(getCookieValue('theme_style') === 'dark' ? 'light' : 'dark')
        },
      })
    })
  },
}
