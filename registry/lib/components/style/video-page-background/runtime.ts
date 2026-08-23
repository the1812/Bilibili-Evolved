import { ComponentEntry } from '@/components/types'
import { contentLoaded } from '@/core/life-cycle'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import {
  BackgroundImage,
  BackgroundPosition,
  BackgroundSize,
  options as optionsMetadata,
  Options,
} from './options'

const componentName = 'videoPageBackground'
const layerId = 'be-video-page-background'

const cssProperties = [
  '--be-video-page-background-image',
  '--be-video-page-background-image-opacity',
  '--be-video-page-background-mask-opacity',
  '--be-video-page-background-blur',
  '--be-video-page-background-size',
  '--be-video-page-background-position',
  '--be-video-page-background-color',
  '--be-video-page-background-mask-color',
]

const backgroundSizeMap: Record<BackgroundSize, string> = {
  [BackgroundSize.Cover]: 'cover',
  [BackgroundSize.Contain]: 'contain',
  [BackgroundSize.Original]: 'auto',
}

const backgroundPositionMap: Record<BackgroundPosition, string> = {
  [BackgroundPosition.CenterBottom]: 'center bottom',
  [BackgroundPosition.Center]: 'center center',
  [BackgroundPosition.LeftBottom]: 'left bottom',
  [BackgroundPosition.RightBottom]: 'right bottom',
}

let currentOptions: Options
let listenersAdded = false
let themeObserver: MutationObserver | null = null
let lastDarkState: boolean | null = null

const isDarkMode = () => {
  // B 站官方深色主题：新版页用 `<html class="bili_dark">`，老版视频页用 `<html class="night-mode">`。
  const htmlClasses = document.documentElement.classList
  if (htmlClasses.contains('bili_dark') || htmlClasses.contains('night-mode')) {
    return true
  }
  // `<body class="dark">` 是本扩展「夜间模式 / 深色模式」组件的共同标志。
  if (document.body.classList.contains('dark')) {
    // 进一步区分：
    // - 「夜间模式」(darkMode)：unload 时 body.dark 延迟 200ms 才移除，但 `<style id="dark-mode-important">` 同步增删，
    //   用它判定可避免那 200ms 错误地判定为深色；
    // - 「深色模式」(integratedDarkMode)：实际生效时给 body 加 `integrated-dark` class
    //   （而 `<style id="integrated-dark-mode">` 只要组件 enabled 就存在，cookie=light 时也在，不能拿来判定）。
    return Boolean(
      document.getElementById('dark-mode-important') ||
        document.body.classList.contains('integrated-dark'),
    )
  }
  return false
}

const setProperty = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value)
}

const setBackgroundImage = (image: BackgroundImage) => {
  const url = image?.url?.trim()
  setProperty('--be-video-page-background-image', url ? `url(${JSON.stringify(url)})` : 'none')
}

const applyThemeColors = () => {
  if (!currentOptions) {
    return
  }
  const dark = currentOptions.followDarkMode && isDarkMode()
  if (dark === lastDarkState) {
    return
  }
  lastDarkState = dark
  setProperty(
    '--be-video-page-background-color',
    dark ? currentOptions.darkBackgroundColor : currentOptions.backgroundColor,
  )
  setProperty(
    '--be-video-page-background-mask-color',
    dark ? currentOptions.darkMaskColor : currentOptions.maskColor,
  )
}

const applyOptions = () => {
  if (!currentOptions) {
    return
  }
  setBackgroundImage(currentOptions.backgroundImage)
  setProperty('--be-video-page-background-image-opacity', String(currentOptions.imageOpacity / 100))
  setProperty('--be-video-page-background-mask-opacity', String(currentOptions.maskOpacity / 100))
  setProperty('--be-video-page-background-blur', `${currentOptions.blur}px`)
  setProperty('--be-video-page-background-size', backgroundSizeMap[currentOptions.backgroundSize])
  setProperty(
    '--be-video-page-background-position',
    backgroundPositionMap[currentOptions.backgroundPosition],
  )
  // 选项变更时主题状态可能没变但配色值变了，重置缓存以强制刷新一次。
  lastDarkState = null
  applyThemeColors()
}

const addListeners = () => {
  if (listenersAdded) {
    return
  }
  Object.keys(optionsMetadata).forEach(optionName => {
    addComponentListener(`${componentName}.${optionName}`, applyOptions)
  })
  listenersAdded = true
}

const removeListeners = () => {
  if (!listenersAdded) {
    return
  }
  Object.keys(optionsMetadata).forEach(optionName => {
    removeComponentListener(`${componentName}.${optionName}`, applyOptions)
  })
  listenersAdded = false
}

const ensureLayer = () => {
  if (document.getElementById(layerId)) {
    return
  }
  const layer = document.createElement('div')
  layer.id = layerId
  layer.setAttribute('aria-hidden', 'true')
  document.body.prepend(layer)
}

const observeTheme = () => {
  if (themeObserver) {
    return
  }
  themeObserver = new MutationObserver(applyThemeColors)
  // 监听：
  // - `<html>` 的 class（B 站官方主题 bili_dark / night-mode）
  // - `<body>` 的 class（夜间模式的 `.dark`、深色模式的 `.dark + .integrated-dark`）
  // - `<head>` / `<body>` 的 childList（捕捉 instantStyle `<style id="dark-mode-important">` 的增删瞬间）
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  themeObserver.observe(document.head, { childList: true })
  themeObserver.observe(document.body, { childList: true })
}

const unobserveTheme = () => {
  themeObserver?.disconnect()
  themeObserver = null
}

const start = () =>
  contentLoaded(() => {
    addListeners()
    observeTheme()
    ensureLayer()
    applyOptions()
  })

export const entry: ComponentEntry<Options> = context => {
  currentOptions = context.settings.options
  return start()
}

export const reload = start

export const unload = () => {
  removeListeners()
  unobserveTheme()
  lastDarkState = null
  document.getElementById(layerId)?.remove()
  cssProperties.forEach(name => document.documentElement.style.removeProperty(name))
}
