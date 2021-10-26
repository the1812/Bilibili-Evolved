import { toggleStyle } from '@/components/styled-component'
import { ComponentMetadata } from '@/components/types'
import { videoUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  ...toggleStyle('fullEpisodeTitle', () => import('./full-episode-title.scss')),
  displayName: '展开选集标题',
  description: {
    'zh-CN': '总是完全展开视频选集列表的标题, 注意对番剧无效.',
  },
  tags: [componentsTags.video],
  urlInclude: videoUrls,
}
