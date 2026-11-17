import { getVue2Data } from '@/core/utils'

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

const getHeaderThemeProps = (root = unsafeWindow.document) => {
  const headerContainer = root.querySelector(headerContainerSelector) as BiliHeaderContainer | null
  // eslint-disable-next-line no-underscore-dangle
  return headerContainer?.__vue_app__?._instance?.props
}

export const isOfficialThemeForcedLight = () => {
  let currentDocument: Document | undefined = unsafeWindow.document
  while (currentDocument) {
    if (getHeaderThemeProps(currentDocument)?.theme === 'light') {
      return true
    }
    // 处理嵌套 iframe 的情况, 向上查找父文档
    currentDocument = currentDocument.defaultView?.frameElement?.ownerDocument
  }
  return false
}

export const applyOfficialTheme = async (theme: OfficialTheme) => {
  if (isOfficialThemeForcedLight()) {
    return
  }
  const headerProps = getHeaderThemeProps()
  const themeStyleLink = dq(themeStyleLinkSelector) as HTMLLinkElement | null
  document.documentElement.classList.toggle(officialDarkClass, theme === 'dark')
  if (themeStyleLink) {
    themeStyleLink.href = new URL(`${theme}.css`, themeStyleLink.href).href
    updateMapFilter(theme)
  }
  await updateHostCookie(theme)
  document.dispatchEvent(
    new CustomEvent('biliThemeChange', { detail: { theme }, bubbles: true, cancelable: true }),
  )
  callThemeSwitchHandler(theme, headerProps)
  document.dispatchEvent(new CustomEvent('global.themeChange', { detail: theme }))
}
