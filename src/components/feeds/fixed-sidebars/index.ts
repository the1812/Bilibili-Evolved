import { ComponentMetadata, componentsTags } from '@/components/component'

const id = 'fixed-sidebars-style'
const entry = async () => {
  const { addStyle } = await import('@/core/style')
  const { default: style } = await import('./fixed-sidebars.scss')
  addStyle(style, id)
  const { disableProfilePopup } = await import('../disable-profile-popup')
  disableProfilePopup()
}
const unload = async () => {
  document.getElementById(id)?.remove()
}

export const component: ComponentMetadata = {
  name: 'fixedSidebars',
  displayName: '强制固定顶栏与侧栏',
  description: {
    'zh-CN': '强制固定动态主页的顶栏和侧栏, 优先级高于动态过滤器的取消固定效果, 可以避免快速下拉产生的抖动.',
  },
  enabledByDefault: false,
  tags: [
    componentsTags.feeds,
  ],
  entry,
  reload: entry,
  unload,
  urlInclude: [
    /^https:\/\/t\.bilibili\.com\/$/,
  ],
}
