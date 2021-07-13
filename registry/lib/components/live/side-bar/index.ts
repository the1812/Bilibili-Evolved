import { ComponentMetadata } from '@/components/types'
import { liveUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  name: 'collapseLiveSideBar',
  entry: none,
  instantStyles: [
    {
      name: 'collapseLiveSideBar',
      style: () => import('./side-bar.scss'),
    },
  ],
  displayName: '自动收起直播侧栏',
  tags: [
    componentsTags.live,
    componentsTags.style,
  ],
  urlInclude: liveUrls,
}
