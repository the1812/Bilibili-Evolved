import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'

const name = 'customContentWidth'
const displayName = '自定义动态页内容宽度'

const DEFAULT_WIDTH = 1000
/** 动态卡片自身有 `min-width: 556px` */
const MIN_WIDTH = 560
/** `#app` 的 `max-width` 为 2560px, 减去两侧栏与间距 */
const MAX_WIDTH = 1950

const options = defineOptionsMetadata({
  customWidth: {
    displayName: '自定义内容宽度 (px)',
    defaultValue: DEFAULT_WIDTH,
    slider: {
      min: MIN_WIDTH,
      max: MAX_WIDTH,
      step: 10,
    },
    validator: getNumberValidator(MIN_WIDTH, MAX_WIDTH),
  },
})
export type CustomContentWidthOptions = OptionsOfMetadata<typeof options>

const applyWidth = (width: number) => {
  document.documentElement.style.setProperty('--be-feeds-content-width', `${width}px`)
}
const entry = () => addComponentListener(`${name}.customWidth`, applyWidth, true)

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  options,
  tags: [componentsTags.style, componentsTags.feeds],
  urlInclude: [
    // 动态首页与动态详情页
    /^https:\/\/t\.bilibili\.com\//,
    // 图文动态 / 专栏页
    /^https:\/\/www\.bilibili\.com\/opus\/[\d]+$/,
  ],
  instantStyles: [
    {
      name,
      style: () => import('./custom-content-width.scss'),
      important: true,
    },
  ],
  entry,
  reload: entry,
  unload: () => {
    removeComponentListener(`${name}.customWidth`, applyWidth)
    document.documentElement.style.removeProperty('--be-feeds-content-width')
  },
})
