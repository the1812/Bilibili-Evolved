import { styledComponentEntry } from '@/components/styled-component'
import { defineComponentMetadata } from '@/components/define'
import { removeStyle } from '@/core/style'
import { videoAndBangumiUrls, watchlaterUrls } from '@/core/utils/urls'
import { createMergerContext } from './entry'
import { options } from './options'

const STYLE_NAME = 'danmakuMerger'

let cleanup: (() => void) | null = null

const mergerEntry = styledComponentEntry(
  () => import('./merger.scss'),
  async context => {
    cleanup?.()
    cleanup = await createMergerContext(context)
    return cleanup
  },
)

export const component = defineComponentMetadata({
  name: 'danmakuMerger',
  displayName: '弹幕合并器',
  tags: [componentsTags.video],
  author: {
    name: 'XianYuDaXian',
    link: 'https://github.com/XianYuDaXian',
  },
  options,
  extraOptions: () => import('./ui/MaintenanceOptions.vue').then(m => m.default),
  entry: mergerEntry,
  unload: () => {
    cleanup?.()
    cleanup = null
    removeStyle(STYLE_NAME)
  },
  reload: mergerEntry,
  urlInclude: [...videoAndBangumiUrls, ...watchlaterUrls],
})
