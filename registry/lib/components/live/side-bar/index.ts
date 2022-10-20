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
  description: '自动收起直播间右边偏下的侧栏. (上面有个 "关注" 的面板)',
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: liveUrls,
})
