import { ComponentMetadata, componentsTags } from '@/components/component'
import { videoAndBangumiUrls } from '../../video-urls'

const entry = async () => {
  const { videoChange } = await import('@/core/observer')
  const { select } = await import('@/core/spin-query')
  videoChange(async () => {
    const danmakuBox = await select('.bui-collapse-wrap')
    if (danmakuBox && danmakuBox.classList.contains('bui-collapse-wrap-folded')) {
      const button = await select('.bui-collapse-header') as HTMLDivElement
      button?.click()
    }
  })
}

export const component: ComponentMetadata = {
  name: 'expandDanmakuList',
  displayName: '展开弹幕列表',
  enabledByDefault: true,
  entry,
  tags: [
    componentsTags.video,
    componentsTags.utils,
  ],
  description: {
    'zh-CN': '每次加载视频时自动展开弹幕列表.',
  },
  urlInclude: videoAndBangumiUrls,
}
