import { mutationObserve } from '@/core/observer'
import { getCookieValue, getVue2Data, matchUrlPattern } from '@/core/utils'

export const darkModeUrlExclude = [
  /^https:\/\/(?:app|d|love|member|passport)\.bilibili\.com\//,
  /^https:\/\/www\.bilibili\.com\/(?:audio|blackroom|festival|protocal|v\/copyright)\//,
]

export const isExcludedPage = () => darkModeUrlExclude.some(matchUrlPattern)
const isBlackboardPage = () => matchUrlPattern(/^https:\/\/www\.bilibili\.com\/blackboard\//)
const isMangaPage = () => matchUrlPattern(/^https:\/\/manga\.bilibili\.com\//)
export const usesLiveThemeAttribute = () =>
  matchUrlPattern(/^https:\/\/(?:live|link)\.bilibili\.com\//)
const liveThemeAttribute = 'lab-style'
const biliThemeChangeEvent = 'biliThemeChange'
const globalThemeChangeEvent = 'global.themeChange'
const officialThemeAppliedEvent = 'be:integrated-dark-mode:official-theme-applied'

type OfficialTheme = 'light' | 'dark'
interface BiliHeaderThemeProps {
  theme?: string
  themeSwitchHandler?: (theme: OfficialTheme) => void
}
type BiliHeaderContainer = HTMLElement & {
  __vue_app__?: { _instance?: { props?: BiliHeaderThemeProps } }
}

const themeStyleFilterSelector = '#__css-map-filter__'
const appContainerSelector = '#app'
const headerContainerSelector = '#biliMainHeader'
const officialDarkClass = 'bili_dark'
export const integratedDarkModeClass = 'integrated-dark'

const getThemeStyleLink = () => document.querySelector<HTMLLinkElement>('#__css-map__')

const isOfficialDarkModeEnabled = () => {
  if (isBlackboardPage()) {
    return getThemeStyleLink()?.href.includes('dark') ?? false
  }
  if (isMangaPage()) {
    return document.documentElement.classList.contains('theme-dark')
  }
  return getCookieValue('theme_style') === 'dark'
}

export const isPageDarkModeEnabled = () =>
  document.body?.classList.contains(integratedDarkModeClass) ||
  document.documentElement.classList.contains(officialDarkClass) ||
  isOfficialDarkModeEnabled()

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

const isOfficialThemeForcedLight = () => {
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

export const isThemePageRestricted = () =>
  isExcludedPage() || (isBlackboardPage() && !getThemeStyleLink()) || isOfficialThemeForcedLight()

export const isDarkModePageBlocked = () =>
  isThemePageRestricted() ||
  (usesLiveThemeAttribute() && document.documentElement.getAttribute(liveThemeAttribute) !== 'dark')

const canSyncOfficialTheme = () => !usesLiveThemeAttribute() && !isThemePageRestricted()

export const readOfficialDarkMode = () =>
  canSyncOfficialTheme() ? isOfficialDarkModeEnabled() : undefined

export const onOfficialThemeChange = (callback: () => void) => {
  document.addEventListener(biliThemeChangeEvent, callback)
  document.addEventListener(globalThemeChangeEvent, callback)
  return () => {
    document.removeEventListener(biliThemeChangeEvent, callback)
    document.removeEventListener(globalThemeChangeEvent, callback)
  }
}

export const observeLiveTheme = (onChange: () => void) =>
  mutationObserve([document.documentElement], { attributeFilter: [liveThemeAttribute] }, onChange)

export const observeOfficialTheme = (onChange: () => void, onApplied: (dark: boolean) => void) => {
  if (isMangaPage()) {
    mutationObserve([document.documentElement], { attributeFilter: ['class'] }, onChange)
  }
  onOfficialThemeChange(onChange)
  document.addEventListener(officialThemeAppliedEvent, (event: CustomEvent<OfficialTheme>) => {
    if (canSyncOfficialTheme()) {
      onApplied(event.detail === 'dark')
    }
  })
}

export const applyOfficialTheme = async (theme: OfficialTheme) => {
  if (!canSyncOfficialTheme()) {
    return
  }
  const headerProps = getHeaderThemeProps()
  const themeStyleLink = getThemeStyleLink()
  if (themeStyleLink) {
    themeStyleLink.href = new URL(`${theme}.css`, themeStyleLink.href).href
    updateMapFilter(theme)
  }
  document.documentElement.classList.toggle(officialDarkClass, theme === 'dark')
  await updateHostCookie(theme)
  document.dispatchEvent(new CustomEvent(officialThemeAppliedEvent, { detail: theme }))
  document.dispatchEvent(
    new CustomEvent(biliThemeChangeEvent, { detail: { theme }, bubbles: true, cancelable: true }),
  )
  callThemeSwitchHandler(theme, headerProps)
  document.dispatchEvent(new CustomEvent(globalThemeChangeEvent, { detail: theme }))
}
