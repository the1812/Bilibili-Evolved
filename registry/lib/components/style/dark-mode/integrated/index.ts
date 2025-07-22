import { defineComponentMetadata } from '@/components/component'
import { getCookieValue } from '@/core/utils'

const name = 'integratedDarkMode'
const darkModeClass = 'dark'
const integratedDarkModeClass = 'integrated-dark'
const darkMetaColor = '#111'

const isOfficialDarkModeEnabled = () => {
  return getCookieValue('theme_style') === 'dark'
}

const enableDarkMode = () => {
  document.body.classList.add(darkModeClass, integratedDarkModeClass)

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

const disableDarkMode = () => {
  document.body.classList.remove(darkModeClass, integratedDarkModeClass)

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

const toggleDarkModeByCookie = () => {
  if (isOfficialDarkModeEnabled()) {
    enableDarkMode()
  } else {
    disableDarkMode()
  }
}

const cookieChangeHandler = (e: CookieChangedEvent) => {
  if (e.changed.some(cookie => cookie.name === 'theme_style')) {
    toggleDarkModeByCookie()
  }
}

export const component = defineComponentMetadata({
  name,
  displayName: '深色模式',
  entry: () => {
    cookieStore.addEventListener('change', cookieChangeHandler)
  },
  reload: () => {
    cookieStore.addEventListener('change', cookieChangeHandler)
    toggleDarkModeByCookie()
  },
  unload: () => {
    cookieStore.removeEventListener('change', cookieChangeHandler)
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
          cookieStore.addEventListener('change', cookieChangeHandler)
          toggleDarkModeByCookie()
        }
      })
    },
  },
})
