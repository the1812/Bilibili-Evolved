import { ComponentEntry, ComponentMetadata } from '@/components/types'
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { mediaListUrls, videoAndBangumiUrls } from '@/core/utils/urls'

const entry: ComponentEntry = async ({ settings: { options } }) => {
  videoChange(async () => {
    if (mediaListUrls.some(url => matchUrlPattern(url)) && options.ignoreMediaList) {
      return
    }
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
  entry,
  tags: [componentsTags.video],
  description: {
    'zh-CN': '每次加载视频时自动展开弹幕列表.',
  },
  options: {
    ignoreMediaList: {
      defaultValue: true,
      displayName: '合集类页面不自动展开',
    },
  },
  urlInclude: [
    ...videoAndBangumiUrls,
    ...mediaListUrls,
  ],
}
