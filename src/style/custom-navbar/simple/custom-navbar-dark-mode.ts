import { NavbarComponent } from '../custom-navbar-component'
export class DarkMode extends NavbarComponent {
  constructor() {
    super()
    this.touch = false
    this.href = 'javascript:(bilibiliEvolved.settings.useDarkStyle = !bilibiliEvolved.settings.useDarkStyle)'
    addSettingsListener('useDarkStyle', value => {
      if (value) {
        this.html = /*html*/`<i style="font-size: 20px; line-height: 1;" class="mdi mdi-weather-sunny"></i>`
      } else {
        this.html = /*html*/`<i style="font-size: 18px; line-height: 1; margin: 0 1px;" class="mdi mdi-weather-night"></i>`
      }
    }, true)
  }
  get name(): keyof CustomNavbarOrders {
    return 'darkMode'
  }
}
export default {
  export: {
    DarkMode,
  }
}