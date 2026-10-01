import { defineComponentMetadata } from '@/components/define'
import { spaceUploadVideosUrls } from '@/core/utils/urls'
import { entry, reload, unload } from './main'

export const component = defineComponentMetadata({
  name: 'spaceFreeVideos',
  displayName: '免费视频筛选',
  author: {
    name: 'OrangeChange',
    link: 'https://github.com/OrangeChange',
  },
  tags: [componentsTags.video, componentsTags.utils],
  urlInclude: spaceUploadVideosUrls,
  entry,
  reload,
  unload,
  instantStyles: [
    {
      name: 'spaceFreeVideos',
      style: () => import('./style.scss'),
    },
  ],
})
