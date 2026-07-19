import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'autoHighestQuality',
  displayName: '直播自动切换最高画质',
  entry: async () => {
    await new Promise<void>(resolve => {
      const isPlayerReady = () => {
        return (
          unsafeWindow.livePlayer &&
          unsafeWindow.livePlayer.getPlayerInfo &&
          unsafeWindow.livePlayer.getPlayerInfo().playurl &&
          unsafeWindow.livePlayer.switchQuality
        )
      }

      if (isPlayerReady()) {
        resolve()
        return
      }

      const observer = new MutationObserver(() => {
        if (isPlayerReady()) {
          observer.disconnect()
          resolve()
        }
      })
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })
    })

    const player = unsafeWindow.livePlayer
    const { qualityCandidates } = player.getPlayerInfo()
    const highestQualityNumber = qualityCandidates[0].qn
    const currentQualityNumber = player.getPlayerInfo().quality

    if (currentQualityNumber !== highestQualityNumber) {
      player.switchQuality(highestQualityNumber)
    }
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})
