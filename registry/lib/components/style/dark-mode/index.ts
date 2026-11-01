import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import {
  addComponentListener,
  ComponentSettings,
  getComponentSettings,
  isComponentEnabled,
  settings,
} from '@/core/settings'
import { Range } from '@/ui/range'
import { darkExcludes } from './dark-urls'
import { DarkModeMode } from './mode'
import { isInTimeRange, millisecondsUntilChange, rangeValidator } from './schedule-time'

const name = 'darkMode'
const darkMetaColor = '#111'
const themeColorSelector = 'meta[name="theme-color"]'
const colorSchemeSelector = 'meta[name="color-scheme"]'
const pbpThemeKey = 'pbp_theme_v4'
const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const defaultRange: Range<string> = { start: '18:00', end: '6:00' }

type Options = {
  mode: DarkModeMode
  range: Range<string>
}
type DarkModeSettings = ComponentSettings<Options>

const options = defineOptionsMetadata<Options>({
  mode: {
    defaultValue: DarkModeMode.Manual,
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
  // 覆盖安装时旧设置里可能还没有 options
  const { mode = DarkModeMode.Manual, range = defaultRange } = componentSettings.options
  let dark: boolean
  if (mode === DarkModeMode.FollowSystem) {
    dark = darkMediaQuery.matches
  } else if (mode === DarkModeMode.Schedule) {
    dark = isInTimeRange(range)
  } else {
    return
  }
  if (componentSettings.enabled !== dark) {
    componentSettings.enabled = dark
  }
}

const migrateDeprecatedComponents = (componentSettings: DarkModeSettings) => {
  const followSystem = settings.userComponents.darkModeFollowSystem?.settings
  if (followSystem?.enabled) {
    componentSettings.options.mode = DarkModeMode.FollowSystem
    followSystem.enabled = false
  }
  const schedule = settings.userComponents.darkModeSchedule?.settings
  if (schedule?.enabled) {
    const { range } = schedule.options as { range?: Range<string> }
    componentSettings.options.mode = DarkModeMode.Schedule
    componentSettings.options.range = range ?? componentSettings.options.range
    schedule.enabled = false
  }
}

let applied = false
let originalPbpTheme: string | null = null

const applyDark = (dark: boolean) => {
  if (dark === applied) {
    return
  }
  applied = dark
  document.body.classList.toggle('dark', dark)
  const themeColorMeta = dq(themeColorSelector) as HTMLMetaElement
  const colorSchemeMeta = dq(colorSchemeSelector) as HTMLMetaElement
  if (dark) {
    originalPbpTheme = localStorage.getItem(pbpThemeKey)
    localStorage.setItem(pbpThemeKey, 'b')
    if (themeColorMeta) {
      themeColorMeta.dataset.light = themeColorMeta.content
      themeColorMeta.content = darkMetaColor
    } else {
      document.head.insertAdjacentHTML(
        'beforeend',
        `<meta name="theme-color" content="${darkMetaColor}" data-be-created="true">`,
      )
    }
  } else {
    if (themeColorMeta?.dataset.light) {
      themeColorMeta.content = themeColorMeta.dataset.light
    } else if (themeColorMeta?.dataset.beCreated === 'true') {
      themeColorMeta.remove()
    }
    if (originalPbpTheme === null) {
      localStorage.removeItem(pbpThemeKey)
    } else {
      localStorage.setItem(pbpThemeKey, originalPbpTheme)
    }
  }
  if (colorSchemeMeta) {
    colorSchemeMeta.content = dark ? 'dark' : 'light'
  } else if (dark) {
    document.head.insertAdjacentHTML('beforeend', '<meta name="color-scheme" content="dark">')
  }
}

// 先于首屏样式确定开关状态, 避免加载中途反复应用 / 撤销
const initialSettings = settings.userComponents[name]?.settings as DarkModeSettings | undefined
if (initialSettings) {
  migrateDeprecatedComponents(initialSettings)
  syncEnabled(initialSettings)
}

const entry = () => applyDark(true)

export const component = defineComponentMetadata({
  name,
  displayName: '夜间模式',
  entry,
  reload: entry,
  unload: () => applyDark(false),
  tags: [componentsTags.style, componentsTags.general],
  options,
  instantStyles: [
    {
      name: 'dark-mode',
      style: () => import('./dark-mode.scss'),
      important: false,
    },
    {
      name: 'dark-mode-important',
      style: () => import('./dark-mode.important.scss'),
      important: true,
    },
    {
      name: 'dark-shadow-dom',
      style: () => import('./dark-shadow-dom.scss'),
      shadowDom: true,
    },
  ],
  plugin: {
    displayName: '夜间模式 - 提前注入',
    description: {
      'zh-CN': '提前注入夜间模式的 .dark class 以减少一些组件首屏仍然是白色的问题.',
    },
    setup() {
      const componentSettings = getComponentSettings<Options>(name)
      let scheduleTimer: number | undefined
      const schedule = () => {
        window.clearTimeout(scheduleTimer)
        if (componentSettings.options.mode !== DarkModeMode.Schedule) {
          return
        }
        const { range = defaultRange } = componentSettings.options
        const wait = millisecondsUntilChange(range)
        scheduleTimer = window.setTimeout(() => {
          syncEnabled(componentSettings)
          schedule()
        }, wait)
      }
      const update = () => {
        syncEnabled(componentSettings)
        schedule()
      }
      darkMediaQuery.addEventListener('change', update)
      addComponentListener(`${name}.mode`, update)
      addComponentListener(`${name}.range`, update)
      update()
      // 提前添加 dark 的 class, 防止颜色抖动
      contentLoaded(() => isComponentEnabled(name) && applyDark(true))
    },
  },
  urlExclude: darkExcludes,
})
