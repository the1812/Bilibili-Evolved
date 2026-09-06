import { defineComponentMetadata } from '@/components/component'
import { mutationObserve } from '@/core/observer'
import { getCookieValue, matchUrlPattern } from '@/core/utils'

const name = 'integratedDarkMode'
const darkModeClass = 'dark'
const integratedDarkModeClass = 'integrated-dark'
const darkMetaColor = '#111'

// 不支持深色模式的页面
const unsupportedUrls = [
  /^https:\/\/app\.bilibili\.com\//,
  /^https:\/\/b\.bilibili\.com\//,
  /^https:\/\/d\.bilibili\.com\//,
  /^https:\/\/e\.bilibili\.com\//,
  /^https:\/\/ir\.bilibili\.com\//,
  /^https:\/\/love\.bilibili\.com\//,
  /^https:\/\/mcn\.bilibili\.com\//,
  /^https:\/\/member\.bilibili\.com\//,
  /^https:\/\/www\.bilibili\.com\/audio\//,
  /^https:\/\/www\.bilibili\.com\/festival\//,
  /^https:\/\/www\.bilibili\.com\/protocal\//,
  /^https:\/\/www\.bilibili\.com\/v\/copyright\//,
]

const isLivePage = () => matchUrlPattern(/^https:\/\/(?:live|link)\.bilibili\.com\//)
const isMangaPage = () => matchUrlPattern(/^https:\/\/manga\.bilibili\.com\//)

// blackboard 路径下是帮助中心、活动页、活动列表等杂类页面,
// 其官方深色模式由 laputa 头部/页脚脚本提供, 脚本上显式声明 theme="light" 的页面会强制浅色,
// 未声明的页面跟随 theme_style cookie.
const isBlackboardPage = () => matchUrlPattern(/^https:\/\/www\.bilibili\.com\/blackboard\//)
const isBlackboardDarkModeSupported = () =>
  dq('script[src*="laputa-header"], script[src*="laputa-footer"]') !== null &&
  dq('script[src*="laputa"][theme="light"]') === null

const isOfficialDarkModeEnabled = () => {
  const hasDarkCookie = getCookieValue('theme_style') === 'dark'
  if (isLivePage()) {
    return document.documentElement.getAttribute('lab-style') === 'dark'
  }
  if (isBlackboardPage()) {
    return isBlackboardDarkModeSupported() && hasDarkCookie
  }
  if (isMangaPage()) {
    return document.documentElement.classList.contains('theme-dark')
  }
  return hasDarkCookie
}

const enableDarkMode = () => {
  document.body.classList.add(darkModeClass, integratedDarkModeClass)

  const themeColorMeta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (!themeColorMeta) {
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta name="theme-color" content="${darkMetaColor}" data-be-created="true">`,
    )
  } else {
    // 仅在首次启用时记录页面原始颜色, 避免重复启用时被覆盖
    if (!themeColorMeta.dataset.light) {
      themeColorMeta.dataset.light = themeColorMeta.content
    }
    themeColorMeta.content = darkMetaColor
  }

  const colorSchemeMeta = dq('meta[name="color-scheme"]') as HTMLMetaElement
  if (!colorSchemeMeta) {
    document.head.insertAdjacentHTML('beforeend', `<meta name="color-scheme" content="dark">`)
  } else {
    colorSchemeMeta.content = 'dark'
  }
}

const disableDarkMode = () => {
  document.body.classList.remove(darkModeClass, integratedDarkModeClass)

  const themeColorMeta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (themeColorMeta?.dataset.light) {
    themeColorMeta.content = themeColorMeta.dataset.light
  } else if (themeColorMeta?.dataset.beCreated === 'true') {
    // 只删除组件自建的 meta, 站点原有的 theme-color 保持不变
    themeColorMeta.remove()
  }

  const colorSchemeMeta = dq('meta[name="color-scheme"]') as HTMLMetaElement
  if (colorSchemeMeta) {
    colorSchemeMeta.content = 'light'
  }
}

const toggleDarkMode = () => {
  if (isOfficialDarkModeEnabled()) {
    enableDarkMode()
  } else {
    disableDarkMode()
  }
}

const cookieChangeHandler = (e: CookieChangedEvent) => {
  if (e.changed.some(cookie => cookie.name === 'theme_style')) {
    toggleDarkMode()
  }
}

let htmlThemeObserver: MutationObserver | undefined
// 直播页的 lab-style 属性与漫画页的 html class 都可能在组件加载之后才确定, 需要监听变化.
const watchHtmlTheme = () => {
  htmlThemeObserver?.disconnect()
  if (!isLivePage() && !isMangaPage()) {
    htmlThemeObserver = undefined
    return
  }
  ;[htmlThemeObserver] = mutationObserve(
    [document.documentElement],
    { attributes: true, attributeFilter: [isLivePage() ? 'lab-style' : 'class'] },
    toggleDarkMode,
  )
}

export const component = defineComponentMetadata({
  name,
  displayName: '深色模式',
  urlExclude: unsupportedUrls,
  entry: () => {
    cookieStore.addEventListener('change', cookieChangeHandler)
    watchHtmlTheme()
  },
  reload: () => {
    cookieStore.addEventListener('change', cookieChangeHandler)
    toggleDarkMode()
    watchHtmlTheme()
  },
  unload: () => {
    cookieStore.removeEventListener('change', cookieChangeHandler)
    htmlThemeObserver?.disconnect()
    htmlThemeObserver = undefined
    document.body.classList.remove(darkModeClass, integratedDarkModeClass)
  },
  tags: [componentsTags.style, componentsTags.general],
  instantStyles: [
    {
      name,
      style: () => import('./integrated-variables.scss'),
    },
    {
      name: 'integratedDarkModePatches',
      style: () => import('./patches.scss'),
    },
  ],
  plugin: {
    displayName: '深色模式 - 提前注入',
    description: {
      'zh-CN': '提前注入深色模式的 .dark class 以减少一些组件首屏仍然是白色的问题.',
    },
    async setup() {
      if (!isOfficialDarkModeEnabled()) {
        return
      }
      const { contentLoaded } = await import('@/core/life-cycle')
      const { isComponentEnabled } = await import('@/core/settings')
      contentLoaded(() => {
        if (isComponentEnabled(name)) {
          toggleDarkMode()
        }
      })
    },
  },
})
