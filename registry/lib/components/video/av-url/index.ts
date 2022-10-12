import { defineComponentMetadata } from '@/components/define'
import { fullyLoaded } from '@/core/life-cycle'
import { urlChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { videoUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'avUrl',
  displayName: '网址AV号转换',
  description: {
    'zh-CN':
      '当视频的链接是BV号时, 自动转换为AV号. 请注意这会导致浏览器历史记录出现重复的标题 (分别是转换前后的网址), 并可能导致后退要多退几次.',
  },
  entry: () => {
    fullyLoaded(() => {
      urlChange(async () => {
        const aid = await select(() => unsafeWindow.aid)
        if (!aid) {
          return
        }
        if (document.URL.includes('videocard_series')) {
          // 系列视频不能转换, 否则会无限刷新
          console.log('skip video series')
          return
        }
        const newUrl = document.URL.replace(
          /\/(video|bangumi)\/(BV[\w]+)/i,
          (_, type) => `/${type}/av${aid}`,
        )
        if (document.URL !== newUrl) {
          window.history.replaceState(history.state, '', newUrl)
        }
      })
    })
  },
  tags: [componentsTags.video, componentsTags.utils],
  urlInclude: videoUrls,
})
