import { ComponentMetadata } from '@/components/component'
import { liveUrls } from '@/core/utils/urls'

const id = 'dpi-live-showgirl'
const entry = async () => {
  const { addStyle } = await import('@/core/style')
  if (document.getElementById(id) === null) {
    addStyle(`
      .haruna-ctnr,
      .avatar-btn
      {
        transform: scale(${1 / window.devicePixelRatio}) !important;
      }
    `, id)
  }
}
export const component: ComponentMetadata = {
  name: 'dpiLiveShowgirl',
  displayName: '直播看板娘高DPI适配',
  enabledByDefault: window.devicePixelRatio > 1,
  description: {
    'zh-CN': '根据屏幕DPI缩放直播看板娘的大小, 避免像素锯齿.',
  },
  tags: [
    componentsTags.live,
    componentsTags.style,
  ],
  entry,
  reload: entry,
  unload: () => {
    document.getElementById(id)?.remove()
  },
  urlInclude: liveUrls,
}
