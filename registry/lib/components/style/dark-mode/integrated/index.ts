import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { mutationObserve } from '@/core/observer'
import {
  addComponentListener,
  ComponentSettings,
  getComponentSettings,
  isComponentEnabled,
  settings,
} from '@/core/settings'
import { getCookieValue, matchUrlPattern } from '@/core/utils'
import { Range } from '@/ui/range'
import { isInTimeRange, millisecondsUntilChange, rangeValidator } from '../schedule-time'
import { applyOfficialTheme } from './official-theme'

enum DarkModeMode {
  FollowOfficial = '跟随 B 站',
  FollowSystem = '跟随系统',
  Schedule = '计划时段',
}

const name = 'integratedDarkMode'
const darkModeClass = 'dark'
const integratedDarkModeClass = 'integrated-dark'
const darkMetaColor = '#111'
const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const defaultRange: Range<string> = { start: '18:00', end: '6:00' }

type Options = {
  mode: DarkModeMode
  range: Range<string>
}
type DarkModeSettings = ComponentSettings<Options>

const options = defineOptionsMetadata<Options>({
  mode: {
    defaultValue: DarkModeMode.FollowOfficial,
    displayName: '模式',
    dropdownEnum: DarkModeMode,
  },
  range: {
    defaultValue: { ...defaultRange },
    displayName: '时间段',
    validator: rangeValidator,
  },
})

const syncEnabled = (componentSettings: DarkModeSettings) => {
  const { mode, range } = componentSettings.options
  let dark: boolean
  if (mode === DarkModeMode.FollowSystem) {
    dark = darkMediaQuery.matches
  } else if (mode === DarkModeMode.Schedule) {
    dark = isInTimeRange(range ?? defaultRange)
  } else {
    return
  }
  if (componentSettings.enabled !== dark) {
    componentSettings.enabled = dark
  }
}

const initialSettings = settings.userComponents[name]?.settings as DarkModeSettings | undefined
if (initialSettings) {
  syncEnabled(initialSettings)
}

// 不支持深色模式的页面
const urlExclude = [
  /^https:\/\/app\.bilibili\.com\//,
  /^https:\/\/d\.bilibili\.com\//,
  /^https:\/\/love\.bilibili\.com\//,
  /^https:\/\/member\.bilibili\.com\//,
  /^https:\/\/passport\.bilibili\.com\//,
  /^https:\/\/www\.bilibili\.com\/audio\//,
  /^https:\/\/www\.bilibili\.com\/blackroom\//,
  /^https:\/\/www\.bilibili\.com\/festival\//,
  /^https:\/\/www\.bilibili\.com\/protocal\//,
  /^https:\/\/www\.bilibili\.com\/v\/copyright\//,
]

const isLivePage = () => matchUrlPattern(/^https:\/\/(?:live|link)\.bilibili\.com\//)
const isMangaPage = () => matchUrlPattern(/^https:\/\/manga\.bilibili\.com\//)
// blackboard 路径下是帮助中心、活动页、活动列表等杂类页面, 其官方主题由 laputa 头部/页脚脚本解析后
// 写入 #__css-map__ 链接: 强制浅色的活动页、关于页始终指向 light.css, 以链接的实际指向判断官方主题
const themeStyleLinkSelector = '#__css-map__'
const isBlackboardPage = () => matchUrlPattern(/^https:\/\/www\.bilibili\.com\/blackboard\//)

const isOfficialDarkModeEnabled = () => {
  const hasDarkCookie = getCookieValue('theme_style') === 'dark'
  if (isLivePage()) {
    return document.documentElement.getAttribute('lab-style') === 'dark'
  }
  if (isBlackboardPage()) {
    return (dq(themeStyleLinkSelector) as HTMLLinkElement | null)?.href.includes('dark') ?? false
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
  const { mode } = getComponentSettings<Options>(name).options
  if (
    mode === DarkModeMode.FollowOfficial ? isOfficialDarkModeEnabled() : isComponentEnabled(name)
  ) {
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
  urlExclude,
  entry: () => {
    cookieStore.addEventListener('change', cookieChangeHandler)
    toggleDarkMode()
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
    disableDarkMode()
  },
  tags: [componentsTags.style, componentsTags.general],
  options,
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
    setup: () =>
      contentLoaded(() => {
        const componentSettings = getComponentSettings<Options>(name)
        let timer: number | undefined
        const update = () => {
          syncEnabled(componentSettings)
          const { mode, range } = componentSettings.options
          window.clearTimeout(timer)
          if (mode === DarkModeMode.Schedule) {
            timer = window.setTimeout(update, millisecondsUntilChange(range ?? defaultRange))
          }
          if (mode !== DarkModeMode.FollowOfficial) {
            applyOfficialTheme(componentSettings.enabled ? 'dark' : 'light')
          }
          if (componentSettings.enabled) {
            toggleDarkMode()
          }
        }
        darkMediaQuery.addEventListener('change', update)
        addComponentListener(`${name}.mode`, update)
        addComponentListener(`${name}.range`, update)
        document.addEventListener('global.themeChange', (event: CustomEvent<string>) => {
          componentSettings.enabled = event.detail === 'dark'
        })
        update()
      }),
  },
})
