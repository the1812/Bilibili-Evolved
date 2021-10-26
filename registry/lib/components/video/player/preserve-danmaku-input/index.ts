import { ComponentMetadata } from '@/components/types'
import { toggleStyle } from '@/components/styled-component'
import { playerUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  ...toggleStyle('preserveDanmakuInput', () => import('./danmaku-input.scss')),
  displayName: '强制保留弹幕发送栏',
  tags: [
    componentsTags.style,
    componentsTags.video,
  ],
  description: {
    'zh-CN': '在网页全屏时, 即使宽度过小也强制保留弹幕发送栏, 注意这可能导致右侧的功能按钮挤出边界.',
  },
  urlInclude: playerUrls,
}
