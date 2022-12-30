import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'
import { feedsUrlsWithoutDetail } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  ...toggleStyle('fullFeedsContent', () => import('./full-content.scss')),
  displayName: '展开动态内容',
  description: {
    'zh-CN': '不管内容多长, 总是完全展开动态的内容.',
  },
  tags: [componentsTags.style, componentsTags.feeds],
  urlInclude: feedsUrlsWithoutDetail,
})
