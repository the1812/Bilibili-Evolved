import { defineComponentMetadata } from '@/components/define'
import { fullyLoaded } from '@/core/life-cycle'
import { urlChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { videoUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'avUrl',
  displayName: '网址AV号转换',
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
