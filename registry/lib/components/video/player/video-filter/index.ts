import { defineComponent, reactive } from 'vue'
import { defineComponentMetadata } from '@/components/define'
import { addControlBarButton, removeControlBarButton } from '@/components/video/video-control-bar'
import { videoChange } from '@/core/observer'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { Toast } from '@/core/toast'
import { mountVueComponent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'
import { addBpxMenuItem } from './context-menu'
import VideoFilterPanel from './VideoFilterPanel.vue'

enum FilterMode {
  SmartDarken = '智能暗化',
  Invert = '纯反色',
  Grayscale = '灰度',
  Custom = '自定义',
}

type VideoFilterState = { mode: FilterMode; enabled: boolean }

type Options = {
  mode: FilterMode
  brightness: number
  contrast: number
  enabledVideos: Record<string, true | VideoFilterState>
}

const componentName = 'videoFilter'
const displayName = '视频滤镜'
const modeNames: Record<FilterMode, string> = {
  [FilterMode.SmartDarken]: 'smart-darken',
  [FilterMode.Invert]: 'invert',
  [FilterMode.Grayscale]: 'grayscale',
  [FilterMode.Custom]: 'custom',
}
const brightnessProperty = '--be-video-filter-brightness'
const contrastProperty = '--be-video-filter-contrast'
const optionNames = ['mode', 'brightness', 'contrast', 'enabledVideos']
const getOptions = () => getComponentSettings<Options>(componentName).options
let videoKey: string | undefined
let videoListener: AbortController | undefined
const panelState = reactive({ selection: false as FilterMode | false, available: false })

const getVideoFilter = (): VideoFilterState => {
  const { mode, enabledVideos } = getOptions()
  const saved = videoKey ? enabledVideos[videoKey] : undefined
  return saved && saved !== true ? saved : { mode, enabled: saved === true }
}

const setVideoFilter = (state: VideoFilterState) => {
  if (videoKey) {
    getOptions().enabledVideos[videoKey] = state
  }
}

const toggleButton = {
  name: componentName,
  displayName: '开启视频滤镜',
  icon: 'mdi-theme-light-dark',
  order: 0,
  action: () => {
    if (!videoKey) {
      return
    }
    const { mode, enabled } = getVideoFilter()
    setVideoFilter({ mode, enabled: !enabled })
    Toast.info(enabled ? '已关闭当前视频的滤镜' : '已开启当前视频的滤镜', displayName, 2000)
  },
}

const clearFilter = () => {
  const root = document.documentElement
  delete root.dataset.beVideoFilter
  root.style.removeProperty(brightnessProperty)
  root.style.removeProperty(contrastProperty)
}

const applyFilter = () => {
  const { brightness, contrast } = getOptions()
  const { mode, enabled } = getVideoFilter()
  toggleButton.displayName = enabled ? `关闭视频滤镜（${mode}）` : '开启视频滤镜'
  panelState.selection = enabled && mode
  panelState.available = Boolean(videoKey)
  if (!enabled) {
    clearFilter()
    return
  }
  const root = document.documentElement
  root.dataset.beVideoFilter = modeNames[mode] ?? modeNames[FilterMode.SmartDarken]
  if (mode === FilterMode.Custom) {
    root.style.setProperty(brightnessProperty, `${brightness}%`)
    root.style.setProperty(contrastProperty, `${contrast}%`)
  }
}

const registerMenu = (signal: AbortSignal) => {
  const trigger = document.createElement('li')
  trigger.textContent = displayName
  trigger.tabIndex = 0
  trigger.setAttribute('role', 'menuitem')
  trigger.setAttribute('aria-haspopup', 'dialog')
  trigger.setAttribute('aria-expanded', 'false')

  const panel = mountVueComponent(
    defineComponent({
      render: create =>
        create(VideoFilterPanel, {
          props: { trigger, modes: Object.values(FilterMode), state: panelState },
          on: {
            select: (selection: FilterMode | false) => {
              setVideoFilter({
                mode: selection || getVideoFilter().mode,
                enabled: Boolean(selection),
              })
            },
          },
        }),
    }),
  )
  trigger.setAttribute('aria-controls', panel.$el.id)
  trigger.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      trigger.click()
    }
  })
  document.body.appendChild(panel.$el)
  signal.addEventListener(
    'abort',
    () => {
      panel.$destroy()
      panel.$el.remove()
    },
    { once: true },
  )

  addBpxMenuItem(trigger, signal)
}

const enable = () => {
  if (videoListener) {
    return
  }
  videoListener = new AbortController()
  const { signal } = videoListener
  optionNames.forEach(name => addComponentListener(`${componentName}.${name}`, applyFilter))
  registerMenu(signal)
  videoChange(
    ({ cid }) => {
      if (signal.aborted) {
        return
      }
      videoKey = cid && !Array.isArray(cid) ? `cid:${cid}` : undefined
      applyFilter()
    },
    { signal },
  )
  addControlBarButton(toggleButton)
}

export const component = defineComponentMetadata<Options>({
  name: componentName,
  displayName,
  tags: [componentsTags.video],
  author: {
    name: 'LeonYew-Ley',
    link: 'https://github.com/LeonYew-Ley',
  },
  urlInclude: playerUrls,
  instantStyles: [{ name: componentName, style: () => import('./video-filter.scss') }],
  options: {
    mode: {
      displayName: '默认滤镜模式',
      defaultValue: FilterMode.SmartDarken,
      dropdownEnum: FilterMode,
    },
    brightness: {
      displayName: '自定义亮度 (%)',
      defaultValue: 65,
      slider: { min: 10, max: 200, step: 5 },
    },
    contrast: {
      displayName: '自定义对比度 (%)',
      defaultValue: 100,
      slider: { min: 10, max: 200, step: 5 },
    },
    enabledVideos: {
      defaultValue: {},
      hidden: true,
    },
  },
  entry: enable,
  reload: enable,
  unload: () => {
    videoListener?.abort()
    videoListener = undefined
    videoKey = undefined
    panelState.available = false
    optionNames.forEach(name => removeComponentListener(`${componentName}.${name}`, applyFilter))
    clearFilter()
    return removeControlBarButton(toggleButton.name)
  },
})
