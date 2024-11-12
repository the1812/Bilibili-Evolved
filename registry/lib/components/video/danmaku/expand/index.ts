import { ComponentEntry } from '@/components/types'
import { defineComponentMetadata } from '@/components/define'
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { mediaListUrls, videoAndBangumiUrls } from '@/core/utils/urls'

const entry: ComponentEntry = async ({ settings: { options } }) => {
  const console = useScopedConsole('展开弹幕列表')
  const { getDanmakuView } = await import('../converter/danmaku-segment')
  videoChange(async ({ aid, cid }) => {
    if (mediaListUrls.some(url => matchUrlPattern(url)) && options.ignoreMediaList) {
      return
    }
    const view = await getDanmakuView(aid, cid)
    const danmakuCount = view.count
    console.log(`当前弹幕量: ${danmakuCount}`)
    if (danmakuCount !== null && danmakuCount > options.maxDanmakuCount) {
      console.log(`超过了最大弹幕数量 ${options.maxDanmakuCount}, 跳过展开`)
      return
    }
    const danmakuBox = await select('.bui-collapse-wrap')
    if (dq('.multi-page-v1, .base-video-sections-v1, .video-pod') && options.ignoreWithEpisodes) {
      console.log('检测到选集, 跳过展开')
      return
    }
    if (danmakuBox && danmakuBox.classList.contains('bui-collapse-wrap-folded')) {
      const button = (await select('.bui-collapse-header')) as HTMLDivElement
      button?.click()
    }
  })
}

export const component = defineComponentMetadata({
  name: 'expandDanmakuList',
  displayName: '展开弹幕列表',
  entry,
  tags: [componentsTags.video],
  options: {
    ignoreMediaList: {
      defaultValue: true,
      displayName: '合集类页面不自动展开',
    },
    ignoreWithEpisodes: {
      defaultValue: true,
      displayName: '有选集时不自动展开',
    },
    maxDanmakuCount: {
      defaultValue: 500,
      displayName: '最大弹幕数量',
    },
  },
  urlInclude: [...videoAndBangumiUrls, ...mediaListUrls],
})
