import { addComponentListener } from '@/core/settings'

export enum NavbarLinkPopupContentAlignStyle {
  Left = '左侧对齐',
  Center = '居中对齐',
  Right = '右侧对齐',
}

export const setupLinkPopupContentAlignStyle = () => {
  const map = {
    [NavbarLinkPopupContentAlignStyle.Left]: 'left',
    [NavbarLinkPopupContentAlignStyle.Center]: 'center',
    [NavbarLinkPopupContentAlignStyle.Right]: 'right',
  }
  addComponentListener(
    'customNavbar.linkPopupContentAlignStyle',
    (value: NavbarLinkPopupContentAlignStyle) => {
      document.documentElement.setAttribute(
        'data-navbar-link-popup-content-align-style',
        map[value],
      )
    },
    true,
  )
}
