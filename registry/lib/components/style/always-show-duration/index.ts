import { toggleStyle } from '@/components/styled-component'
import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  ...toggleStyle('alwaysShowDuration', () => import('./always-show-duration.scss')),
  displayName: '总是显示视频时长',
  description: {
    'zh-CN': '使脚本展示的各种视频卡片中的时长无需鼠标经过也能一直显示.',
  },
  tags: [componentsTags.video, componentsTags.style],
})
