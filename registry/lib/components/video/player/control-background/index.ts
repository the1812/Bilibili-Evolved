import { ComponentEntry, ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'

const entry: ComponentEntry = async ({ metadata }) => {
  const { addComponentListener } = await import('@/core/settings')
  addComponentListener(`${metadata.name}.includeProgress`, (value: boolean) => {
    document.body.classList.toggle('video-control-progress-background', value)
  }, true)
  addComponentListener(`${metadata.name}.opacity`, (value: number) => {
    document.documentElement.style.setProperty('--video-control-opacity', value.toString())
  }, true)
}
export const component: ComponentMetadata = {
  name: 'playerControlBackground',
  displayName: '播放器控制栏背景色',
  tags: [
    componentsTags.video,
    componentsTags.style,
  ],
  description: {
    'zh-CN': '给视频播放器控制栏附上半透明的黑色, 代替原来的阴影.',
  },
  entry,
  instantStyles: [
    {
      name: 'playerControlBackground',
      style: () => import('./control-background.scss'),
    },
  ],
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
    includeProgress: {
      displayName: '包括进度条',
      defaultValue: true,
    },
  },
}
