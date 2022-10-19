import { registerAndGetData } from '@/plugins/data'

export const CustomIcons = 'ui.icons'
const context = require.context('./custom', true, /\.svg$/)
export const customIcons: {
  [name: string]: string
} = lodash.fromPairs(
  context.keys().map(key => [key.replace(/.*\/([^/]+?)\.svg$/, '$1'), context(key)]),
)
const [icons] = registerAndGetData(CustomIcons, customIcons)

/**
 * 生成一段 VIcon 的 HTML 字符串, 对于性能敏感的地方会很有用
 *
 * 注意不会自动插入 VIcon 带的样式, 请确保页面中至少有一个 VIcon 的 Vue 实例
 * @param icon 图标名称
 * @param size 图标尺寸
 * @param config 其他设置
 */
export const renderVIcon = (
  icon: string,
  size = 24,
  config?: {
    slot?: string
    style?: string
    className?: string
  },
) => {
  const { slot, style, className } = {
    slot: '',
    style: '',
    className: '',
    ...config,
  }
  const classes = (() => {
    if (icon === '' || icon in icons) {
      return []
    }
    if (icon.startsWith('mdi-')) {
      return ['mdi', icon]
    }
    return [`be-iconfont-${icon}`]
  })().join(' ')
  return /* html */ `
    <i
      class="be-icon ${classes} ${className}"
      style="--size: ${size}px; ${style}"
    >
      ${slot}
      ${
        icon in icons
          ? /* html */ `
        <div class="custom-icon">${icons[icon]}</div>
      `
          : ''
      }
    </i>
  `
}
