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

      const waitForPlayer = setInterval(() => {
        if (isPlayerReady()) {
          clearInterval(waitForPlayer)
          resolve()
        }
      }, 500)
    })
    console.debug('[直播自动切换最高画质] 播放器已就绪')

    const player = unsafeWindow.livePlayer
    const { qualityCandidates } = player.getPlayerInfo()
    const highestQualityNumber = qualityCandidates[0].qn

    const intervalId = setInterval(() => {
      if (player.getPlayerInfo().quality === highestQualityNumber) {
        console.debug('[直播自动切换最高画质] 已是最高画质')
        clearInterval(intervalId)
        return
      }
      player.switchQuality(highestQualityNumber)
      console.debug('[直播自动切换最高画质] 切换画质')
    }, 1000)
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})
