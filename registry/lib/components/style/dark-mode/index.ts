import { defineComponentMetadata } from '@/components/define'
import { darkExcludes } from './dark-urls'

const changeDelay = 200
const darkMetaColor = '#111'
const add = async () => {
  document.body.classList.add('dark')
  localStorage.setItem('pbp_theme_v4', 'b')
  const meta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (!meta) {
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta name="theme-color" content="${darkMetaColor}">`,
    )
  } else {
    meta.dataset.light = meta.content
    meta.content = darkMetaColor
  }
}
const remove = async () => {
  document.body.classList.remove('dark')
  const meta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (!meta) {
    return
  }
  if (meta.dataset.light) {
    meta.content = meta.dataset.light
  } else {
    meta.remove()
  }
}

export const component = defineComponentMetadata({
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
        // 提前添加dark的class, 防止颜色抖动
        if (isComponentEnabled('darkMode')) {
          document.body.classList.add('dark')
        }
      })
    },
  },
  urlExclude: darkExcludes,
})
