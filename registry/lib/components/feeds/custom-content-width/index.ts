import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { getNumberValidator, createComponentWithProps } from '@/core/utils'
import { RadioItem } from '@/ui'

const name = 'customContentWidth'
const displayName = '自定义动态页内容宽度'

const DEFAULT_WIDTH = 1000
/** 动态卡片自身有 `min-width: 556px` */
const MIN_WIDTH = 560
/** `#app` 的 `max-width` 为 2560px, 减去两侧栏与间距 */
const MAX_WIDTH = 1950
/** 影响宽度的选项, 任一变化都需要重新计算 */
const WIDTH_OPTIONS = ['pixel', 'customWidth', 'percentage', 'customPercentage']

const items: Record<string, RadioItem> = {
  pixel: { name: 'pixel', isOption: true, optionsIncluded: ['customWidth'] },
  percentage: { name: 'percentage', isOption: true, optionsIncluded: ['customPercentage'] },
}

const options = defineOptionsMetadata({
  showWidget: {
    displayName: '显示小组件（刷新后生效）',
    defaultValue: false,
  },
  pixel: {
    displayName: '像素',
    defaultValue: true,
    hidden: true,
  },
  customWidth: {
    displayName: '(px)',
    defaultValue: DEFAULT_WIDTH,
    slider: {
      min: MIN_WIDTH,
      max: MAX_WIDTH,
      step: 10,
    },
    validator: getNumberValidator(MIN_WIDTH, MAX_WIDTH),
    hidden: true,
  },
  percentage: {
    displayName: '百分比',
    defaultValue: false,
    hidden: true,
  },
  customPercentage: {
    displayName: '(%)',
    defaultValue: 50,
    slider: {
      min: 1,
      max: 100,
      step: 1,
    },
    validator: getNumberValidator(1, 100),
    hidden: true,
  },
})
export type CustomContentWidthOptions = OptionsOfMetadata<typeof options>
const componentOptions = () => getComponentSettings<CustomContentWidthOptions>(name).options

const optionsWidget = (isPopup: boolean) =>
  import('@/ui').then(m =>
    createComponentWithProps(m.OptionRadioGroup, {
      title: '动态页内容宽度',
      groupName: `${name}-options`,
      items,
      componentName: name,
      icon: 'mdi-arrow-expand-horizontal',
      isPopup,
      hasContainer: isPopup,
    }),
  )

const applyWidth = () => {
  const { pixel, customWidth, customPercentage } = componentOptions()
  const width = pixel
    ? customWidth
    : (customPercentage / 100) * document.documentElement.clientWidth
  const clampedWidth = lodash.clamp(width, MIN_WIDTH, MAX_WIDTH)
  document.documentElement.style.setProperty('--be-feeds-content-width', `${clampedWidth}px`)
}
const entry = () => {
  WIDTH_OPTIONS.forEach(optionName =>
    addComponentListener(`${name}.${optionName}`, applyWidth, true),
  )
  window.addEventListener('resize', applyWidth)
}

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  options,
  extraOptions: () => optionsWidget(false),
  widget: {
    component: () => optionsWidget(true),
    condition: () => Boolean(componentOptions().showWidget),
  },
  entry,
  reload: entry,
  unload: () => {
    WIDTH_OPTIONS.forEach(optionName =>
      removeComponentListener(`${name}.${optionName}`, applyWidth),
    )
    window.removeEventListener('resize', applyWidth)
    document.documentElement.style.removeProperty('--be-feeds-content-width')
  },
  instantStyles: [
    {
      name,
      style: () => import('./custom-content-width.scss'),
      important: true,
    },
  ],
  tags: [componentsTags.style, componentsTags.feeds],
  urlInclude: [
    // 动态首页与动态详情页
    /^https:\/\/t\.bilibili\.com\//,
    // 图文动态 / 专栏页
    /^https:\/\/www\.bilibili\.com\/opus\/[\d]+$/,
  ],
})
