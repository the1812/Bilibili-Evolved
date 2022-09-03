import { ComponentMetadata } from '@/components/types'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { videoChange } from '@/core/observer'
import { select, sq } from '@/core/spin-query'
import { addStyle, removeStyle } from '@/core/style'
import style from './full-description.scss'

const name = 'fullVideoDescription'
const entry = () => {
  addStyle(style, name)
  videoChange(async () => {
    const desc = await select('.video-desc, .video-desc-v1')
    if (!desc) {
      return
    }
    const expandButton = await sq(
      () => dq(desc, '[report-id="abstract_spread"], .toggle-btn') as HTMLElement,
      it => it.style.display !== 'none',
    )
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
