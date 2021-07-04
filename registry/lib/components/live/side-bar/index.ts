import { ComponentMetadata } from '@/components/types'
import { toggleStyle } from '@/components/styled-component'
import { liveUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  ...toggleStyle('collapseLiveSideBar', () => import('./side-bar.scss')),
  displayName: '自动收起直播侧栏',
  tags: [
    componentsTags.live,
    componentsTags.style,
  ],
  enabledByDefault: true,
  urlInclude: liveUrls,
}
