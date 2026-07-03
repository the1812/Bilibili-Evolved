import { toggleStyle } from '@/components/styled-component'
import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  ...toggleStyle('alwaysShowDuration', () => import('./always-show-duration.scss')),
  displayName: '总是显示视频时长',
  tags: [componentsTags.video, componentsTags.style],
})
