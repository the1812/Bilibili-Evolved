import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { createComponentWithProps } from '@/core/utils'
import { defaultWidth } from './width'

const name = 'customContentWidth'
const displayName = '自定义动态页内容宽度'

const options = defineOptionsMetadata({
  showWidget: {
    displayName: '显示小组件（刷新后生效）',
    defaultValue: true,
  },
  width: {
    displayName: '内容宽度',
    defaultValue: defaultWidth,
    hidden: true,
  },
})

const widthControl = (isPopup: boolean) =>
  import('./WidthControl.vue').then(m =>
    createComponentWithProps(m.default, { componentName: name, isPopup }),
  )

/** `px` 与 `vw` 都能直接作为 CSS 变量值生效, 无需按视口重算 */
const applyWidth = (width: string) =>
  document.documentElement.style.setProperty('--be-feeds-content-width', width)

const entry = () => addComponentListener(`${name}.width`, applyWidth, true)

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  options,
  extraOptions: () => widthControl(false),
  widget: {
    component: () => widthControl(true),
    condition: () => Boolean(getComponentSettings(name).options.showWidget),
  },
  entry,
  reload: entry,
  unload: () => {
    removeComponentListener(`${name}.width`, applyWidth)
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
