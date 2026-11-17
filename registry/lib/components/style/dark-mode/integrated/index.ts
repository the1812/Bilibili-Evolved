import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { mutationObserve } from '@/core/observer'
import {
  addComponentListener,
  ComponentSettings,
  getComponentSettings,
  settings,
} from '@/core/settings'
import { getCookieValue, matchUrlPattern } from '@/core/utils'
import { Range } from '@/ui/range'
import { isInTimeRange, millisecondsUntilChange, rangeValidator } from '../schedule-time'
import { applyOfficialTheme, isOfficialThemeForcedLight } from './official-theme'

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
  if (isOfficialThemeForcedLight()) {
    return false
  }
  if (isLivePage()) {
    return document.documentElement.getAttribute('lab-style') === 'dark'
  }
  if (isBlackboardPage()) {
    return (dq(themeStyleLinkSelector) as HTMLLinkElement | null)?.href.includes('dark') ?? false
  }
  if (isMangaPage()) {
    return document.documentElement.classList.contains('theme-dark')
  }
  return getCookieValue('theme_style') === 'dark'
}

const syncEnabled = (componentSettings: DarkModeSettings) => {
  const dark = isOfficialDarkModeEnabled()
  if (componentSettings.enabled !== dark) {
    componentSettings.enabled = dark
  }
}

const initialSettings = settings.userComponents[name]?.settings as DarkModeSettings | undefined
if (initialSettings) {
  syncEnabled(initialSettings)
}

const toggleMeta = (metaName: string, darkContent?: string) => {
  const meta = dq(`meta[name="${metaName}"]`) as HTMLMetaElement | null
  if (darkContent === undefined) {
    if (meta?.dataset.beCreated === 'true') {
      meta.remove()
    } else if (meta?.dataset.light !== undefined) {
      meta.content = meta.dataset.light
    }
    return
  }
  if (!meta) {
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta name="${metaName}" content="${darkContent}" data-be-created="true">`,
    )
    return
  }
  if (meta.dataset.beCreated !== 'true' && meta.dataset.light === undefined) {
    meta.dataset.light = meta.content
  }
  meta.content = darkContent
}

const enableDarkMode = () => {
  document.body.classList.add(darkModeClass, integratedDarkModeClass)
  toggleMeta('theme-color', darkMetaColor)
  toggleMeta('color-scheme', 'dark')
}

const disableDarkMode = () => {
  document.body.classList.remove(darkModeClass, integratedDarkModeClass)
  toggleMeta('theme-color')
  toggleMeta('color-scheme')
}

export const component = defineComponentMetadata({
  name,
  displayName: '深色模式',
  urlExclude,
  entry: enableDarkMode,
  reload: enableDarkMode,
  unload: disableDarkMode,
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
    setup() {
      const componentSettings = getComponentSettings<Options>(name)
      const syncOfficialTheme = () => syncEnabled(componentSettings)
      let timer: number | undefined
      const update = () => {
        const { options: currentOptions } = componentSettings
        syncOfficialTheme()
        window.clearTimeout(timer)
        if (currentOptions.mode === DarkModeMode.Schedule) {
          timer = window.setTimeout(
            update,
            millisecondsUntilChange(currentOptions.range ?? defaultRange),
          )
        }
        contentLoaded(async () => {
          const { mode, range } = componentSettings.options
          if (mode !== DarkModeMode.FollowOfficial) {
            const dark =
              mode === DarkModeMode.FollowSystem
                ? darkMediaQuery.matches
                : isInTimeRange(range ?? defaultRange)
            await applyOfficialTheme(dark ? 'dark' : 'light')
          }
          syncOfficialTheme()
        })
      }
      cookieStore.addEventListener('change', (event: CookieChangedEvent) => {
        if (event.changed.some(cookie => cookie.name === 'theme_style')) {
          syncOfficialTheme()
        }
      })
      if (isLivePage() || isMangaPage()) {
        mutationObserve(
          [document.documentElement],
          { attributes: true, attributeFilter: [isLivePage() ? 'lab-style' : 'class'] },
          syncOfficialTheme,
        )
      }
      darkMediaQuery.addEventListener('change', () => {
        if (componentSettings.options.mode === DarkModeMode.FollowSystem) {
          update()
        }
      })
      addComponentListener(`${name}.mode`, update)
      addComponentListener(`${name}.range`, update)
      document.addEventListener('global.themeChange', syncOfficialTheme)
      update()
    },
  },
})
