import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import type { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'
import { addStyle, removeStyle } from '@/core/style'
import { videoAndBangumiUrls } from '@/core/utils/urls'

type Options = OptionsOfMetadata<typeof options>

const options = defineOptionsMetadata({
  hideRightSide: {
    displayName: '隐藏右侧推荐',
    defaultValue: true,
  },
  hideEndPage: {
    displayName: '隐藏片尾推荐',
    defaultValue: true,
  },
})

const rightSideSelectors = [
  '#recom_module',
  '#reco_list',
  '.r-con .rcmd-list',
  '.playlist-container .recommend-list-container',
  '.plp-r [class*="recommend_wrap"]',
  '.video-container-v1 .recommend-list-v1',
].join(',\n')

const endPageSelectors = [
  '.bpx-player-ending-related',
  '.bilibili-player-ending-panel-box-videos',
].join(',\n')

const rightSideStyle = `${rightSideSelectors} {
  display: none !important;
}`

const endPageStyle = `${endPageSelectors} {
  display: none !important;
}
.bilibili-player-ending-panel-box-functions .bilibili-player-upinfo-spans {
  position: static !important;
}
.bilibili-player-ending-panel-box,
.bpx-player-ending-content {
  display: flex !important;
  justify-content: center !important;
  flex-direction: column !important;
}`

const styleNames = {
  hideRightSide: 'hideRelatedVideos-rightSide',
  hideEndPage: 'hideRelatedVideos-endPage',
}

let lastOptions: Options | null = null

const syncStyles = () => {
  if (!lastOptions) {
    return
  }
  const update = (optionName: keyof Options, style: string, name: string) => {
    if (lastOptions && lastOptions[optionName]) {
      addStyle(style, name)
    } else {
      removeStyle(name)
    }
  }
  update('hideRightSide', rightSideStyle, styleNames.hideRightSide)
  update('hideEndPage', endPageStyle, styleNames.hideEndPage)
}

const entry: ComponentEntry<Options> = ({ metadata, settings }) => {
  lastOptions = settings.options
  syncStyles()
  ;(['hideRightSide', 'hideEndPage'] as const).forEach(optionName => {
    addComponentListener(`${metadata.name}.${optionName}`, () => syncStyles())
  })
}

export const component = defineComponentMetadata({
  name: 'hideRelatedVideos',
  displayName: '隐藏视频推荐',
  entry,
  options,
  tags: [componentsTags.style, componentsTags.video],
  urlInclude: videoAndBangumiUrls,
  reload: () => syncStyles(),
  unload: () => {
    removeStyle(styleNames.hideRightSide, styleNames.hideEndPage)
    lastOptions = null
  },
})
