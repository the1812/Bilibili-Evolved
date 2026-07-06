import { defineComponentMetadata } from '@/components/define'
import { playerUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hiResButtonStyles',
  displayName: 'Hi-Res 音质按钮布局调整',
  entry: none,
  instantStyles: [
    {
      name: 'hiResButtonStyles',
      style: () => import('./hi-res-button-styles.scss'),
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  urlInclude: playerUrls,
})
