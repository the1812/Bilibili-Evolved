import { defineComponentMetadata } from '@/components/define'
import {
  allVideoUrls,
  bangumiUrls,
  cheeseUrls,
  festivalUrls,
  matchCurrentPage,
  mediaListUrls,
} from '@/core/utils/urls'
import { delay, waitForForeground } from '@/core/utils'

const commonVideoUrlPattern = '//www.bilibili.com/video/'

export const pageTypeInfos = {
  withTitle: {
    displayName: '带标题视频页',
    urls: [commonVideoUrlPattern, ...mediaListUrls],
  },
  noTitle: {
    displayName: '无标题视频页',
    urls: [...bangumiUrls, ...cheeseUrls],
  },
  bnj: {
    displayName: '活动视频页',
    urls: festivalUrls,
  },
}

export const getCurrentPageType = lodash.once((): string | null => {
  for (const [name, { urls }] of Object.entries(pageTypeInfos)) {
    if (matchCurrentPage(urls)) {
      return name
    }
  }
  return null
})

const getScrollableHeight = () =>
  document.documentElement.scrollHeight - document.documentElement.clientHeight

const pollInterval = 500
const idleTimeout = 2_000
const waitTimeout = 30_000

// 等页面高度稳定后再滚动, 不够高则等内容加载后继续滚
const scrollToTarget = async (target: number) => {
  const deadline = Date.now() + waitTimeout
  let lastHeight = getScrollableHeight()
  let lastChange = Date.now()
  while (Date.now() < deadline && Date.now() - lastChange <= idleTimeout) {
    await delay(pollInterval)
    const height = getScrollableHeight()
    if (height !== lastHeight) {
      lastHeight = height
      lastChange = Date.now()
      continue
    }
    window.scrollTo({ top: target, behavior: 'instant' })
    if (height >= target) {
      return
    }
  }
  console.warn(
    `[videoDefaultLocation] 页面高度不足, 无法定位到 ${target} (可滚动高度 ${getScrollableHeight()})`,
  )
}

const entry = async ({
  settings: {
    options: { locations },
  },
}) => {
  // 前进/后退时由浏览器恢复滚动位置, 不做定位
  const nav = window.performance?.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  if (nav?.type === 'back_forward') {
    return
  }

  if (matchCurrentPage(commonVideoUrlPattern)) {
    // 屏蔽初始化时的滚动行为
    const org = unsafeWindow.scrollTo
    unsafeWindow.scrollTo = () => {
      unsafeWindow.scrollTo = org
    }
  }

  // 后台打开时页面尚未渲染, 定位会被忽略
  await new Promise<void>(resolve => waitForForeground(() => resolve()))

  const pageType = getCurrentPageType()
  if (pageType === null) {
    console.error(`[videoDefaultLocation] unknown page type. url: ${window.location.href}`)
    return
  }

  // TODO: 自定义顶栏会改变页面高度，使该组件的定位出现偏差。因此需要在其操作完成后再定位
  await scrollToTarget(locations[pageType])
}

export const component = defineComponentMetadata({
  name: 'videoDefaultLocation',
  displayName: '视频页默认定位',
  tags: [componentsTags.video],
  urlInclude: allVideoUrls,
  extraOptions: () => import('./Options.vue').then(m => m.default),
  options: {
    locations: {
      defaultValue: lodash.mapValues(pageTypeInfos, () => 0),
      hidden: true,
    },
  },
  entry: entry as any,
})
