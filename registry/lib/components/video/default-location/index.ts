import { defineComponentMetadata } from '@/components/define'
import {
  allVideoUrls,
  bangumiUrls,
  cheeseUrls,
  matchCurrentPage,
  mediaListUrls,
} from '@/core/utils/urls'
import { select } from '@/core/spin-query'
import desc from './desc.md'

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
    displayName: '拜年纪视频页',
    urls: [/\/\/www\.bilibili\.com\/festival\/(\d+)bnj/],
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

interface WaitMoment {
  time: number
  callback: (time: number) => Promise<void>
}

class WaitResult<R> {
  constructor(
    // promise 完成前经过的最后一个 moments 中的时刻，
    // 如果没有任何一个时刻经过，该值为 0
    public lastMoment: number,
    // promise 的返回值
    public result: R,
  ) {}
}

// 等待 promise 执行完成。当经过 moments 所指定的时刻时，调用对应的函数。
// moments 的时刻必须是递增顺序
async function waitWithMoments<R>(
  promise: Promise<R>,
  moments: Iterable<WaitMoment>,
): Promise<WaitResult<R>> {
  let lastMoment = { time: 0, callback: none as unknown } as WaitMoment
  let timeoutId = null

  const momentIt = moments[Symbol.iterator]()
  const setNextMoment = () => {
    const yielded = momentIt.next()
    if (!yielded.done) {
      const nextMoment = yielded.value
      timeoutId = setTimeout(() => {
        timeoutId = null
        lastMoment.callback(lastMoment.time)
        lastMoment = nextMoment
        setNextMoment()
      }, nextMoment.time - lastMoment.time)
    }
  }
  setNextMoment()

  const result = await promise
  timeoutId !== null && clearTimeout(timeoutId)
  return new WaitResult(lastMoment.time, result)
}

// 等待评论区元素加载，以提供足够的高度
// 在特定的时刻输出 warn 日志。超时时输出 error 日志。
// 返回元素是否在超时前加载完成
const waitComment = async (): Promise<boolean> => {
  const minute = 60_000
  const promise = select('.bb-comment', { maxRetry: 50, queryInterval: 600 })
  const moments = [minute / 2, minute, 3 * minute].map(
    time =>
      ({
        time,
        callback: (async theTime => {
          console.warn(`[videoDefaultLocation] waiting more than ${theTime}ms for the page to load`)
        }) as WaitMoment['callback'],
      } as WaitMoment),
  )
  const res = (await waitWithMoments(promise, moments)).result
  if (res === null) {
    console.error('[videoDefaultLocation] waiting for page load timeout')
    return false
  }
  return true
}

const entry = async ({
  settings: {
    options: { locations },
  },
}) => {
  // TODO: 添加“刷新/前进/后退时禁用”选项以支持自定义
  // 仅在初次进入页面时进行定位，即刷新、回退等操作不会执行定位
  const navigationArr = window?.performance?.getEntriesByType('navigation')
  if (navigationArr?.length !== 1) {
    console.error(
      `[videoDefaultLocation] 无法处理 PerformanceNavigationTiming 不是一个的情况。url: ${window.location.href}`,
    )
    return
  }
  const nav = navigationArr[0] as PerformanceNavigationTiming
  if (nav.type !== 'navigate') {
    return
  }

  if (matchCurrentPage(commonVideoUrlPattern)) {
    // 屏蔽初始化时的滚动行为
    const org = unsafeWindow.scrollTo
    unsafeWindow.scrollTo = () => {
      unsafeWindow.scrollTo = org
    }
  }

  // 获取当前页面类型的默认位置
  const pageType = getCurrentPageType()
  if (pageType === null) {
    console.error(`[videoDefaultLocation] unknown page type. url: ${window.location.href}`)
    return
  }
  const defaultLocation = locations[pageType]

  // TODO: 自定义顶栏会改变页面高度，使该组件的定位出现偏差。因此需要在其操作完成后再定位
  // 滚动到默认位置
  const html = document.documentElement
  if (defaultLocation < html.scrollHeight - html.clientHeight || (await waitComment())) {
    window.scrollTo(0, defaultLocation)
  }
}

export const component = defineComponentMetadata({
  name: 'videoDefaultLocation',
  displayName: '视频页默认定位',
  tags: [componentsTags.video],
  urlInclude: allVideoUrls,
  description: { 'zh-CN': desc },
  extraOptions: () => import('./Options.vue').then(m => m.default),
  options: {
    locations: {
      defaultValue: lodash.mapValues(pageTypeInfos, () => 0),
      hidden: true,
    },
  },
  entry: entry as any,
})
