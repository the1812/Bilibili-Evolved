import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import { urlInclude, urlExclude } from './urls'
import { entry } from './entry'
import { getNumberValidator } from '@/core/utils'
import { NavbarNotifyStyle } from './notify-style'
import { NavbarLinkPopupContentAlignStyle } from './link-popup-content-align-style'

const styleID = 'custom-navbar-style'
const options = defineOptionsMetadata({
  hidden: {
    hidden: true,
    defaultValue: [
      'blank1',
      'blank4',
      'drawing',
      'music',
      'gamesIframe',
      'bangumi',
      'match',
      'creations',
    ],
    displayName: '隐藏的元素',
  },
  order: {
    hidden: true,
    defaultValue: {},
    displayName: '元素顺序',
  },
  padding: {
    hidden: true,
    defaultValue: 10,
    displayName: '边缘间距(%)',
  },
  globalFixed: {
    defaultValue: false,
    displayName: '全局固定',
  },
  fill: {
    defaultValue: false,
    displayName: '主题色填充',
  },
  transparent: {
    defaultValue: true,
    displayName: '透明填充',
  },
  blur: {
    defaultValue: false,
    displayName: '背景模糊',
  },
  shadow: {
    defaultValue: true,
    displayName: '投影',
  },
  seasonLogo: {
    defaultValue: false,
    displayName: '使用季节Logo',
  },
  touch: {
    defaultValue: false,
    displayName: '触摸模式',
  },
  openInNewTab: {
    defaultValue: true,
    displayName: '新标签页打开',
  },
  refreshOnPopup: {
    defaultValue: true,
    displayName: '自动刷新数据',
  },
  height: {
    defaultValue: 50,
    validator: getNumberValidator(50, 64),
    displayName: '顶栏高度 (px)',
  },
  openInNewTabOverrides: {
    defaultValue: { logo: false },
    displayName: '新标签页打开设置覆盖',
    hidden: true,
  },
  showDeadVideos: {
    defaultValue: false,
    displayName: '显示已失效视频',
    hidden: true,
  },
  notifyStyle: {
    defaultValue: NavbarNotifyStyle.Number,
    dropdownEnum: NavbarNotifyStyle,
    displayName: '消息提醒样式',
  },
  linkPopupContentAlignStyle: {
    defaultValue: NavbarLinkPopupContentAlignStyle.Left,
    dropdownEnum: NavbarLinkPopupContentAlignStyle,
    displayName: '链接对齐样式',
  },
  searchBarWidth: {
    defaultValue: 15,
    slider: {
      min: 8,
      max: 64,
    },
    displayName: '搜索栏宽度 (%)',
  },
})
export const component = defineComponentMetadata({
  name: 'customNavbar',
  displayName: '自定义顶栏',
  entry,
  tags: [componentsTags.style, componentsTags.general],
  options,
  urlInclude,
  urlExclude,
  instantStyles: [
    {
      name: styleID,
      style: () => import('./hide-original.scss'),
      important: true,
    },
  ],
  unload: async () => {
    const navbar = document.querySelectorAll('.custom-navbar,.custom-navbar-settings')
    navbar.forEach((it: HTMLElement) => (it.style.display = 'none'))
    // document.getElementById(styleID)?.remove()
  },
  reload: async () => {
    const navbar = document.querySelectorAll('.custom-navbar,.custom-navbar-settings')
    navbar.forEach((it: HTMLElement) => (it.style.display = 'flex'))
    // const { default: style } = await import('./hide-original.scss')
    // const { addImportantStyle } = await import('@/core/style')
    // addImportantStyle(style, styleID)
  },
  widget: {
    component: () => import('./settings/Widget.vue').then(m => m.default),
  },
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
  plugin: {
    displayName: '自定义顶栏 - 功能扩展',
    setup: ({ addData }) => {
      addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
        providers.push({
          name: 'navbarSettings',
          getActions: async () => [
            {
              name: '自定义顶栏设置',
              description: 'Custom Navbar Settings',
              icon: 'mdi-sort',
              action: async () => {
                const { toggleNavbarSettings } = await import('./settings/vm')
                toggleNavbarSettings()
              },
            },
          ],
        })
      })
    },
  },
})
export type CustomNavbarOptions = OptionsOfMetadata<typeof options>
