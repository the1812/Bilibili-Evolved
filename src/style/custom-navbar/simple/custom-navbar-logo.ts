import { NavbarComponent } from '../custom-navbar-component'
export class Logo extends NavbarComponent {
  constructor() {
    super()
    this.href = `https://www.bilibili.com/`
    this.touch = false
    addSettingsListener('customNavbarSeasonLogo', () => this.getLogo(), true)
  }
  async getLogo() {
    if (settings.customNavbarSeasonLogo) {
      const json = await Ajax.getJson(
        'https://api.bilibili.com/x/web-show/res/locs?pf=0&ids=142'
      )
      if (json.code === 0) {
        this.html = /*html*/`<img height="38" src="${json.data[142][0].litpic.replace('http:', 'https:')}">`
        return
      }
    }
    this.html = /*html*/`<i class="custom-navbar-iconfont custom-navbar-icon-logo"></i>`
  }
  get name(): keyof CustomNavbarOrders {
    return 'logo'
  }
}
export default {
  export: {
    Logo,
  }
}