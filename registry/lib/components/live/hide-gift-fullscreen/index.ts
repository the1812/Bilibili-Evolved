import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'
import { waitForControlBar } from '@/components/live/live-control-bar'
import { addStyle, removeStyle } from '@/core/style'

export const component = defineComponentMetadata({
  name: 'hide-fullscreen-gift-bar',
  displayName: '隐藏直播时全屏的送礼物选项',
  description: '隐藏直播的全屏视频播放器的礼物栏',
  entry: async () => {
    waitForControlBar({
      callback: async () => {
        removeStyle('hide-fullscreen-gift')
        addStyle(
          '#full-screen-interactive-wrap { display: none !important }',
          'hide-fullscreen-gift',
        )
      },
    })
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
})
