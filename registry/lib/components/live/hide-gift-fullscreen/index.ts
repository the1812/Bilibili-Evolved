import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'
import { waitForControlBar } from '@/components/live/live-control-bar'
import { addStyle } from '@/core/style'

export const component = defineComponentMetadata({
  name: 'hide-fullscreen-gift-bar',
  displayName: '全屏直播简化',
  description: '移除全屏观看直播时的底部礼物栏',
  entry: async () => {
    waitForControlBar({
      callback: async () => {
        addStyle(
          '#full-screen-interactive-wrap { display: none !important }',
          'hide-fullscreen-gift',
        )
        addStyle(
          '#fullscreen-danmaku-vm .fullscreen-danmaku { bottom: 5px !important }',
          'fix_fullscreen_danmaku',
        )
      },
    })
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})
