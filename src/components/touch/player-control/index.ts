import { ComponentMetadata, componentsTags } from '@/components/component'
import { playerUrls } from '@/components/video/player/player-urls'

const id = 'touch-player-control'
const entry = async () => {
  const { addStyle } = await import('@/core/style')
  const { default: style } = await import('./player-control.scss')
  addStyle(style, id)
  document.body.classList.add(id)
}
export const component: ComponentMetadata = {
  name: 'touchPlayerControl',
  displayName: '控制栏触摸优化',
  description: {
    'zh-CN': '增大播放器控制栏里按钮的间距, 方便触屏使用.',
  },
  tags: [
    componentsTags.touch,
    componentsTags.style,
  ],
  enabledByDefault: false,
  urlInclude: playerUrls,
  entry,
  reload: entry,
  unload: () => {
    document.getElementById(id)?.remove()
    document.body.classList.remove(id)
  },
}
