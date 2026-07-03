import { styledComponentEntry } from '@/components/styled-component'
import { defineComponentMetadata } from '@/components/define'
import type { ComponentMetadata } from '@/components/types'
import { removeStyle } from '@/core/style'
import { videoAndBangumiUrls, watchlaterUrls } from '@/core/utils/urls'
import { createMergerContext } from './entry'
import { options, type MergerOptions } from './options'

const STYLE_NAME = 'danmakuMerger'

let cleanup: (() => void) | null = null
let componentRef: ComponentMetadata<MergerOptions>

const mergerEntry = styledComponentEntry(
  () => import('./merger.scss'),
  async context => {
    cleanup?.()
    cleanup = await createMergerContext(context)
    return cleanup
  },
)

const reloadMerger = async () => {
  const { getComponentSettings } = await import('@/core/settings')
  const { coreApis } = await import('@/core/core-apis')
  await mergerEntry({
    settings: getComponentSettings(componentRef.name),
    metadata: componentRef,
    coreApis,
  })
}

export const component = defineComponentMetadata<MergerOptions>({
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
  reload: reloadMerger,
  urlInclude: [...videoAndBangumiUrls, ...watchlaterUrls],
})
componentRef = component
