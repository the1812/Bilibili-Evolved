import { defineComponentMetadata } from '@/components/define'
import { mainSiteUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideBanner',
  entry: none,
  displayName: '隐藏顶部横幅',
  instantStyles: [
    {
      name: 'hideBanner',
      style: () => import('./banner.scss'),
    },
  ],
  tags: [componentsTags.style],
  urlInclude: mainSiteUrls,
})
