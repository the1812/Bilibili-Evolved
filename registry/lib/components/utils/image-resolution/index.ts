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
  options,
})
