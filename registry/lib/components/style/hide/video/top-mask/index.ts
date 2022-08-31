import { ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'

const name = 'hideVideoTopMask'
export const component: ComponentMetadata = {
  name,
  displayName: '隐藏视频标题层',
  entry: none,
  instantStyles: [
    {
      name,
      style: () => import('./top-mask.scss'),
    },
  ],
  tags: [
    componentsTags.style,
  ],
  description: {
    'zh-CN': '隐藏视频里鼠标经过时出现在右上角的覆盖层.',
  },
  urlInclude: playerUrls,
}
