import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { loadInstantStyle } from '@/core/style'
import { Range } from '@/ui/range'
import { isInTimeRange, millisecondsUntilChange, rangeValidator } from '../schedule-time'
import {
  applyOfficialTheme,
  darkModeUrlExclude,
  integratedDarkModeClass,
  isDarkModePageBlocked,
  isExcludedPage,
  observeLiveTheme,
  observeOfficialTheme,
  readOfficialDarkMode,
  usesLiveThemeAttribute,
} from './official-theme'

enum DarkModeMode {
  FollowOfficial = '跟随 B 站',
  FollowSystem = '跟随系统',
  Schedule = '计划时段',
}

const name = 'integratedDarkMode'
const darkModeClass = 'dark'
const darkMetaColor = '#111'

type Options = {
  mode: DarkModeMode
  range: Range<string>
}
const options = defineOptionsMetadata<Options>({
  mode: {
    defaultValue: DarkModeMode.FollowOfficial,
    displayName: '模式',
    dropdownEnum: DarkModeMode,
  },
  range: {
    defaultValue: { start: '18:00', end: '6:00' },
    displayName: '时间段',
    validator: rangeValidator,
  },
})

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

const livePage = usesLiveThemeAttribute()
const syncPageStyle = (enabled: boolean) => {
  const classes = document.body?.classList
  const dark = (livePage || enabled) && !isDarkModePageBlocked()
  if (!classes || classes.contains(integratedDarkModeClass) === dark) {
    return
  }
  classes.toggle(darkModeClass, dark)
  classes.toggle(integratedDarkModeClass, dark)
  toggleMeta('theme-color', dark ? darkMetaColor : undefined)
  toggleMeta('color-scheme', dark ? 'dark' : undefined)
}

const instantStyles = [
  { name, style: () => import('./integrated-variables.scss') },
  { name: 'integratedDarkModePatches', style: () => import('./patches.scss') },
]

export const component = defineComponentMetadata({
  name,
  displayName: '深色模式',
  urlExclude: darkModeUrlExclude,
  entry: () => syncPageStyle(true),
  reload: () => syncPageStyle(true),
  unload: () => syncPageStyle(false),
  tags: [componentsTags.style, componentsTags.general],
  options,
  instantStyles: livePage ? [] : instantStyles,
  plugin: {
    displayName: '深色模式 - 提前注入',
    description: {
      'zh-CN': '提前注入深色模式的 .dark class 以减少一些组件首屏仍然是白色的问题.',
    },
    setup() {
      if (isExcludedPage()) {
        return
      }
      if (livePage) {
        contentLoaded(() => {
          loadInstantStyle({ ...component, instantStyles })
          observeLiveTheme(() => syncPageStyle(true))
        })
        return
      }
      const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const componentSettings = getComponentSettings<Options>(name)
      const updatePageStyle = () => syncPageStyle(componentSettings.enabled)
      const setEnabled = (dark: boolean) => {
        if (componentSettings.enabled !== dark) {
          componentSettings.enabled = dark
        }
        updatePageStyle()
      }
      const syncOfficialTheme = () => {
        if (
          componentSettings.options.mode === DarkModeMode.FollowOfficial &&
          document.readyState !== 'loading'
        ) {
          const dark = readOfficialDarkMode()
          if (dark !== undefined) {
            setEnabled(dark)
            return
          }
        }
        updatePageStyle()
      }
      let timer: number | undefined
      const update = () => {
        const { mode, range } = componentSettings.options
        window.clearTimeout(timer)
        if (mode === DarkModeMode.Schedule) {
          timer = window.setTimeout(update, millisecondsUntilChange(range))
        }
        if (mode === DarkModeMode.FollowOfficial) {
          contentLoaded(syncOfficialTheme)
          return
        }
        const dark =
          mode === DarkModeMode.FollowSystem ? darkMediaQuery.matches : isInTimeRange(range)
        setEnabled(dark)
        contentLoaded(async () => {
          updatePageStyle()
          if (componentSettings.options.mode === mode && componentSettings.enabled === dark) {
            await applyOfficialTheme(dark ? 'dark' : 'light')
          }
        })
      }
      observeOfficialTheme(syncOfficialTheme, setEnabled)
      darkMediaQuery.addEventListener('change', () => {
        if (componentSettings.options.mode === DarkModeMode.FollowSystem) {
          update()
        }
      })
      addComponentListener(`${name}.mode`, update)
      addComponentListener(`${name}.range`, () => {
        if (componentSettings.options.mode === DarkModeMode.Schedule) {
          update()
        }
      })
      update()
    },
  },
})
