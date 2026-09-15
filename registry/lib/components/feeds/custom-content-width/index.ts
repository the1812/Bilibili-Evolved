import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'
import { feedsUrls } from '@/core/utils/urls'

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

export const component = defineComponentMetadata({
  name: 'customContentWidth',
  displayName: '自定义动态页内容宽度',
  options,
  tags: [componentsTags.style, componentsTags.feeds],
  urlInclude: feedsUrls,
  instantStyles: [
    {
      name: 'customContentWidth',
      style: () => import('./custom-content-width.scss'),
      important: true,
    },
  ],
  entry: ({ metadata }) => {
    addComponentListener(
      `${metadata.name}.customWidth`,
      (value: number) => {
        document.documentElement.style.setProperty('--be-feeds-content-width', `${value}px`)
      },
      true,
    )
  },
})
