import { defineComponentMetadata } from '@/components/define'
import { addComponentListener, getComponentSettings } from '@/core/settings'

// 组件描述由同目录 index.md 编译时注入, 不要在此手写 description 字段.

const componentName = 'hideHeaderBadge'

/** 「永远 99+」插入的假角标标记属性 */
const FAKE_FLAG = 'data-be-force99'

/** 入口定义: 包裹层类名 (主判据) + href (后备判据), 经实际 DOM 取证 (2026-10) */
const ENTRIES = {
  messages: {
    wrap: '.message-entry',
    href: 'a[href*="message.bilibili.com"]',
  },
  feeds: {
    wrap: '.dynamic-entry',
    href: 'a[href*="//t.bilibili.com"]',
  },
} as const

type HeaderBadgeOptions = {
  hideMessagesBadge: boolean
  hideFeedsBadge: boolean
  forceMessages99: boolean
  forceFeeds99: boolean
}

const applyOptions = (options: HeaderBadgeOptions) => {
  const root = document.documentElement
  // 同一入口「永远 99+」优先于「屏蔽」
  root.classList.toggle(
    'be-hide-header-badge--messages',
    !!options.hideMessagesBadge && !options.forceMessages99,
  )
  root.classList.toggle(
    'be-hide-header-badge--feeds',
    !!options.hideFeedsBadge && !options.forceFeeds99,
  )
  root.classList.toggle('be-hide-header-badge--force99-messages', !!options.forceMessages99)
  root.classList.toggle('be-hide-header-badge--force99-feeds', !!options.forceFeeds99)
}

/* ---------- 永远 99+: 角标存在性保障 ---------- */

let observer: MutationObserver | undefined
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const ensureEntryBadge = (entry: Element) => {
  const iconWrap = entry.querySelector('.trigger-icon-wrap')
  if (!iconWrap || iconWrap.querySelector('.red-num')) return
  const fake = document.createElement('div')
  fake.className = 'red-num'
  fake.setAttribute(FAKE_FLAG, '')
  fake.textContent = '99+' // 显示层由 CSS ::after 接管, 这里仅作兜底
  iconWrap.insertBefore(fake, iconWrap.firstChild)
}

const ensureAllBadges = (options: Pick<HeaderBadgeOptions, 'forceMessages99' | 'forceFeeds99'>) => {
  for (const key of Object.keys(ENTRIES) as (keyof typeof ENTRIES)[]) {
    const entry = ENTRIES[key]
    if (!options[key]) {
      continue
    }
    const items = new Set<Element>([
      ...document.querySelectorAll(`.bili-header .right-entry ${entry.wrap}`),
      ...document.querySelectorAll(
        `.bili-header .right-entry .right-entry__item:has(${entry.href})`,
      ),
    ])
    items.forEach(ensureEntryBadge)
  }
}

const startObserver = (
  getOptions: () => Pick<HeaderBadgeOptions, 'forceMessages99' | 'forceFeeds99'>,
) => {
  if (observer) {
    return
  }
  // 红点由 B 站 Vue 条件渲染 (count > 0), 未读数为 0 或重渲染时需重新插入.
  // 插入幂等 (已有 .red-num 则跳过), 不会死循环.
  observer = new MutationObserver(() => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => ensureAllBadges(getOptions()), 150)
  })
  observer.observe(document.body, { childList: true, subtree: true })
  ensureAllBadges(getOptions())
}

const stopObserver = () => {
  observer?.disconnect()
  observer = undefined
  clearTimeout(debounceTimer)
  document.querySelectorAll(`[${FAKE_FLAG}]`).forEach(el => el.remove())
}

const applyAndWatch = (metadataName: string) => {
  const apply = () => {
    const { options } = getComponentSettings(metadataName)
    applyOptions(options as HeaderBadgeOptions)
    const anyForce = !!(options.forceMessages99 || options.forceFeeds99)
    anyForce
      ? startObserver(() => getComponentSettings(metadataName).options as HeaderBadgeOptions)
      : stopObserver()
  }
  addComponentListener(`${metadataName}.hideMessagesBadge`, apply)
  addComponentListener(`${metadataName}.hideFeedsBadge`, apply)
  addComponentListener(`${metadataName}.forceMessages99`, apply)
  addComponentListener(`${metadataName}.forceFeeds99`, apply)
  apply()
}

export const component = defineComponentMetadata({
  name: 'hideHeaderBadge',
  displayName: '屏蔽消息/动态红点',
  author: [{ name: 'TangKuku9', link: 'https://github.com/TangKuku9' }],
  tags: [componentsTags.style],
  instantStyles: [
    {
      name: 'hideHeaderBadge',
      style: () => import('./hide-header-badge.scss'),
    },
  ],
  options: {
    hideMessagesBadge: {
      displayName: '屏蔽「消息」红点',
      defaultValue: true,
    },
    hideFeedsBadge: {
      displayName: '屏蔽「动态」红点',
      defaultValue: true,
    },
    forceMessages99: {
      displayName: '「消息」永远 99+',
      defaultValue: false,
    },
    forceFeeds99: {
      displayName: '「动态」永远 99+',
      defaultValue: false,
    },
  },
  entry: ({ metadata }) => {
    applyAndWatch(metadata.name)
  },
  reload: () => {
    // 关闭再开启组件时 entry 不会重跑, 由 reload 按当前设置重新应用 (与 unload 成对)
    const { options } = getComponentSettings(componentName)
    applyOptions(options as HeaderBadgeOptions)
    const anyForce = !!(options.forceMessages99 || options.forceFeeds99)
    anyForce
      ? startObserver(() => getComponentSettings(componentName).options as HeaderBadgeOptions)
      : stopObserver()
  },
  unload: () => {
    stopObserver()
    document.documentElement.classList.remove(
      'be-hide-header-badge--messages',
      'be-hide-header-badge--feeds',
      'be-hide-header-badge--force99-messages',
      'be-hide-header-badge--force99-feeds',
    )
  },
})
