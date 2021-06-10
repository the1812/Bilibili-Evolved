import { ComponentMetadata, componentsTags } from '@/components/component'
import { startResolution } from './resolution'

export const component: ComponentMetadata = {
  name: 'imageResolution',
  displayName: '高分辨率图片',
  tags: [
    componentsTags.utils,
  ],
  enabledByDefault: false,
  entry: startResolution,
  description: {
    'zh-CN': '根据屏幕DPI请求更高分辨率的图片, 例如DPI缩放200%则请求2倍的分辨率, 加载时间也会相应变长一些.',
  },
  options: {
    scale: {
      displayName: '缩放级别',
      defaultValue: 'auto',
      hidden: true,
    },
  },
}
