import { addStyle, removeStyle } from '@/core/style'
import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls, watchlaterUrls } from '@/core/utils/urls'

const DM_MERGER_STYLE_NAME = 'danmakuMerger'

/** BE 未 grant GM_addStyle，旧版 runtime 或缓存包可能仍会调用 */
const ensureGmAddStylePolyfill = () => {
  const g = globalThis as typeof globalThis & {
    GM_addStyle?: (css: string) => void
  }
  if (typeof g.GM_addStyle === 'function') {
    return
  }
  g.GM_addStyle = (css: string) => {
    addStyle(css, DM_MERGER_STYLE_NAME)
  }
}

let cleanup: (() => void) | null = null

const entry = async () => {
  ensureGmAddStylePolyfill()
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
    removeStyle(DM_MERGER_STYLE_NAME)
  },
  urlInclude: [...videoAndBangumiUrls, ...watchlaterUrls],
})
