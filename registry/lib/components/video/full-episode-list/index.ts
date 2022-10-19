import { defineComponentMetadata } from '@/components/define'
import { videoUrls } from '@/core/utils/urls'

const name = 'fullEpisodeTitle'
export const component = defineComponentMetadata({
  name,
  instantStyles: [
    {
      name,
      style: () => import('./full-episode-list.scss'),
    },
  ],
  entry: none,
  displayName: '展开选集列表',
  tags: [componentsTags.video, componentsTags.style],
  urlInclude: videoUrls,
})
