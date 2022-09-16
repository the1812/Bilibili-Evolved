import { defineComponentMetadata } from '@/components/define'
import { playerUrls } from '@/core/utils/urls'

const name = 'preserveDanmakuInput'
export const component = defineComponentMetadata({
  name,
  displayName: '强制保留弹幕发送栏',
  entry: none,
  instantStyles: [
    {
      name,
      style: () => import('./danmaku-input.scss'),
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  description: {
    'zh-CN':
      '在视频播放器网页全屏时, 即使宽度过小也强制保留弹幕发送栏, 注意这可能导致右侧的功能按钮挤出边界.',
  },
  urlInclude: playerUrls,
})
