import {
  OptionsOfMetadata,
  defineComponentMetadata,
  defineOptionsMetadata,
} from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { sq } from '@/core/spin-query'
import { getNumberValidator } from '@/core/utils'
import { liveUrls } from '@/core/utils/urls'

const name = 'liveChatPanelFit'
// const ratioRegex = /^(\d+):(\d+)$/
const minWidth = 190

const options = defineOptionsMetadata({
  // targetRatio: {
  //   defaultValue: '16:9',
  //   displayName: '视频区域宽高比',
  //   validator: (value: string, oldValue: string) => {
  //     if (ratioRegex.test(value)) {
  //       return value
  //     }
  //     return oldValue
  //   },
  // },
  maxWidth: {
    defaultValue: 1000,
    displayName: '侧边栏最大宽度 (px)',
    validator: getNumberValidator(minWidth),
  },
})
const calcPanelWidth = () => {
  const { maxWidth } = getComponentSettings<OptionsOfMetadata<typeof options>>(name).options
  // const match = targetRatio.match(ratioRegex)
  // if (!match) {
  //   return
  // }
  // const widthRatio = parseInt(match[1])
  // const heightRatio = parseInt(match[2])
  const video = dq('.live-player-ctnr video') as HTMLVideoElement
  if (!video) {
    return
  }
  const widthRatio = video.videoWidth
  const heightRatio = video.videoHeight
  if (widthRatio === 0 || heightRatio === 0) {
    return
  }
  const { innerWidth, innerHeight } = window
  const liveChatPanelWidth = innerWidth - (widthRatio * innerHeight) / heightRatio
  console.log({ liveChatPanelWidth })
  document.documentElement.style.setProperty(
    '--live-chat-panel-width',
    `${lodash.clamp(liveChatPanelWidth, minWidth, maxWidth)}px`,
  )
}
const debounceCalcPanelWidth = lodash.debounce(calcPanelWidth, 200)
const load = async () => {
  addComponentListener(`${name}.targetRatio`, calcPanelWidth)
  addComponentListener(`${name}.maxWidth`, calcPanelWidth)
  window.addEventListener('resize', debounceCalcPanelWidth)
  const video = await sq(
    () => dq('.live-player-ctnr video') as HTMLVideoElement,
    v => v !== null && v.readyState !== HTMLMediaElement.HAVE_NOTHING,
  )
  if (!video) {
    return
  }
  calcPanelWidth()
}
const unload = () => {
  removeComponentListener(`${name}.targetRatio`, calcPanelWidth)
  removeComponentListener(`${name}.maxWidth`, calcPanelWidth)
  window.removeEventListener('resize', debounceCalcPanelWidth)
  document.documentElement.style.removeProperty('--live-chat-panel-width')
}

export const component = defineComponentMetadata({
  name,
  displayName: '直播间网页全屏自适应',
  tags: [componentsTags.live, componentsTags.style],
  urlInclude: [...liveUrls],
  entry: load,
  reload: load,
  unload,
  instantStyles: [
    {
      name,
      style: () => import('./chat-panel-fit.scss'),
    },
  ],
  options,
})
