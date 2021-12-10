import { ComponentMetadata } from '@/components/types'
import { mainSiteUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
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
  description: {
    'zh-CN': '隐藏首页顶部横幅.',
  },
  urlInclude: mainSiteUrls,
}
