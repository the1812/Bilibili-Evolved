import { ComponentMetadata } from '@/components/types'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { videoChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { addStyle, removeStyle } from '@/core/style'
import style from './full-description.scss'

const name = 'fullVideoDescription'
const entry = () => {
  addStyle(style, name)
  videoChange(async () => {
    const desc = await select('.video-desc')
    if (!desc) {
      return
    }
    const expandButton = await select('.video-desc .btn[report-id="abstract_spread"], .video-desc .toggle-btn') as HTMLElement
    expandButton?.click()
  })
}
export const component: ComponentMetadata = {
  name,
  entry,
  reload: entry,
  unload: () => {
    removeStyle(name)
  },
  displayName: '展开视频简介',
  tags: [
    componentsTags.video,
    componentsTags.style,
  ],
  description: {
    'zh-CN': '总是展开完整的视频简介.',
  },
  urlInclude: videoAndBangumiUrls,
}
