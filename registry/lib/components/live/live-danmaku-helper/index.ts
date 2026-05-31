import { defineComponentMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { getUID } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { liveUrls } from '@/core/utils/urls'
import { select } from '@/core/spin-query'
import { LiveDanmakuHelperOptions, liveDanmakuHelperOptions } from './options'

const name = 'liveDanmakuHelper'
const console = useScopedConsole(name)

const danmakuInputSelector = [
  '.control-panel-ctnr .chat-input-ctnr .chat-input',
  '.chat-input-ctnr .chat-input',
  '.chat-input',
  '[class*="chat-input"] textarea',
  '[class*="chat-input"] input',
  '[class*="chat-input"][contenteditable="true"]',
  '.chat-input-ctnr [contenteditable="true"]',
  'textarea[class*="chat"]',
  'input[class*="chat"]',
].join(', ')

const sendButtonSelector = [
  '.control-panel-ctnr .chat-input-ctnr ~ .bottom-actions .bl-button--primary',
  '.bottom-actions .bl-button--primary',
  '.chat-input-ctnr ~ .bottom-actions button',
  '.control-panel-ctnr button[class*="send"]',
  '.control-panel-ctnr [class*="send"]',
  '.chat-input-ctnr button',
  'button[class*="send"]',
].join(', ')

const liveInputXPath = '/html/body/div[1]/main/div[2]/section/div[2]/div[15]/div/div[3]/div[2]/textarea'
const liveSendXPath = '/html/body/div[1]/main/div[2]/section/div[2]/div[15]/div/div[3]/div[3]/button'
const liveDanmakuTrackXPath = '/html/body/div[1]/main/div[2]/section/div[1]/div[2]/div/div[2]/div[1]/div/div[2]/div[3]/div'

const isVisible = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement &&
  (element.offsetParent !== null || element.getClientRects().length > 0)

const queryVisible = <T extends HTMLElement>(selector: string) =>
  [...document.querySelectorAll<T>(selector)].find(isVisible)

const queryXPath = (xpath: string) =>
  document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue as HTMLElement | null

const setNativeValue = (input: HTMLElement, text: string) => {
  input.focus()
  if (input instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
    setter ? setter.call(input, text) : (input.value = text)
  } else if (input instanceof HTMLInputElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter ? setter.call(input, text) : (input.value = text)
  } else if (input.isContentEditable) {
    input.textContent = text
  }
  input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const sendByXPath = async (text: string) => {
  const input = queryXPath(liveInputXPath)
  const sendButton = queryXPath(liveSendXPath)
  if (!input || !sendButton) return false
  setNativeValue(input, text)
  await new Promise(resolve => setTimeout(resolve, 100))
  sendButton.click()
  return true
}

const getCsrfToken = () => {
  const match = document.cookie.match(/bili_jct=([^;]+)/)
  return match ? match[1] : ''
}

const getRoomId = () => {
  const match = window.location.pathname.match(/\/(\d+)/)
  return match ? match[1] : ''
}

const sendByApi = async (text: string) => {
  try {
    const roomid = getRoomId()
    const csrf = getCsrfToken()
    if (!roomid || !csrf) return false

    const formData = new FormData()
    formData.append('bubble', '0')
    formData.append('msg', text)
    formData.append('color', '16777215')
    formData.append('mode', '1')
    formData.append('room_type', '0')
    formData.append('jumpfrom', '0')
    formData.append('reply_mid', '0')
    formData.append('reply_attr', '0')
    formData.append('replay_dmid', '')
    formData.append('statistics', JSON.stringify({ appId: 100, platform: 5 }))
    formData.append('reply_type', '0')
    formData.append('reply_uname', '')
    formData.append('fontsize', '25')
    formData.append('rnd', Math.floor(Date.now() / 1000).toString())
    formData.append('roomid', roomid)
    formData.append('csrf', csrf)
    formData.append('csrf_token', csrf)

    const response = await fetch('https://api.live.bilibili.com/msg/send', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    const result = await response.json()
    return result.code === 0
  } catch (error) {
    return false
  }
}

const getSendButton = () => {
  const buttons = [...document.querySelectorAll<HTMLElement>(sendButtonSelector)].filter(isVisible)
  return buttons.find(button => !(button as HTMLButtonElement).disabled)
}

const sendDanmaku = async (text: string) => {
  try {
    if (await sendByApi(text)) return true
    if (await sendByXPath(text)) return true

    await select('.control-panel-ctnr, .chat-input-ctnr')
    const input = queryVisible(danmakuInputSelector)
    if (!input) return false

    setNativeValue(input, text)
    await new Promise(resolve => setTimeout(resolve, 100))

    const sendButton = getSendButton()
    if (sendButton && !(sendButton as HTMLButtonElement).disabled) {
      sendButton.click()
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

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

let sidebarCleanup: (() => void) | null = null
const sidebarTextSelectors = [
  '.danmaku-content',
  '.chat-item-content',
  '.chat-item-text',
  '.content',
  '.text',
  '[class*="danmaku-content"]',
  '[class*="content"]',
]

const getChatItemText = (chatItem: HTMLElement) => {
  const dataText = (chatItem as any).danmaku || chatItem.dataset.danmaku
  if (dataText) return String(dataText).trim()

  const content = sidebarTextSelectors
    .map(selector => chatItem.querySelector(selector)?.textContent?.trim())
    .find(Boolean)
  if (content) return content

  return (chatItem.innerText || chatItem.textContent || '')
    .split('\n')
    .map(text => text.trim())
    .filter(text => text && !['+1', '收藏'].includes(text))
    .pop()
}

const setupSidebarActions = () => {
  const chatHistoryPanel = document.querySelector('.chat-history-panel')
  if (!chatHistoryPanel) return

  let currentActionBar: HTMLElement | null = null
  let currentChatItem: HTMLElement | null = null

  const removeActionBar = () => {
    if (currentActionBar) {
      currentActionBar.remove()
      currentActionBar = null
    }
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
    if (!text) return

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

const enablePointerEventsChain = (
  el: HTMLElement,
  stopAt: HTMLElement,
): Array<{ el: HTMLElement; original: string }> => {
  const records: Array<{ el: HTMLElement; original: string }> = []
  let cur: HTMLElement | null = el
  while (cur && cur !== stopAt.parentElement) {
    records.push({ el: cur, original: cur.style.pointerEvents })
    cur.style.setProperty('pointer-events', 'auto', 'important')
    cur = cur.parentElement as HTMLElement | null
  }
  return records
}

const restorePointerEventsChain = (records: Array<{ el: HTMLElement; original: string }>) => {
  for (const { el, original } of records) {
    original ? el.style.setProperty('pointer-events', original) : el.style.removeProperty('pointer-events')
  }
}

let playerCleanup: (() => void) | null = null
const setupPlayerActions = () => {
  const trackContainer = queryXPath(liveDanmakuTrackXPath)
  const fallbackPlayerContainer = document.querySelector('.live-player-ctnr') as HTMLElement
  const danmakuContainer = (trackContainer || fallbackPlayerContainer) as HTMLElement
  if (!danmakuContainer) return

  let currentActionBar: HTMLElement | null = null
  let frozenDanmaku: HTMLElement | null = null
  let currentDanmakuText = ''
  let pointerEventsRecords: Array<{ el: HTMLElement; original: string }> = []

  const positionActionBar = (bar: HTMLElement, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect()
    bar.setAttribute('style', `
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
    `)

    const buttons = bar.querySelectorAll('button')
    buttons.forEach(btn => {
      btn.setAttribute('style', `
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
      `)
    })
  }

  const restore = () => {
    if (frozenDanmaku) {
      unfreezeDanmaku(frozenDanmaku)
      frozenDanmaku = null
    }
    if (currentActionBar) {
      currentActionBar.remove()
      currentActionBar = null
    }
    currentDanmakuText = ''
  }

  const getDanmakuItemFromTarget = (target: HTMLElement): HTMLElement | null => {
    if (!target || target === danmakuContainer) return null
    let cur: HTMLElement | null = target
    while (cur && cur.parentElement !== danmakuContainer) {
      cur = cur.parentElement as HTMLElement | null
    }
    if (!cur || cur === danmakuContainer) return null
    if (cur.classList.contains('bili-danmaku-x-dm-rotate')) return null
    return cur
  }

  const isInsideRect = (x: number, y: number, el: HTMLElement, margin = 8) => {
    const r = el.getBoundingClientRect()
    return x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin
  }

  const handleMouseEnter = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target || target.closest('.danmaku-action-bar')) return

    const danmakuItem = getDanmakuItemFromTarget(target)
    if (!danmakuItem || danmakuItem === frozenDanmaku) return

    const text = danmakuItem.textContent?.trim()
    if (!text || text === currentDanmakuText) return

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

    const targetElement = fullscreenElement && fullscreenElement !== document.documentElement
      ? fullscreenElement
      : document.body

    targetElement.appendChild(currentActionBar)
    positionActionBar(currentActionBar, danmakuItem)
  }

  const handleDocPointerMove = (e: PointerEvent) => {
    if (!frozenDanmaku) return
    const { clientX: x, clientY: y } = e
    const onDanmaku = isInsideRect(x, y, frozenDanmaku)
    const onBar = currentActionBar ? isInsideRect(x, y, currentActionBar, 0) : false
    if (!onDanmaku && !onBar) restore()
  }

  pointerEventsRecords = enablePointerEventsChain(danmakuContainer, document.body as HTMLElement)

  const enableChildPointerEvents = (container: HTMLElement) => {
    for (const child of Array.from(container.children) as HTMLElement[]) {
      if (!child.classList.contains('bili-danmaku-x-dm-rotate')) {
        child.style.setProperty('pointer-events', 'auto', 'important')
      }
    }
  }
  enableChildPointerEvents(danmakuContainer)

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node instanceof HTMLElement && node.parentElement === danmakuContainer) {
          if (!node.classList.contains('bili-danmaku-x-dm-rotate')) {
            node.style.setProperty('pointer-events', 'auto', 'important')
          }
        }
      }
    }
  })
  observer.observe(danmakuContainer, { childList: true })

  danmakuContainer.addEventListener('mouseover', handleMouseEnter, true)
  document.addEventListener('pointermove', handleDocPointerMove, { passive: true })

  playerCleanup = () => {
    observer.disconnect()
    danmakuContainer.removeEventListener('mouseover', handleMouseEnter, true)
    document.removeEventListener('pointermove', handleDocPointerMove)
    restorePointerEventsChain(pointerEventsRecords)
    restore()
  }
}

const entry = async () => {
  if (!getUID()) return

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
  author:{
    name:'oooolcepsed',
    link:'https://github.com/cccccccccooool'
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
