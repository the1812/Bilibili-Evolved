import { ComponentMetadata, componentsTags } from '@/components/component'
import { styledComponentEntry } from '@/components/styled-component'
import { ComponentSettings } from '@/core/settings'
import { playerUrls } from '../player-urls'

const entry = async (settings: ComponentSettings, component: ComponentMetadata) => {
  const { addComponentListener } = await import('@/core/settings')
  addComponentListener(`${component.name}.opacity`, (value: number) => {
    document.documentElement.style.setProperty('--video-control-opacity', value.toString())
  }, true)
}
export const component: ComponentMetadata = {
  name: 'playerControlBackground',
  displayName: '控制栏着色',
  enabledByDefault: false,
  tags: [
    componentsTags.video,
    componentsTags.style,
  ],
  description: {
    'zh-CN': '给视频控制栏附上半透明的黑色, 代替原来的阴影.',
  },
  entry: styledComponentEntry(() => import('./control-background.scss'), entry),
  reload: () => {
    document.body.classList.remove('disable-video-control-background')
  },
  unload: () => {
    document.body.classList.add('disable-video-control-background')
  },
  urlInclude: playerUrls,
  options: {
    opacity: {
      displayName: '不透明度',
      defaultValue: 0.64,
      validator: (value: number) => {
        if (value < 0) {
          return 0
        }
        if (value > 1) {
          return 1
        }
        return value
      },
    },
  },
}
