import { ComponentMetadata } from '@/components/types'
import { darkExcludes } from './dark-urls'

const changeDelay = 200
const add = async () => {
  // const { addStyle, addImportantStyle } = await import('@/core/style')
  // const { default: darkStyle } = await import('./dark-mode.scss')
  // const { default: importantStyle } = await import('./dark-mode.important.scss')
  document.body.classList.add('dark')
  localStorage.setItem('pbp_theme_v4', 'b')
  // addStyle(darkStyle, 'darkMode')
  // addImportantStyle(importantStyle, 'darkModeImportant')
}
const remove = async () => {
  // const { removeStyle } = await import('@/core/style')
  document.body.classList.remove('dark')
  // removeStyle('darkMode', 'darkModeImportant')
}

export const component: ComponentMetadata = {
  name: 'darkMode',
  displayName: '夜间模式',
  entry: () => {
    setTimeout(add, changeDelay)
  },
  reload: () => {
    setTimeout(add, changeDelay)
  },
  unload: () => {
    setTimeout(remove, changeDelay)
  },
  description: '启用夜间模式能更好地适应光线暗的环境, 并会大量应用主题颜色.',
  tags: [
    componentsTags.style,
    componentsTags.general,
  ],
  enabledByDefault: false,
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
  ],
  plugin: {
    displayName: '夜间模式 - 提前注入 class',
    async setup() {
      const { contentLoaded } = await import('@/core/life-cycle')
      const { isComponentEnabled } = await import('@/core/settings')
      contentLoaded(() => {
        // 提前添加dark的class, 防止颜色抖动
        if (isComponentEnabled('darkMode')) {
          document.body.classList.add('dark')
        }
      })
    },
  },
  urlExclude: darkExcludes,
}
