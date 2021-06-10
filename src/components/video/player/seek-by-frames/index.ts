import { ComponentMetadata, componentsTags } from '@/components/component'
import desc from './desc.md'
import { playerUrls } from '../player-urls'

export const SeekByFramesDisabledClass = 'seek-by-frame-disable'
const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const { mountVueComponent, dq } = await import('@/core/utils')
  const time = await select('.bilibili-player-video-time')
  if (time === null || dq('.frame-playback')) {
    return
  }
  const SeekByFrames = await import('./SeekByFrames.vue')
  time.insertAdjacentElement('afterend', mountVueComponent(SeekByFrames).$el)
}

export const component: ComponentMetadata = {
  name: 'seekByFrames',
  displayName: '启用逐帧调整',
  tags: [
    componentsTags.video,
  ],
  enabledByDefault: true,
  description: {
    'zh-CN': desc,
  },
  entry,
  reload: () => document.body.classList.remove(SeekByFramesDisabledClass),
  unload: () => document.body.classList.add(SeekByFramesDisabledClass),
  urlInclude: playerUrls,
}
