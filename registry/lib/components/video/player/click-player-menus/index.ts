import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { preventEvent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'

const name = 'clickPlayerMenus'

/** 播放器中悬停即会展开弹出菜单的控件 */
interface HoverMenu {
  /** 触发菜单的按钮, 弹出菜单是它的子节点 */
  trigger: string
  /** 弹出菜单的根节点, 用于判断菜单当前是否已经展开 */
  popup: string
  /**
   * 播放器用行内 display 展开的菜单 (弹幕设置), 其余菜单用按钮上的状态类
   */
  shownByDisplay?: boolean
}

/** 键名与 `options` 中的选项同名, 选项关闭时对应控件不生效 */
const hoverMenus = {
  quality: {
    trigger: '.bpx-player-ctrl-quality',
    popup: '.bpx-player-ctrl-quality-menu',
  },
  playbackRate: {
    trigger: '.bpx-player-ctrl-playbackrate',
    popup: '.bpx-player-ctrl-playbackrate-menu',
  },
  subtitle: {
    trigger: '.bpx-player-ctrl-subtitle',
    popup: '.bpx-player-ctrl-subtitle-box',
  },
  danmakuSettings: {
    trigger: '.bpx-player-dm-setting',
    popup: '.bpx-player-dm-setting-wrap',
    shownByDisplay: true,
  },
  setting: {
    trigger: '.bpx-player-ctrl-setting',
    popup: '.bpx-player-ctrl-setting-box',
  },
} satisfies Record<string, HoverMenu>

type MenuId = keyof typeof hoverMenus

const menuEntries = Object.entries(hoverMenus) as [MenuId, HoverMenu][]

const SHOWN_STATE_CLASS = 'bpx-state-show'
/** 弹幕设置展开时, 播放器会给弹出菜单添加这个类 */
const EXPAND_CLASS = 'bpx-player-dm-setting-expand-interaction-area'
/** 播放器延迟展开的时长, 用于收尾它已经排队的展开定时器 */
const SHOW_DELAY = 320

const options = defineOptionsMetadata({
  quality: {
    defaultValue: true,
    displayName: '画质',
  },
  playbackRate: {
    defaultValue: true,
    displayName: '倍速',
  },
  subtitle: {
    defaultValue: true,
    displayName: '字幕',
  },
  danmakuSettings: {
    defaultValue: true,
    displayName: '弹幕设置',
  },
  setting: {
    defaultValue: true,
    displayName: '设置',
  },
})

/** 当前启用的控件, 由选项控制 */
const enabledIds = new Set<MenuId>()

interface MatchedMenu {
  menu: HoverMenu
  trigger: Element
}

const findMenu = (element: Element): MatchedMenu | null => {
  for (const [id, menu] of menuEntries) {
    if (!enabledIds.has(id)) {
      continue
    }
    const trigger = element.closest(menu.trigger)
    if (trigger !== null) {
      return { menu, trigger }
    }
  }
  return null
}

const findPopup = ({ menu, trigger }: MatchedMenu) => {
  const popup = trigger.querySelector(menu.popup) ?? dq(menu.popup)
  return popup instanceof HTMLElement ? popup : null
}

const isShown = (element: HTMLElement) => {
  const style = getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    style.pointerEvents !== 'none' &&
    element.getBoundingClientRect().height > 0
  )
}

const isMenuOpen = (matched: MatchedMenu) => {
  if (matched.menu.shownByDisplay) {
    const popup = findPopup(matched)
    return popup !== null && isShown(popup)
  }
  return matched.trigger.classList.contains(SHOWN_STATE_CLASS)
}

/** 仿照播放器自身的展开方式切换状态, 但不等待它的 300ms 延迟 */
const setShown = (matched: MatchedMenu, shown: boolean) => {
  if (!matched.menu.shownByDisplay) {
    matched.trigger.classList.toggle(SHOWN_STATE_CLASS, shown)
    return
  }
  const popup = findPopup(matched)
  if (popup !== null) {
    popup.style.display = shown ? '' : 'none'
    popup.classList.toggle(EXPAND_CLASS, shown)
  }
}

/** 播放器的弹出菜单由 mouseover / mouseenter 驱动, 用合成事件让它同步自身状态 */
const raiseHover = (element: Element, eventName: string, bubbles: boolean) => {
  element.dispatchEvent(new MouseEvent(eventName, { bubbles, relatedTarget: document.body }))
}

/** 每次切换自增, 用于丢弃上一次切换遗留的收尾动作 */
let toggleToken = 0
/** 上一次点击展开的时刻, 播放器会从这里开始排队一个延时展开 */
let lastOpenTime = 0
/** 由点击展开的菜单, 展开期间保持显示, 不随光标离开而收起 */
let pinned: MatchedMenu | null = null

/**
 * 播放器会在鼠标静止一段时间后淡出整条控制栏, 淡出用的是祖先元素的 opacity,
 * 控件自身的 opacity 仍是 1, 所以要沿着祖先链看真正生效的可见性
 */
const isVisible = (element: Element) => {
  if (!element.isConnected) {
    return false
  }
  let opacity = 1
  for (let node: Element | null = element; node !== null; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false
    }
    opacity *= parseFloat(style.opacity) || 0
    if (opacity === 0) {
      return false
    }
  }
  const { width, height } = element.getBoundingClientRect()
  return width > 0 && height > 0
}

/** 轮询间隔, 比控制栏淡入淡出的 300ms 短, 能及时跟上 */
const HIDE_POLL_INTERVAL = 200
/**
 * 淡入和淡出都要经过 opacity: 0, 连续两次轮询都不可见才算真的淡出了,
 * 光标一动控制栏就往上回来, 这种情况下菜单不该被收起
 */
const HIDE_POLL_STREAK = 2

let hidePoll: number | null = null
let hiddenStreak = 0

const stopHidePoll = () => {
  if (hidePoll !== null) {
    window.clearInterval(hidePoll)
    hidePoll = null
  }
}

/** 丢弃固定状态, 不改动菜单当前的展开状态 */
const dropPin = () => {
  pinned = null
  stopHidePoll()
}

const openMenu = (matched: MatchedMenu) => {
  toggleToken += 1
  lastOpenTime = Date.now()
  raiseHover(matched.trigger, 'mouseover', true)
  raiseHover(matched.trigger, 'mouseenter', false)
  setShown(matched, true)
}

const closeMenu = (matched: MatchedMenu) => {
  toggleToken += 1
  const token = toggleToken
  setShown(matched, false)
  raiseHover(matched.trigger, 'mouseout', true)
  raiseHover(matched.trigger, 'mouseleave', false)
  // 播放器的展开定时器还排着队时会再把菜单展开一次, 等它触发完再收一次
  const wait = lastOpenTime + SHOW_DELAY - Date.now()
  if (wait > 0) {
    window.setTimeout(() => {
      if (token === toggleToken && findMenu(matched.trigger) !== null) {
        setShown(matched, false)
      }
    }, wait)
  }
}

/** 收起点击展开的菜单, `notify` 为 false 时不通知播放器, 避免它排队收起定时器 */
const unpin = (notify = true) => {
  const current = pinned
  dropPin()
  if (current === null) {
    return
  }
  if (notify) {
    closeMenu(current)
    return
  }
  toggleToken += 1
  setShown(current, false)
}

/**
 * 淡出期间光标一旦移动控制栏就会回来, 所以按可见性轮询而不是盯着某个状态类:
 * 真的淡出了才收起菜单, 其它组件 (如 强制保留播放器控制栏) 压住淡出时也不误收
 */
const startHidePoll = () => {
  stopHidePoll()
  hiddenStreak = 0
  hidePoll = window.setInterval(() => {
    if (pinned === null) {
      stopHidePoll()
      return
    }
    hiddenStreak = isVisible(pinned.trigger) ? 0 : hiddenStreak + 1
    if (hiddenStreak < HIDE_POLL_STREAK) {
      return
    }
    // 控制栏已经淡出, 不再通知播放器, 免得它排队收起定时器
    unpin(false)
  }, HIDE_POLL_INTERVAL)
}

/** 悬停不再展开菜单, 菜单内部的悬停反馈保持原生行为 */
const shouldBlockHover = (event: Event) => {
  // 放过程序触发的事件, 播放器自身的展开逻辑依赖它们
  if (!event.isTrusted || !(event.target instanceof Element)) {
    return false
  }
  const matched = findMenu(event.target)
  if (matched === null) {
    return false
  }
  return event.target.closest(matched.menu.popup) === null
}

/** 点击展开的菜单在光标离开时收起是播放器的原生行为, 展开期间拦下这些事件 */
const shouldBlockLeave = (event: Event) => {
  if (pinned === null || !event.isTrusted || !(event.target instanceof Element)) {
    return false
  }
  if (!isMenuOpen(pinned) || !pinned.trigger.contains(event.target)) {
    return false
  }
  const { relatedTarget } = event as MouseEvent
  // 光标在按钮与弹出菜单之间移动时, 保持播放器的原生判断
  return !(relatedTarget instanceof Node && pinned.trigger.contains(relatedTarget))
}

const onClick = (event: Event) => {
  const { target } = event
  if (!(target instanceof Element)) {
    return
  }
  // 播放器选择菜单项或重建控件后会收起菜单, 这里同步一下固定状态
  if (pinned !== null && (!pinned.trigger.isConnected || !isMenuOpen(pinned))) {
    dropPin()
  }
  const matched = findMenu(target)
  if (matched === null) {
    unpin()
    return
  }
  const { menu } = matched
  // 菜单内部的点击交给播放器处理 (选择菜单项, 操作设置项等)
  if (target.closest(menu.popup) !== null) {
    return
  }
  if (pinned !== null && pinned.trigger === matched.trigger) {
    pinned = null
    closeMenu(matched)
    return
  }
  unpin()
  pinned = matched
  startHidePoll()
  openMenu(matched)
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    unpin()
  }
}

let cancel: (() => void) | null = null

/** 选项切换时同步启用的控件, 关闭选项会收起它已经展开的菜单 */
const watchOption = (id: MenuId, disposers: (() => void)[]) => {
  const path = `${name}.${id}`
  const listener = (enabled: boolean) => {
    if (enabled) {
      enabledIds.add(id)
    } else {
      enabledIds.delete(id)
      if (pinned !== null && pinned.menu === hoverMenus[id]) {
        // 控件交还给播放器后, 它还会排一个收起定时器, 会打断恢复后的悬停展开
        unpin(false)
      }
    }
  }
  addComponentListener(path, listener, true)
  disposers.push(() => removeComponentListener(path, listener))
}

const enable = () => {
  cancel?.()
  enabledIds.clear()
  const disposers: (() => void)[] = []
  for (const [id] of menuEntries) {
    watchOption(id, disposers)
  }
  for (const eventName of ['mouseover', 'mouseenter', 'pointerover']) {
    disposers.push(preventEvent(document, eventName, shouldBlockHover))
  }
  for (const eventName of ['mouseout', 'mouseleave']) {
    disposers.push(preventEvent(document, eventName, shouldBlockLeave))
  }
  document.addEventListener('click', onClick, true)
  document.addEventListener('keydown', onKeyDown, true)
  disposers.push(() => {
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('keydown', onKeyDown, true)
    dropPin()
  })
  cancel = () => {
    disposers.forEach(dispose => dispose())
    disposers.length = 0
    enabledIds.clear()
  }
}

export const component = defineComponentMetadata({
  name,
  displayName: '播放器弹出菜单改为点击展开',
  author: {
    name: 'tangentyh',
    link: 'https://github.com/tangentyh',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  options,
  entry: enable,
  reload: enable,
  unload: () => {
    cancel?.()
  },
})
