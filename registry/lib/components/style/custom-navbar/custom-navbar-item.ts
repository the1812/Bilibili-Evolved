import type { Instance as Popper } from '@popperjs/core'
import { createPopper } from '@popperjs/core'

import type { Component, ComponentPublicInstance } from 'vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'

import type { CustomNavbarOptions } from '.'
import { getUID } from '@/core/utils'

export interface PopupContentInstance extends ComponentPublicInstance {
  popupRefresh?(): void
  popupShow(): void
}

export interface PopupContent {
  new (): PopupContentInstance
}

export const CustomNavbarItems = 'customNavbar.items'
export const CustomNavbarRenderedItems = 'customNavbar.renderedItems'
/**
 * 表示自定义顶栏元素的基本信息
 */
export interface CustomNavbarItemInit {
  /** 名称 */
  name: string
  /** 显示名称 */
  displayName: string
  /** 内容。被创建时传入属性：item: CustomNavbarItem */
  content: Component | string

  /** 设定CSS flex样式 (grow, shrink, basis) */
  flexStyle?: string
  /** 禁用状态下不响应点击, 也不显示弹窗 */
  disabled?: boolean
  /** 点击打开的链接 */
  href?: string
  /** 表示此元素是否代表当前页面, 会增加显示一个底部的边框, 并加粗文本 */
  active?: boolean
  /** `content`指定的内容mount之后要执行的代码 */
  contentMounted?: (item: CustomNavbarItem) => Promise<void> | void
  /** 点击运行的代码段 */
  clickAction?: (event: MouseEvent) => void
  /** 获取或设置提示数字, 将显示在顶部 */
  notifyCount?: number
  /** 是否在触屏状态下不响应点击 */
  touch?: boolean
  /** 是否仅在登录后显示 */
  loginRequired?: boolean

  /** 弹窗内容。创建其实例时传入参数有：container: HTMLElement, item: CustomNavbarItem */
  popupContent?: PopupContent | undefined
  /** 设为大于0的值时, 表示预计的弹窗宽度, 将会用于边缘检测, 防止超出viewport */
  boundingWidth?: number
  /** 不使用默认的弹窗padding */
  noPopupPadding?: boolean
  /** 是否使用透明的弹窗背景 */
  transparentPopup?: boolean
  /** 是否懒加载弹窗  */
  lazy?: boolean
}
/** 表示自定义顶栏元素 */
export class CustomNavbarItem implements Required<CustomNavbarItemInit> {
  name: string
  displayName: string
  content: Component | string

  flexStyle = '0 0 auto'
  disabled = false
  href: string = null
  active = false
  clickAction: (event: MouseEvent) => void = none
  contentMounted: (item: CustomNavbarItem) => Promise<void> | void = none
  notifyCount = 0
  touch = false
  loginRequired = false

  popupContent: PopupContent | undefined
  popper: Popper = null
  boundingWidth = 0
  noPopupPadding = false
  transparentPopup = false
  lazy = true

  hidden = false
  order = 0
  requestedPopup: boolean

  static navbarOptions = getComponentSettings('customNavbar').options as CustomNavbarOptions
  constructor(init: CustomNavbarItemInit) {
    Object.assign(this, init)
    if (!this.name) {
      throw new Error('Missing CustomNavbarItem name')
    }
    if (this.content === undefined) {
      throw new Error('Missing CustomNavbarItem content')
    }

    addComponentListener(
      'customNavbar.touch',
      (value: boolean) => {
        this.touch = value ? init.touch : false
      },
      true,
    )
    this.hidden =
      CustomNavbarItem.navbarOptions.hidden.includes(this.name) || (!getUID() && init.loginRequired)
    const orderMap = CustomNavbarItem.navbarOptions.order
    this.order = orderMap[this.name] || 0
    this.requestedPopup = !this.lazy
  }

  get element() {
    return dq(`.custom-navbar-item[data-name='${this.name}']`) as HTMLElement
  }
  toString() {
    return this.name
  }
  usePopper(container: HTMLElement, popup: HTMLElement) {
    this.popper = createPopper(container, popup, { placement: 'bottom' })
  }
}
