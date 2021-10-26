import { ComponentMetadata } from '@/components/types'
import { startResolution } from './resolution'

export const component: ComponentMetadata = {
  name: 'imageResolution',
  displayName: '高分辨率图片',
  tags: [
    componentsTags.utils,
  ],
  enabledByDefault: window.devicePixelRatio > 1,
  entry: startResolution,
  description: {
    'zh-CN': '根据屏幕 DPI 请求更高分辨率的图片, 例如 DPI 缩放 200% 则请求 2 倍的分辨率, 加载时间也会相应变长一些.',
  },
  options: {
    scale: {
      displayName: '缩放级别',
      defaultValue: 'auto',
      hidden: true,
    },
  },
}
