import { removeStyle } from '@/core/style'
import { defineComponentMetadata } from '@/components/define'
import type { ComponentEntry } from '@/components/types'
import { videoAndBangumiUrls, watchlaterUrls } from '@/core/utils/urls'
import { createMergerContext } from './entry'

const DM_MERGER_STYLE_NAME = 'danmakuMerger'

let cleanup: (() => void) | null = null

const entry: ComponentEntry = async context => {
  cleanup?.()
  cleanup = await createMergerContext(context)
}

export const component = defineComponentMetadata({
  name: 'danmakuMerger',
  displayName: '弹幕合并器',
  description: {
    'zh-CN':
      '将其他 B 站视频的弹幕合并进原生播放器画面与右侧弹幕列表（不自绘）。支持多源合并、分P有效顺延、BV 前缀列表显示。',
  },
  tags: [componentsTags.video],
  author: {
    name: 'XianYuDaXian',
    link: 'https://github.com/XianYuDaXian',
  },
  entry,
  reload: entry,
  unload: () => {
    cleanup?.()
    cleanup = null
    removeStyle(DM_MERGER_STYLE_NAME)
  },
  urlInclude: [...videoAndBangumiUrls, ...watchlaterUrls],
})