import { ComponentMetadata, componentsTags } from '@/components/component'
import { toggleStyle } from '@/components/styled-component'
import { playerUrls } from '@/components/video/player/player-urls'

export const component: ComponentMetadata = {
  name: 'preserveDanmakuInput',
  displayName: '保留弹幕发送栏',
  ...toggleStyle(() => import('./danmaku-input.scss')),
  tags: [
    componentsTags.style,
  ],
  enabledByDefault: false,
  description: {
    'zh-CN': '在网页全屏时, 即使宽度过小也强制保留弹幕发送栏, 注意这可能导致右侧的功能按钮挤出边界.',
  },
  urlInclude: playerUrls,
}
