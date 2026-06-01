import { defineComponentMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { getUID } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'
import { select } from '@/core/spin-query'
import { Toast } from '@/core/toast'
import { useScopedConsole } from '@/core/utils/log'
import { LiveDanmakuHelperOptions, liveDanmakuHelperOptions } from './options'
import { queryXPath, sendDanmaku } from './sender'

const name = 'liveDanmakuHelper'
const console = useScopedConsole(name)

const playerLayerClass = 'live-danmaku-helper-layer'

const liveDanmakuTrackXPath =
  '/html/body/div[1]/main/div[2]/section/div[1]/div[2]/div/div[2]/div[1]/div/div[2]/div[3]/div'

const addFavorite = (text: string) => {
  const { options } = getComponentSettings<LiveDanmakuHelperOptions>(name)
  if (!options.favorites.includes(text)) {
    options.favorites = [...options.favorites, text]
  }
}

const createActionBar = (onPlusOne: () => void, onFavorite: () => void) => {
  const actionBar = document.createElement('div')
  actionBar.setAttribute('class', 'danmaku-action-bar')

  const plusOneBtn = document.createElement('button')
  plusOneBtn.setAttribute('class', 'danmaku-action-btn plus-one')
  plusOneBtn.setAttribute('title', '+1 发送')
  plusOneBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    </svg>
  `
  plusOneBtn.addEventListener('click', e => {
    e.stopPropagation()
    e.preventDefault()
    onPlusOne()
  })

  const favoriteBtn = document.createElement('button')
  favoriteBtn.setAttribute('class', 'danmaku-action-btn favorite')
  favoriteBtn.setAttribute('title', '收藏')
  favoriteBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
    </svg>
  `
  favoriteBtn.addEventListener('click', e => {
    e.stopPropagation()
    e.preventDefault()
    onFavorite()
  })

  actionBar.appendChild(plusOneBtn)
  actionBar.appendChild(favoriteBtn)
  return actionBar
}

const getChatItemText = (chatItem: HTMLElement) => {
  const dataText = (chatItem as any).danmaku || chatItem.dataset.danmaku
  if (dataText) {
    return String(dataText).trim()
  }
  const content = chatItem
    .querySelector('.danmaku-content, .chat-item-content')
    ?.textContent?.trim()
  if (content) {
    return content
  }
  return (chatItem.innerText || chatItem.textContent || '')
    .split('\n')
    .map(text => text.trim())
    .filter(text => text && !['+1', '收藏'].includes(text))
    .pop()
}

let sidebarCleanup: (() => void) | null = null
const setupSidebarActions = () => {
  const chatHistoryPanel = document.querySelector('.chat-history-panel')
  if (!chatHistoryPanel) {
    return
  }

  let currentActionBar: HTMLElement | null = null
  let currentChatItem: HTMLElement | null = null

  const removeActionBar = () => {
    currentActionBar?.remove()
    currentActionBar = null
    currentChatItem = null
  }

  const handleMouseEnter = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const chatItem = target.closest('.chat-item') as HTMLElement
    if (
      !chatItem ||
      chatItem === currentChatItem ||
      chatItem.classList.contains('system-msg') ||
      chatItem.classList.contains('gift-item')
    ) {
      return
    }

    const text = getChatItemText(chatItem)
    if (!text) {
      return
    }

    removeActionBar()
    currentChatItem = chatItem
    currentActionBar = createActionBar(
      () => sendDanmaku(text),
      () => addFavorite(text),
    )
    chatItem.style.position = 'relative'
    chatItem.appendChild(currentActionBar)
  }

  const handleMouseLeave = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const chatItem = target.closest('.chat-item')
    if (chatItem === currentChatItem && currentActionBar) {
      const relatedTarget = e.relatedTarget as HTMLElement
      if (
        !relatedTarget ||
        (!currentActionBar.contains(relatedTarget) && !chatItem.contains(relatedTarget))
      ) {
        removeActionBar()
      }
    }
  }

  chatHistoryPanel.addEventListener('mouseover', handleMouseEnter, true)
  chatHistoryPanel.addEventListener('mouseout', handleMouseLeave, true)

  sidebarCleanup = () => {
    chatHistoryPanel.removeEventListener('mouseover', handleMouseEnter, true)
    chatHistoryPanel.removeEventListener('mouseout', handleMouseLeave, true)
    removeActionBar()
  }
}

const freezeDanmaku = (el: HTMLElement) => {
  el.style.setProperty('animation-play-state', 'paused')
  el.style.setProperty('-webkit-animation-play-state', 'paused')
  el.style.setProperty('transition', 'none')
  el.style.zIndex = '99999'
}

const unfreezeDanmaku = (el: HTMLElement) => {
  el.style.removeProperty('animation-play-state')
  el.style.removeProperty('-webkit-animation-play-state')
  el.style.removeProperty('transition')
  el.style.zIndex = ''
}

let playerCleanup: (() => void) | null = null
const setupPlayerActions = () => {
  const danmakuContainer = queryXPath(liveDanmakuTrackXPath)
  if (!danmakuContainer) {
    if (document.querySelector('.live-player-ctnr canvas')) {
      Toast.info(
        '检测到当前直播间使用 Canvas/WebGL 弹幕渲染，「播放器弹幕悬停」仅支持 HTML/DOM 渲染模式。请在播放器设置中将弹幕渲染方式切换为 DOM 后刷新。',
        '直播弹幕助手',
        8000,
      )
    } else {
      console.warn('未找到 DOM 弹幕层，播放器弹幕悬停未启用')
    }
    return
  }

  let currentActionBar: HTMLElement | null = null
  let frozenDanmaku: HTMLElement | null = null
  let currentDanmakuText = ''

  const positionActionBar = (bar: HTMLElement, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect()
    bar.setAttribute(
      'style',
      `
      all: initial !important;
      position: fixed !important;
      top: ${rect.top + rect.height / 2}px !important;
      left: ${rect.right + 6}px !important;
      transform: translateY(-50%) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 2px !important;
      padding: 2px !important;
      width: fit-content !important;
      height: fit-content !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      background-color: rgba(40, 40, 40, 0.7) !important;
      backdrop-filter: blur(6px) saturate(1.2) !important;
      -webkit-backdrop-filter: blur(6px) saturate(1.2) !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
      white-space: nowrap !important;
      box-sizing: border-box !important;
    `,
    )

    bar.querySelectorAll('button').forEach(btn => {
      btn.setAttribute(
        'style',
        `
        all: initial !important;
        width: 24px !important;
        height: 24px !important;
        padding: 0 !important;
        margin: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
        border: none !important;
        border-radius: 3px !important;
        background-color: transparent !important;
        color: #fff !important;
        cursor: pointer !important;
        box-sizing: border-box !important;
        transition: background-color 0.15s ease-out !important;
      `,
      )
    })
  }

  const restore = () => {
    if (frozenDanmaku) {
      unfreezeDanmaku(frozenDanmaku)
      frozenDanmaku = null
    }
    currentActionBar?.remove()
    currentActionBar = null
    currentDanmakuText = ''
  }

  const getDanmakuItemFromTarget = (target: HTMLElement): HTMLElement | null => {
    if (!target || target === danmakuContainer) {
      return null
    }
    let cur: HTMLElement | null = target
    while (cur && cur.parentElement !== danmakuContainer) {
      cur = cur.parentElement as HTMLElement | null
    }
    if (!cur || cur === danmakuContainer || cur.classList.contains('bili-danmaku-x-dm-rotate')) {
      return null
    }
    return cur
  }

  const isInsideRect = (x: number, y: number, el: HTMLElement, margin = 8) => {
    const r = el.getBoundingClientRect()
    return (
      x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin
    )
  }

  const handleMouseEnter = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target || target.closest('.danmaku-action-bar')) {
      return
    }

    const danmakuItem = getDanmakuItemFromTarget(target)
    if (!danmakuItem || danmakuItem === frozenDanmaku) {
      return
    }

    const text = danmakuItem.textContent?.trim()
    if (!text || text === currentDanmakuText) {
      return
    }

    restore()
    freezeDanmaku(danmakuItem)
    frozenDanmaku = danmakuItem
    currentDanmakuText = text

    currentActionBar = createActionBar(
      () => sendDanmaku(text),
      () => addFavorite(text),
    )
    currentActionBar.classList.add('player-action-bar')

    const fullscreenElement = (document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement) as HTMLElement | null

    const targetElement =
      fullscreenElement && fullscreenElement !== document.documentElement
        ? fullscreenElement
        : document.body

    targetElement.appendChild(currentActionBar)
    positionActionBar(currentActionBar, danmakuItem)
  }

  const handleDocPointerMove = (e: PointerEvent) => {
    if (!frozenDanmaku) {
      return
    }
    const { clientX: x, clientY: y } = e
    const onDanmaku = isInsideRect(x, y, frozenDanmaku)
    const onBar = currentActionBar ? isInsideRect(x, y, currentActionBar, 0) : false
    if (!onDanmaku && !onBar) {
      restore()
    }
  }

  // 仅给弹幕容器打标记类，由 CSS 统一开启子弹幕的 pointer-events（不触碰祖先链，
  // 保留 B 站透明遮罩层的 pointer-events: none，确保点击/双击穿透到视频）。
  danmakuContainer.classList.add(playerLayerClass)

  danmakuContainer.addEventListener('mouseover', handleMouseEnter, true)
  document.addEventListener('pointermove', handleDocPointerMove, { passive: true })

  playerCleanup = () => {
    danmakuContainer.classList.remove(playerLayerClass)
    danmakuContainer.removeEventListener('mouseover', handleMouseEnter, true)
    document.removeEventListener('pointermove', handleDocPointerMove)
    restore()
  }
}

const entry = async () => {
  if (!getUID()) {
    return
  }

  const { options } = getComponentSettings<LiveDanmakuHelperOptions>(name)

  if (options.enableSidebarActions) {
    await select('.chat-history-panel')
    setupSidebarActions()
  }
  if (options.enablePlayerActions) {
    await select('.live-player-ctnr')
    setupPlayerActions()
  }
}

const unload = () => {
  sidebarCleanup?.()
  sidebarCleanup = null
  playerCleanup?.()
  playerCleanup = null
}

const reload = async () => {
  unload()
  await entry()
}

export const component = defineComponentMetadata({
  name,
  displayName: '直播弹幕助手 (+1 & 收藏)',
  tags: [componentsTags.live],
  description: {
    'zh-CN': '为直播间添加弹幕鼠标悬浮 +1 发送、收藏功能。支持侧栏与弹幕。',
  },
  author: {
    name: 'oooolcepsed',
    link: 'https://github.com/cccccccccooool',
  },
  entry,
  reload,
  unload,
  widget: {
     // @ts-ignore
    component: () => import('./FavoritePanel.vue').then(m => m.default),
    condition: () => Boolean(getUID()),
  },
  options: liveDanmakuHelperOptions,
  urlInclude: liveUrls,
  instantStyles: [
    {
      name,
      style: () => import('./style.scss'),
    },
  ],
})
