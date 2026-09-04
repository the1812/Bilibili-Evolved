import {
  defineComponentMetadata,
  OptionsOfMetadata,
  defineOptionsMetadata,
} from '@/components/define'

import { liveUrls } from '@/core/utils/urls'
import { select } from '@/core/spin-query'

const isPlayerReady = (player: any) => player?.getPlayerInfo?.()?.playurl

const options = defineOptionsMetadata({
  autoScrollOnStyle: {
    displayName: '在带有活动样式的直播间自动滚动到播放器区域',
    defaultValue: true,
  },
})
export type Options = OptionsOfMetadata<typeof options>

export const component = defineComponentMetadata({
  name: 'autoFullWin',
  displayName: '直播自动网页全屏',
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  entry: async ({ settings }) => {
    const player = await select(() => {
      const p = unsafeWindow.livePlayer as any
      return isPlayerReady(p) ? p : null
    })

    const stylePlayerArea = dq('.live-player-bg .player')
    if (stylePlayerArea && settings.options.autoScrollOnStyle) {
      stylePlayerArea.scrollIntoView({ block: 'center' })
      console.debug('[直播自动网页全屏] 已滚动到播放器区域')
    }

    player.setFullscreenStatus(1)
    console.debug('[直播自动网页全屏] 已切换到网页全屏')
  },
  options,
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})
