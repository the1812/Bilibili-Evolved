import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'collapseLiveSideBar',
  entry: none,
  instantStyles: [
    {
      name: 'collapseLiveSideBar',
      style: () => import('./side-bar.scss'),
    },
  ],
  displayName: '自动收起直播侧栏',
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: liveUrls,
})
