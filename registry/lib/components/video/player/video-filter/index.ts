import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { addControlBarButton, removeControlBarButton } from '@/components/video/video-control-bar'
import { sizeChange, videoChange } from '@/core/observer'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { Toast } from '@/core/toast'
import { playerUrls } from '@/core/utils/urls'
import { addBpxMenuItem } from './context-menu'

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
let updateMenu: ((selection: FilterMode | false) => void) | undefined

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
  updateMenu?.(enabled && mode)
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

  const panel = document.createElement('div')
  panel.popover = 'manual'
  panel.id = 'be-video-filter-presets'
  panel.className = 'be-video-filter-menu-presets'
  panel.setAttribute('role', 'dialog')
  const header = document.createElement('div')
  header.className = 'be-video-filter-header'
  const heading = document.createElement('strong')
  heading.id = 'be-video-filter-title'
  heading.textContent = displayName
  panel.setAttribute('aria-labelledby', heading.id)
  const dismiss = document.createElement('button')
  dismiss.type = 'button'
  dismiss.className = 'be-video-filter-dismiss'
  dismiss.setAttribute('aria-label', '关闭面板')
  dismiss.textContent = '×'
  header.append(heading, dismiss)
  const presets = document.createElement('div')
  presets.className = 'be-video-filter-choices'
  panel.append(header, presets)
  trigger.setAttribute('aria-controls', panel.id)
  let playerArea: HTMLElement | undefined
  let observer: ResizeObserver | undefined
  const positionPanel = () => {
    if (!playerArea) {
      return
    }
    const { left, top, width, height } = playerArea.getBoundingClientRect()
    panel.style.left = `${left + width / 2}px`
    panel.style.top = `${top + height / 2}px`
    panel.style.maxWidth = `${Math.max(0, width - 16)}px`
  }
  const setExpanded = (expanded: boolean) => {
    if (panel.matches(':popover-open') === expanded) {
      return
    }
    if (expanded) {
      playerArea = playerAgent.query.video.wrap.sync()
      if (!playerArea || !videoKey) {
        return
      }
      positionPanel()
      panel.showPopover()
      ;[observer] = sizeChange(playerArea, positionPanel)
      presets.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({
        preventScroll: true,
      })
    } else {
      observer?.disconnect()
      playerArea = undefined
      panel.hidePopover()
    }
    trigger.setAttribute('aria-expanded', String(expanded))
  }
  trigger.addEventListener('click', () => {
    setExpanded(!panel.matches(':popover-open'))
  })
  trigger.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      trigger.click()
    }
  })
  dismiss.addEventListener('click', () => setExpanded(false))
  panel.addEventListener('click', event => event.stopPropagation())
  document.addEventListener(
    'click',
    event => {
      const target = event.target as Node
      if (!panel.contains(target) && !trigger.contains(target)) {
        setExpanded(false)
      }
    },
    { capture: true, signal },
  )
  document.addEventListener(
    'keydown',
    event => {
      if (event.key === 'Escape' && panel.matches(':popover-open')) {
        setExpanded(false)
        trigger.focus()
      }
    },
    { signal },
  )
  window.addEventListener('resize', positionPanel, { signal })
  window.addEventListener('scroll', positionPanel, { capture: true, signal })
  signal.addEventListener(
    'abort',
    () => {
      observer?.disconnect()
      panel.remove()
    },
    { once: true },
  )

  const choices = [false as const, ...Object.values(FilterMode)].map(selection => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = selection || '关闭滤镜'
    button.addEventListener('click', () => {
      setVideoFilter({ mode: selection || getVideoFilter().mode, enabled: Boolean(selection) })
    })
    presets.appendChild(button)
    return { button, selection }
  })

  document.body.appendChild(panel)
  updateMenu = selection => {
    trigger.setAttribute('aria-disabled', String(!videoKey))
    choices.forEach(choice => {
      choice.button.disabled = !videoKey
      choice.button.setAttribute('aria-pressed', String(choice.selection === selection))
    })
  }
  updateMenu(false)
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
    updateMenu = undefined
    optionNames.forEach(name => removeComponentListener(`${componentName}.${name}`, applyFilter))
    clearFilter()
    return removeControlBarButton(toggleButton.name)
  },
})
