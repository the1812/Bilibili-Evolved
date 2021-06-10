import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { liveUrls } from '../live-urls'

export const component: ComponentMetadata = {
  name: 'collapseLiveSideBar',
  displayName: '自动收起直播侧栏',
  ...toggleStyle(() => import('./side-bar.scss')),
  tags: [
    componentsTags.live,
    componentsTags.style,
  ],
  enabledByDefault: false,
  urlInclude: liveUrls,
}
