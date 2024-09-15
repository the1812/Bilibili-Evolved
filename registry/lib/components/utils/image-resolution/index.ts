import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { startResolution } from './resolution'

const options = defineOptionsMetadata({
  scale: {
    displayName: '缩放级别',
    defaultValue: 'auto',
    hidden: true,
  },
  originalImageInArticles: {
    displayName: '在专栏中请求原图',
    defaultValue: false,
  },
})

export type Options = OptionsOfMetadata<typeof options>

export const component = defineComponentMetadata({
  name: 'imageResolution',
  displayName: '高分辨率图片',
  tags: [componentsTags.utils],
  enabledByDefault: window.devicePixelRatio > 1,
  entry: startResolution,
  description: {
    'zh-CN':
      '根据屏幕 DPI 请求更高分辨率的图片, 例如 DPI 缩放 200% 则请求 2 倍的分辨率, 加载时间也会相应变长一些. (也会导致某些浏览器里出现图片闪动, 因为本质上是更换了图片源)',
  },
  options,
})
