import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { playerUrls } from '@/components/video/player/player-urls'

export const component: ComponentMetadata = {
  name: 'hideTopMask',
  displayName: '隐藏视频标题层',
  ...toggleStyle(() => import('./top-mask.scss')),
  tags: [
    componentsTags.style,
  ],
  description: {
    'zh-CN': '隐藏视频里鼠标经过时出现在右上角的覆盖层.',
  },
  urlInclude: playerUrls,
}
