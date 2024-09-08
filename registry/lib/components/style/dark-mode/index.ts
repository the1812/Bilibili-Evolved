import { defineComponentMetadata } from '@/components/define'
import { darkExcludes } from './dark-urls'

const name = 'darkMode'
const changeDelay = 200
const darkMetaColor = '#111'
const add = async () => {
  document.body.classList.add('dark')
  localStorage.setItem('pbp_theme_v4', 'b')

  const themeColorMeta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (!themeColorMeta) {
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta name="theme-color" content="${darkMetaColor}">`,
    )
  } else {
    themeColorMeta.dataset.light = themeColorMeta.content
    themeColorMeta.content = darkMetaColor
  }

  const colorSchemeMeta = dq('meta[name="color-scheme"]') as HTMLMetaElement
  if (!colorSchemeMeta) {
    document.head.insertAdjacentHTML('beforeend', `<meta name="color-scheme" content="dark">`)
  } else {
    colorSchemeMeta.content = 'dark'
  }
}
const remove = async () => {
  document.body.classList.remove('dark')

  const themeColorMeta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (themeColorMeta?.dataset.light) {
    themeColorMeta.content = themeColorMeta.dataset.light
  } else {
    themeColorMeta?.remove()
  }

  const colorSchemeMeta = dq('meta[name="color-scheme"]') as HTMLMetaElement
  if (colorSchemeMeta) {
    colorSchemeMeta.content = 'light'
  }
}
const entry = async () => {
  setTimeout(add, changeDelay)
}

export const component = defineComponentMetadata({
  name,
  displayName: '夜间模式',
  entry,
  reload: entry,
  unload: () => {
    setTimeout(remove, changeDelay)
  },
  description: '启用夜间模式能更好地适应光线暗的环境, 并会大量应用主题颜色.',
  tags: [componentsTags.style, componentsTags.general],
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
    async setup() {
      const { contentLoaded } = await import('@/core/life-cycle')
      const { isComponentEnabled } = await import('@/core/settings')
      contentLoaded(() => {
        // 提前添加 dark 的 class, 防止颜色抖动
        if (isComponentEnabled(name)) {
          document.body.classList.add('dark')
        }
      })
    },
  },
  urlExclude: darkExcludes,
})
