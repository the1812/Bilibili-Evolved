type PopupAction = (() => void) | null
export class NavbarComponent {
  public noPadding = false
  public transparent = false
  constructor(
    public html = '',
    public popupHtml = '',
    public flex = '0 0 auto',
    public disabled = false,
    public requestedPopup = false,
    public initialPopup: PopupAction = null,
    public onPopup: PopupAction = null,
    public href: string | null = null,
    public notifyCount = 0,
    public touch = settings.touchNavBar,
    public active = false
  ) { }
  get name(): keyof CustomNavbarOrders {
    return 'blank1'
  }
  get order() {
    return settings.customNavbarOrder[this.name]
  }
  get hidden() {
    return settings.customNavbarHidden.includes(this.name)
  }
  async setNotifyCount(count: number) {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`) as HTMLElement
    if (!notifyElement || !count) {
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
}
export default {
  export: {
    NavbarComponent,
  },
}