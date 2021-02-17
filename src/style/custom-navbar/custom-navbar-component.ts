type PopupAction = (() => void | Promise<void>) | null
// 最大弹窗宽度, 见 NavbarComponent.checkPosition
const MaxBoundingWidth = 380
export class NavbarComponent {
  public noPadding = false
  public transparent = false
  public boundingWidth = 0
  constructor(
    public html = '',
    public popupHtml = '',
    public flex = '0 0 auto',
    public disabled = false,
    public requestedPopup = false,
    public initialPopup: PopupAction = null,
    public onPopup: PopupAction = null,
    public href: string | ((e: MouseEvent) => void) | null = null,
    public notifyCount = 0,
    public touch = settings.touchNavBar,
    public active = false
  ) { }
  get name(): keyof CustomNavbarOrders {
    return 'blank1'
  }
  static cleanUpOrders() {
    if ((settings.customNavbarOrder as any).bangumiLink) {
      settings.customNavbarOrder = _.omit(settings.customNavbarOrder, 'bangumiLink')
    }
    const sortByOrder = _.sortBy(Object.entries(settings.customNavbarOrder), ([, order]) => order)
    console.log(sortByOrder)
    settings.customNavbarOrder = _.fromPairs(sortByOrder.map(([name], index) => [name, index])) as CustomNavbarOrders
  }
  get order() {
    const order = settings.customNavbarOrder[this.name]
    const hasDuplicateOrder =
      Object.values(_.groupBy(Object.values(settings.customNavbarOrder), o => o)).some(group => group.length > 1)
    if (order === undefined || hasDuplicateOrder) {
      NavbarComponent.cleanUpOrders()
      return settings.customNavbarOrder[this.name]
    }
    return order
  }
  get hidden() {
    return settings.customNavbarHidden.includes(this.name)
  }
  get element() {
    return dq(`.custom-navbar li[data-name='${this.name}']`) as HTMLLIElement
  }
  async setNotifyCount(count: number) {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`) as HTMLElement
    if (!notifyElement || count <= 0) {
      notifyElement.innerHTML = ''
      return
    }
    notifyElement.innerHTML = count.toString()
  }
  async setNotifyStyle(style: number) {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`)
    if (!notifyElement) {
      return
    }
    const styleMap = {
      1: 'number',
      2: 'dot',
      3: 'hidden'
    } as { [key: number]: string }
    notifyElement.classList.remove(...Object.values(styleMap))
    notifyElement.classList.add(styleMap[style])
  }
  // 从两侧向中心检测, x到两侧距离大于MaxBoundWidth / 2时, 就可以停止检测了
  checkPosition(skip = false) {
    if (this.boundingWidth === 0 || this.hidden) {
      return true
    }
    const element = this.element
    const popup = element.querySelector('.main-content ~ .popup-container') as HTMLElement
    if (!popup) {
      return true
    }
    popup.style.transform = ''
    if (skip) {
      return true
    }
    const rect = element.getBoundingClientRect()
    const elementX = rect.left + rect.width / 2
    const totalWidth = document.documentElement.clientWidth
    const leftX = elementX - this.boundingWidth / 2
    const rightX = elementX + this.boundingWidth / 2
    if (leftX < 0) {
      popup.style.transform = `translateX(${Math.abs(leftX) + 1}px)`
    } else if (rightX > totalWidth) {
      popup.style.transform = `translateX(${-(rightX - totalWidth) - 1}px)`
    }
    return elementX <= MaxBoundingWidth / 2 || totalWidth - elementX <= MaxBoundingWidth / 2
  }
}
export default {
  export: {
    NavbarComponent,
  },
}