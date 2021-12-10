import { ComponentMetadata } from '@/components/types'
import { matchUrlPattern } from '@/core/utils'
import { columnUrls, feedsUrls } from '@/core/utils/urls'
import { setupFeedImageExporter } from './feed'
import desc from './desc.md'

export const component: ComponentMetadata = {
  name: 'imageExporter',
  displayName: '图片批量导出',
  description: {
    'zh-CN': desc,
  },
  tags: [
    componentsTags.feeds,
    componentsTags.utils,
  ],
  entry: async context => {
    await setupFeedImageExporter(context)
  },
  widget: {
    condition: () => columnUrls.some(url => matchUrlPattern(url)),
    component: () => import('./Widget.vue').then(m => m.default),
  },
  urlInclude: [
    ...feedsUrls,
    ...columnUrls,
  ],
  options: {
    columnFormat: {
      defaultValue: '[title][ - n]',
      displayName: '专栏图片命名格式',
    },
    feedFormat: {
      defaultValue: '[user][ - id][ - n]',
      displayName: '动态图片命名格式',
    },
  },
}
