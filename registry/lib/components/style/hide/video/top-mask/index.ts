import { defineComponentMetadata } from '@/components/define'
import { playerUrls } from '@/core/utils/urls'

const name = 'hideVideoTopMask'
export const component = defineComponentMetadata({
  name,
  displayName: '隐藏视频标题层',
  entry: none,
  instantStyles: [
    {
      name,
      style: () => import('./top-mask.scss'),
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  urlInclude: playerUrls,
})
