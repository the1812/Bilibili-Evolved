import { NavbarComponent } from '../custom-navbar-component'
export interface IframeConfig {
  src: string
  width: string
  height: string
  lazy: boolean
  iframeName: string
}
export class Iframe extends NavbarComponent {
  iframeName: string
  constructor(name: string, link: string, config: IframeConfig) {
    super()
    const { src, width, height, lazy, iframeName } = config
    this.boundingWidth = parseInt(width)
    this.iframeName = iframeName
    this.html = name
    this.href = link
    this.popupHtml = /*html*/`
      <iframe src='${src}' frameborder='0' width='${width}' height='${height}'></iframe>
    `
    this.noPadding = true
    this.requestedPopup = lazy ? false : true
    this.touch = false
    this.transparent = true
  }
  get name() {
    return (this.iframeName + 'Iframe') as keyof CustomNavbarOrders
  }
}
export default {
  export: {
    Iframe,
  },
}