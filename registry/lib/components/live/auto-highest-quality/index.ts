import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'
import { getUID } from '@/core/utils'
import { select } from '@/core/spin-query'

const isPlayerReady = (player: any) => player?.getPlayerInfo?.()?.playurl && player.switchQuality

export const component = defineComponentMetadata({
  name: 'autoHighestQuality',
  displayName: '直播自动切换最高画质',
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  entry: async () => {
    if (!getUID()) {
      return
    }

    const player = await select(() => {
      const p = unsafeWindow.livePlayer as any
      return isPlayerReady(p) ? p : null
    })
    console.debug('[直播自动切换最高画质] 播放器已就绪')

    const playerInfo = player.getPlayerInfo()
    const highestQualityNumber = playerInfo.qualityCandidates?.[0]?.qn
    if (highestQualityNumber == null) {
      return
    }

    const hasAutoQuality = playerInfo.qualityCandidates?.some((item: any) => item?.qn === '-1')

    if (hasAutoQuality || playerInfo.quality !== highestQualityNumber) {
      player.switchQuality(highestQualityNumber)
      console.debug('[直播自动切换最高画质] 切换画质')
    }
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})
