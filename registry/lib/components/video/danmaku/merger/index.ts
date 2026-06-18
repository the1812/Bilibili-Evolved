import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls, watchlaterUrls } from '@/core/utils/urls'

let cleanup: (() => void) | null = null

const entry = async () => {
  cleanup?.()
  const { initDanmakuMerger } = await import('./merger-runtime')
  cleanup = initDanmakuMerger()
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
  },
  urlInclude: [...videoAndBangumiUrls, ...watchlaterUrls],
})
