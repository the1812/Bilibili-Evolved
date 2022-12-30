import { defineComponentMetadata } from '@/components/define'
import { playerUrls } from '@/core/utils/urls'

const id = 'touch-player-control'
const entry = async () => {
  document.body.classList.add(id)
}
export const component = defineComponentMetadata({
  name: 'touchPlayerControl',
  displayName: '控制栏触摸优化',
  description: {
    'zh-CN': '增大播放器控制栏里按钮的间距, 方便触屏使用.',
  },
  tags: [componentsTags.touch, componentsTags.style],
  enabledByDefault: navigator.maxTouchPoints > 0,
  urlInclude: playerUrls,
  instantStyles: [
    {
      name: id,
      style: () => import('./player-control.scss'),
    },
  ],
  entry,
  reload: entry,
  unload: () => {
    document.body.classList.remove(id)
  },
})
