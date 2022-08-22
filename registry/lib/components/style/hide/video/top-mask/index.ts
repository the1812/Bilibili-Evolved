import { defineComponentMetadata } from '@/components/define'
import { toggleStyle } from '@/components/styled-component'
import { playerUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  displayName: '隐藏视频标题层',
  ...toggleStyle('hideVideoTopMask', () => import('./top-mask.scss')),
  tags: [
    componentsTags.style,
  ],
  description: {
    'zh-CN': '隐藏视频里鼠标经过时出现在右上角的覆盖层.',
  },
  urlInclude: playerUrls,
})
