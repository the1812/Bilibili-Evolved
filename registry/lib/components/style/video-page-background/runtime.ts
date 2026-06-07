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

const setProperty = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value)
}

const setBackgroundImage = (image: BackgroundImage) => {
  const url = image?.url?.trim()
  setProperty('--be-video-page-background-image', url ? `url(${JSON.stringify(url)})` : 'none')
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
  setProperty('--be-video-page-background-color', currentOptions.backgroundColor)
  setProperty('--be-video-page-background-mask-color', currentOptions.maskColor)
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

const start = () =>
  contentLoaded(() => {
    addListeners()
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
  document.getElementById(layerId)?.remove()
  cssProperties.forEach(name => document.documentElement.style.removeProperty(name))
}
