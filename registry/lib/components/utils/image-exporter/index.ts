import { ComponentMetadata } from '@/components/types'
import { matchUrlPattern } from '@/core/utils'
import { columnUrls, feedsUrls } from '@/core/utils/urls'
import { setupFeedImageExporter } from './feed'

export const component: ComponentMetadata = {
  name: 'imageExporter',
  displayName: '图片批量导出',
  description: {
    'zh-CN': '可以批量导出某个地方的图片, 目前支持动态和专栏. TODO: 补充文件名变量说明',
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
