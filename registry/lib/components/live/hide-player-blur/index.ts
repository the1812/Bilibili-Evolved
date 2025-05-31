import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideLivePlayerBlur',
  displayName: '隐藏直播马赛克',
  entry: none,
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: [...liveUrls],
  instantStyles: [{ name: 'hideLivePlayerBlur', style: () => import('./hide-player-blur.scss') }],
})
