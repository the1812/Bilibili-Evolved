import { defineComponentMetadata } from '@/components/define'
import { allVideoUrls } from '@/core/utils/urls'
import { options } from './options'
import { entry, reload, unload } from './runtime'

export const component = defineComponentMetadata({
  name: 'videoPageBackground',
  displayName: '播放页自定义背景',
  tags: [componentsTags.video, componentsTags.style],
  author: [
    {
      name: 'andya1lan',
      link: 'https://github.com/andya1lan',
    },
  ],
  urlInclude: allVideoUrls,
  options,
  extraOptions: () => import('./ExtraOptions.vue').then(m => m.default),
  entry,
  reload,
  unload,
  instantStyles: [
    {
      name: 'videoPageBackground',
      style: () => import('./video-page-background.scss'),
    },
  ],
})
