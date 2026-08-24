import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'
import { ComponentSettings } from '@/core/settings/types'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import browserIcon from './browser.svg'
import newTabIcon from './new-tab.svg'

enum OpenMode {
  CurrentTab = '当前标签页（B站默认）',
  NewTab = '新标签页',
}

enum IconVisibility {
  CardHover = '悬停视频卡片时',
  Always = '始终显示',
}

const options = defineOptionsMetadata({
  defaultOpenMode: {
    displayName: '默认打开方式',
    dropdownEnum: OpenMode,
    defaultValue: OpenMode.CurrentTab,
  },
  showOpenModeIcon: {
    displayName: '显示反向打开图标',
    defaultValue: true,
  },
  iconVisibility: {
    displayName: '图标显示方式',
    dropdownEnum: IconVisibility,
    defaultValue: IconVisibility.CardHover,
  },
})

type Options = OptionsOfMetadata<typeof options>

const componentName = 'relatedVideoOpenMode'
const buttonClass = 'be-related-video-open-button'
const titleClass = 'be-related-video-title'
const titleContainerClass = 'be-related-video-title-container'
const cardClass = 'be-related-video-card'
const alwaysShowClass = 'be-related-video-open-always'

// Keep this in sync with the right-side recommendation locations used by hideRelatedVideos.
const recommendListSelector = [
  '#recom_module',
  '#reco_list',
  '.r-con .rcmd-list',
  '.playlist-container .recommend-list-container',
  '.plp-r [class*="recommend_wrap"]',
  '.video-container-v1 .recommend-list-v1',
].join(', ')

const titleSelector = [
  '.title',
  '[class^="title_"]',
  '[class*=" title_"]',
  '[class*="_title_"]',
  '[class*="RecommendItem_title"]',
  '[class*="recommend_title"]',
  '[class*="recommend-title"]',
].join(', ')

const cardSelector = [
  '.video-page-card',
  '.video-page-card-small',
  '.recommend-video-card',
  '.remd-video-card',
  '.video-card',
  '[class*="RecommendItem_wrap"]',
  '[class*="recommend_item"]',
  '[class*="recommend-item"]',
].join(', ')

const playablePathPattern = /^\/(?:video\/(?:av\d+|BV[\da-z]+)|bangumi\/play\/(?:ep|ss)\d+)/i
const originalTargets = new Map<HTMLAnchorElement, string | null>()
const titleButtons = new Map<Element, HTMLButtonElement>()
const buttonTitles = new WeakMap<HTMLButtonElement, Element>()

let componentSettings: ComponentSettings<Options> | null = null
let observer: MutationObserver | null = null
let titleResizeObserver: ResizeObserver | null = null
let scanRequest: number | null = null
let initialScanTimer: number | null = null
let initialScanPending = false
let active = false

const isPlayableAnchor = (anchor: HTMLAnchorElement) => {
  try {
    const url = new URL(anchor.href, document.URL)
    const isBilibili = url.hostname === 'bilibili.com' || url.hostname.endsWith('.bilibili.com')
    return isBilibili && playablePathPattern.test(url.pathname)
  } catch {
    return false
  }
}

const findTitleAnchor = (title: Element) => {
  if (title instanceof HTMLAnchorElement && isPlayableAnchor(title)) {
    return title
  }
  const parentAnchor = title.closest<HTMLAnchorElement>('a[href]')
  if (parentAnchor && isPlayableAnchor(parentAnchor)) {
    return parentAnchor
  }
  return [...title.querySelectorAll<HTMLAnchorElement>('a[href]')].find(isPlayableAnchor) ?? null
}

const restoreAnchorTarget = (anchor: HTMLAnchorElement, target: string | null) => {
  if (target === null) {
    anchor.removeAttribute('target')
  } else {
    anchor.setAttribute('target', target)
  }
}

const restoreAnchorTargets = () => {
  originalTargets.forEach((target, anchor) => restoreAnchorTarget(anchor, target))
  originalTargets.clear()
}

const openInOppositeMode = (button: Element) => {
  const title = button instanceof HTMLButtonElement ? buttonTitles.get(button) : null
  const anchor = title && findTitleAnchor(title)
  if (!anchor || !componentSettings) {
    return
  }
  if (componentSettings.options.defaultOpenMode === OpenMode.CurrentTab) {
    window.open(anchor.href, '_blank', 'noopener')
  } else {
    window.location.assign(anchor.href)
  }
}

const clickHandler = (event: MouseEvent) => {
  if (!active || event.button !== 0 || !(event.target instanceof Element)) {
    return
  }
  const button = event.target.closest(`.${buttonClass}`)
  if (!button) {
    return
  }
  event.preventDefault()
  event.stopImmediatePropagation()
  openInOppositeMode(button)
}

const removeButtons = () => {
  titleButtons.forEach((button, title) => {
    titleResizeObserver?.unobserve(title)
    button.parentElement?.classList.remove(titleContainerClass)
  })
  titleButtons.clear()
  document.querySelectorAll(`.${buttonClass}`).forEach(button => button.remove())
  document.querySelectorAll(`.${titleClass}`).forEach(title => title.classList.remove(titleClass))
  document
    .querySelectorAll(`.${titleContainerClass}`)
    .forEach(container => container.classList.remove(titleContainerClass))
  document.querySelectorAll(`.${cardClass}`).forEach(card => card.classList.remove(cardClass))
}

const updateButton = (button: HTMLButtonElement) => {
  if (!componentSettings) {
    return
  }
  const opensNewTab = componentSettings.options.defaultOpenMode === OpenMode.CurrentTab
  const label = opensNewTab ? '在新标签页打开' : '在当前标签页打开'
  if (button.getAttribute('aria-label') === label) {
    return
  }
  button.innerHTML = opensNewTab ? newTabIcon : browserIcon
  button.title = label
  button.setAttribute('aria-label', label)
}

const updateButtonSize = (title: Element, button: HTMLButtonElement) => {
  button.style.fontSize = getComputedStyle(title).fontSize
}

const addButton = (title: Element, container: Element) => {
  const anchor = findTitleAnchor(title)
  if (!anchor) {
    return
  }
  const titleContainer = anchor.contains(title) ? anchor.parentElement : title
  if (!titleContainer || !container.contains(titleContainer)) {
    return
  }
  let button = [...titleContainer.children].find(element =>
    element.classList.contains(buttonClass),
  ) as HTMLButtonElement | undefined
  if (button && buttonTitles.has(button) && buttonTitles.get(button) !== title) {
    return
  }
  if (!button) {
    button = document.createElement('button')
    button.type = 'button'
    button.className = buttonClass
    titleContainer.append(button)
  }
  updateButton(button)
  updateButtonSize(title, button)
  titleButtons.set(title, button)
  buttonTitles.set(button, title)
  titleResizeObserver?.observe(title)
  title.classList.add(titleClass)
  titleContainer.classList.add(titleContainerClass)
  const card = title.closest(cardSelector)
  if (card && container.contains(card)) {
    card.classList.add(cardClass)
  }
}

const scanRecommendLists = () => {
  scanRequest = null
  if (!active || !componentSettings) {
    return
  }
  const { defaultOpenMode, showOpenModeIcon } = componentSettings.options
  const containers = [...document.querySelectorAll(recommendListSelector)]
  originalTargets.forEach((target, anchor) => {
    if (!anchor.isConnected || !containers.some(container => container.contains(anchor))) {
      restoreAnchorTarget(anchor, target)
      originalTargets.delete(anchor)
    }
  })
  titleButtons.forEach((button, title) => {
    if (!button.isConnected || !title.isConnected) {
      titleResizeObserver?.unobserve(title)
      button.parentElement?.classList.remove(titleContainerClass)
      button.remove()
      title.classList.remove(titleClass)
      titleButtons.delete(title)
    }
  })
  containers.forEach(container => {
    container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(anchor => {
      if (!isPlayableAnchor(anchor) || defaultOpenMode !== OpenMode.NewTab) {
        return
      }
      if (!originalTargets.has(anchor)) {
        originalTargets.set(anchor, anchor.getAttribute('target'))
      }
      if (anchor.target !== '_blank') {
        anchor.target = '_blank'
      }
    })
    if (!showOpenModeIcon) {
      return
    }
    container.querySelectorAll(titleSelector).forEach(title => {
      if (findTitleAnchor(title)) {
        addButton(title, container)
      }
    })
  })
}

const scheduleScan = () => {
  if (!active) {
    return
  }

  // B 站初次渲染期间会连续修改推荐列表的 DOM。
  // 此时直接向 Vue 管理的节点插入按钮可能造成真实 DOM 与虚拟节点失配。
  // 初次扫描改为“等待 DOM 安静下来一段时间”后再执行；后续动态更新仍保持一帧合并。
  if (initialScanPending) {
    if (initialScanTimer !== null) {
      window.clearTimeout(initialScanTimer)
    }
    initialScanTimer = window.setTimeout(() => {
      initialScanTimer = null
      if (!active) {
        return
      }
      initialScanPending = false
      if (scanRequest !== null) {
        cancelAnimationFrame(scanRequest)
        scanRequest = null
      }
      scanRequest = requestAnimationFrame(scanRecommendLists)
    }, 500)
    return
  }

  if (scanRequest !== null) {
    return
  }
  scanRequest = requestAnimationFrame(scanRecommendLists)
}

const applySettings = () => {
  if (!active || !componentSettings) {
    return
  }
  const { defaultOpenMode, showOpenModeIcon, iconVisibility } = componentSettings.options
  if (defaultOpenMode === OpenMode.CurrentTab) {
    restoreAnchorTargets()
  }
  document.documentElement.classList.toggle(
    alwaysShowClass,
    showOpenModeIcon && iconVisibility === IconVisibility.Always,
  )
  if (!showOpenModeIcon) {
    removeButtons()
  }
  scheduleScan()
}

const activate = () => {
  if (active) {
    return
  }
  active = true
  initialScanPending = true
  document.addEventListener('click', clickHandler, true)
  window.addEventListener('resize', scheduleScan)
  titleResizeObserver = new ResizeObserver(entries => {
    entries.forEach(({ target }) => {
      const button = titleButtons.get(target)
      if (button) {
        updateButtonSize(target, button)
      }
    })
  })
  observer = new MutationObserver(scheduleScan)
  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'target'],
  })
  applySettings()
}

const deactivate = () => {
  active = false
  observer?.disconnect()
  observer = null
  if (scanRequest !== null) {
    cancelAnimationFrame(scanRequest)
    scanRequest = null
  }
  if (initialScanTimer !== null) {
    window.clearTimeout(initialScanTimer)
    initialScanTimer = null
  }
  initialScanPending = false
  document.removeEventListener('click', clickHandler, true)
  window.removeEventListener('resize', scheduleScan)
  document.documentElement.classList.remove(alwaysShowClass)
  removeButtons()
  titleResizeObserver?.disconnect()
  titleResizeObserver = null
  restoreAnchorTargets()
}

const entry: ComponentEntry<Options> = ({ metadata, settings }) => {
  componentSettings = settings
  addComponentListener(`${metadata.name}.defaultOpenMode`, applySettings)
  addComponentListener(`${metadata.name}.showOpenModeIcon`, applySettings)
  addComponentListener(`${metadata.name}.iconVisibility`, applySettings)
  activate()
}

export const component = defineComponentMetadata({
  name: componentName,
  displayName: '推荐视频打开方式',
  author: {
    name: 'RhoPaper',
    link: 'https://github.com/RhoPaper',
  },
  tags: [componentsTags.video],
  urlInclude: videoAndBangumiUrls,
  options,
  instantStyles: [
    {
      name: componentName,
      style: () => import('./index.scss'),
    },
  ],
  entry,
  reload: activate,
  unload: deactivate,
})
