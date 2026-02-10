import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { videoAndBangumiUrls } from '@/core/utils/urls'

const MIN_WIDTH = 160
const MIN_HEIGHT = 90

const options = defineOptionsMetadata({
  width: {
    displayName: '宽度 (px)',
    defaultValue: 320,
  },
  height: {
    displayName: '高度 (px)',
    defaultValue: 180,
  },
  keepAspectRatio: {
    displayName: '保持 16:9 宽高比',
    defaultValue: true,
  },
})

type Options = OptionsOfMetadata<typeof options>

const clamp = (value: number, min: number) => Math.max(value, min)

const applySize = (width: number, height: number) => {
  const scale = width / 640
  const root = document.documentElement.style
  root.setProperty('--mini-player-width', `${width}px`)
  root.setProperty('--mini-player-height', `${height}px`)
  root.setProperty('--mini-player-scale', `${scale}`)
  root.setProperty('--mini-player-icon-size', `${Math.round(100 * scale)}px`)
}

const setupResizeHandles = (miniPlayer: HTMLElement, componentSettings: { options: Options }) => {
  if (miniPlayer.querySelector('.be-mini-player-resize-handle')) {
    return
  }

  ;(['nw', 'ne', 'sw', 'se'] as const).forEach(dir => {
    const handle = document.createElement('div')
    handle.className = `be-mini-player-resize-handle be-mini-player-resize-${dir}`
    handle.dataset.direction = dir
    miniPlayer.appendChild(handle)

    let startX = 0
    let startY = 0
    let startWidth = 0
    let startHeight = 0

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight

      if (dir.includes('e')) {
        newWidth = startWidth + deltaX
      } else if (dir.includes('w')) {
        newWidth = startWidth - deltaX
      }

      if (dir.includes('s')) {
        newHeight = startHeight + deltaY
      } else if (dir.includes('n')) {
        newHeight = startHeight - deltaY
      }

      newWidth = clamp(newWidth, MIN_WIDTH)
      newHeight = clamp(newHeight, MIN_HEIGHT)

      if (componentSettings.options.keepAspectRatio) {
        newHeight = Math.round((newWidth * 9) / 16)
        newHeight = clamp(newHeight, MIN_HEIGHT)
      }

      applySize(newWidth, newHeight)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      miniPlayer.classList.remove('be-resizing')

      const finalWidth = clamp(miniPlayer.offsetWidth, MIN_WIDTH)
      let finalHeight = clamp(miniPlayer.offsetHeight, MIN_HEIGHT)

      if (componentSettings.options.keepAspectRatio) {
        finalHeight = Math.round((finalWidth * 9) / 16)
      }

      componentSettings.options.width = finalWidth
      componentSettings.options.height = finalHeight
      applySize(finalWidth, finalHeight)
    }

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      startX = e.clientX
      startY = e.clientY
      startWidth = miniPlayer.offsetWidth
      startHeight = miniPlayer.offsetHeight

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      miniPlayer.classList.add('be-resizing')
      e.stopPropagation()
    }

    handle.addEventListener('mousedown', onMouseDown)
  })
}

export const component = defineComponentMetadata({
  name: 'miniPlayerSize',
  displayName: '小窗播放器大小',
  author: {
    name: 'GH4NG',
    link: 'https://github.com/GH4NG',
  },
  description: {
    'zh-CN': '自定义视频小窗播放器的大小, 可通过拖拽四角调整, 支持保持 16:9 宽高比.',
  },
  tags: [componentsTags.video],
  urlInclude: videoAndBangumiUrls,
  instantStyles: [
    {
      name: 'miniPlayerSize',
      style: () => import('./mini-player-size.scss'),
    },
  ],
  options,
  entry: async ({ metadata }) => {
    const componentSettings = getComponentSettings<Options>(metadata.name)
    const { width, height } = componentSettings.options

    applySize(width, height)

    const setupHandles = () => {
      const miniPlayer = dq('.bpx-player-mini-warp') as HTMLElement
      if (miniPlayer && !miniPlayer.querySelector('.be-mini-player-resize-handle')) {
        setupResizeHandles(miniPlayer, componentSettings)
      }
    }

    window.addEventListener('playerModeChange', setupHandles as EventListener)
  },
})
