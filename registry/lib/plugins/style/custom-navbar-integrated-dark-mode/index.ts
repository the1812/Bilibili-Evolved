import { PluginMetadata } from '@/plugins/plugin'
import { getCookieValue, getVue2Data } from '@/core/utils'
import { CustomNavbarItemInit } from '../../../components/style/custom-navbar/custom-navbar-item'

type OfficialTheme = 'light' | 'dark'
interface BiliHeaderThemeProps {
  theme?: string
  themeSwitchHandler?: (theme: OfficialTheme) => void
}
type BiliHeaderContainer = HTMLElement & {
  __vue_app__?: { _instance?: { props?: BiliHeaderThemeProps } }
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

const callThemeSwitchHandler = (theme: OfficialTheme, headerProps?: BiliHeaderThemeProps) => {
  if (headerProps?.themeSwitchHandler) {
    headerProps.themeSwitchHandler(theme)
    return
  }
  try {
    getVue2Data(unsafeWindow.document.querySelector(appContainerSelector))?.themeSwitchHandler?.(
      theme,
    )
  } catch {
    // #app 为空时 getVue2Data 会抛错, 此时页面也没有该回调
  }
}

const updateHostCookie = (targetMode: OfficialTheme) =>
  cookieStore.set({
    name: 'theme_style',
    value: targetMode,
    path: '/',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    domain: 'bilibili.com',
  })

export const applyOfficialTheme = async (theme: OfficialTheme) => {
  const headerContainer = unsafeWindow.document.querySelector(
    headerContainerSelector,
  ) as BiliHeaderContainer | null
  // eslint-disable-next-line no-underscore-dangle
  const headerProps = headerContainer?.__vue_app__?._instance?.props
  if (headerProps?.theme === 'light') {
    return
  }
  document.documentElement.classList.toggle(officialDarkClass, theme === 'dark')
  const themeStyleLink = dq(themeStyleLinkSelector) as HTMLLinkElement | null
  if (themeStyleLink) {
    themeStyleLink.href = `${themeStyleBaseUrl}/${theme}.css`
    updateMapFilter(theme)
  }
  await updateHostCookie(theme)
  document.dispatchEvent(
    new CustomEvent('biliThemeChange', { detail: { theme }, bubbles: true, cancelable: true }),
  )
  callThemeSwitchHandler(theme, headerProps)
  document.dispatchEvent(new CustomEvent('global.themeChange', { detail: theme }))
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
        clickAction: () =>
          applyOfficialTheme(getCookieValue('theme_style') === 'dark' ? 'light' : 'dark'),
      })
    })
  },
}
