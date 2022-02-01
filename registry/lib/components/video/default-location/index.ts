import { ComponentMetadata } from '@/components/types'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { select } from '@/core/spin-query'
import desc from './desc.md'

export const component: ComponentMetadata = {
  name: 'videoDefaultLocation',
  displayName: '播放页默认定位',
  tags: [componentsTags.video],
  urlInclude: videoAndBangumiUrls,
  description: { 'zh-CN': desc },
  extraOptions: () => import('./Options.vue').then(m => m.default),
  options: {
    location: {
      defaultValue: 0,
      hidden: true,
    },
  },
  entry: async ({ settings: { options: { location } } }) => {
    // 等待页面加载后滚动到设置默认位置

    // timeout 必须大于 500。否则一次也不查询
    // eslint-disable-next-line arrow-body-style
    const trySelect = (query: string, timeout: number) => {
      return select(query, { maxRetry: Math.floor(timeout / 500), queryInterval: 500 })
    }

    // 等待页面加载。返回加载是否完成的 boolean 值
    const waitLoading = async (timeout: number) => {
      const res = await Promise.all([
        trySelect('.bb-comment', timeout),
        trySelect('#bilibili-player', timeout),
      ])
      return res.every(v => v)
    }

    // 等待页面加载，并在特定的时刻输出 warn 日志。
    // 若加载成功则执行定位操作，否则输出 error 日志
    const minute = 60_000
    const moments = [minute / 2, minute, 2 * minute, 5 * minute]
    let lastMoment = 0
    for (const moment of moments) {
      if (await waitLoading(moment - lastMoment)) {
        break
      } else {
        console.warn(`[videoDefaultLocation] waiting more than ${moment}ms for the page to load`)
      }
      lastMoment = moment
    }
    if (lastMoment === lodash.last(moments)) {
      console.error('[videoDefaultLocation] waiting for page load timeout')
    } else {
      unsafeWindow.scrollTo(0, location)
    }
  },
}
