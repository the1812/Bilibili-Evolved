import { ComponentMetadata, componentsTags } from '@/components/component'
import { playerUrls } from '../../player/player-urls'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const { raiseEvent } = await import('@/core/utils')
  const input = await select('.bilibili-player-video-danmaku-switch>input') as HTMLInputElement
  if (input === null) {
    return
  }
  input.checked = false
  raiseEvent(input, 'change')
}
export const component: ComponentMetadata = {
  name: 'turnOffDanmaku',
  displayName: '默认关闭弹幕',
  enabledByDefault: false,
  tags: [
    componentsTags.video,
  ],
  entry,
  urlInclude: playerUrls,
}
