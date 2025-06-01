import { defineComponentMetadata } from '@/components/define'
import { videoChange } from '@/core/observer'
import { videoUrls, watchlaterUrls } from '@/core/utils/urls'
import { playerAgent } from '@/components/video/player-agent'
import { getWatchlaterList, toggleWatchlater } from '@/components/video/watchlater'

let listener: (() => Promise<void>) | null = null
export const component = defineComponentMetadata({
  name: 'autoRemoveWatchlater',
  displayName: '自动移出稍后再看',
  tags: [componentsTags.video],
  urlInclude: [...watchlaterUrls, ...videoUrls],
  entry: () => {
    videoChange(async ({ aid }) => {
      const videoElement = await playerAgent.query.video.element()
      if (listener !== null) {
        videoElement.removeEventListener('ended', listener)
      }
      listener = async () => {
        const list = await getWatchlaterList()
        if (list.includes(parseInt(aid))) {
          await toggleWatchlater(aid)
        }
      }
      videoElement.addEventListener('ended', listener)
    })
  },
})
