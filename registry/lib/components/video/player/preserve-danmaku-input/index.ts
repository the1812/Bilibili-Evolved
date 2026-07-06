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
  urlInclude: playerUrls,
})
