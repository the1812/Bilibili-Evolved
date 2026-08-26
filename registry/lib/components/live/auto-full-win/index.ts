import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'
import { select } from '@/core/spin-query'

const isPlayerReady = (player: any) => player?.getPlayerInfo?.()?.playurl

export const component = defineComponentMetadata({
  name: 'autoFullWin',
  displayName: '直播自动网页全屏',
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  entry: async () => {
    const player = await select(() => {
      const p = unsafeWindow.livePlayer as any
      return isPlayerReady(p) ? p : null
    })

    player.setFullscreenStatus(1)
    console.debug('[直播自动网页全屏] 已切换到网页全屏')
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})
