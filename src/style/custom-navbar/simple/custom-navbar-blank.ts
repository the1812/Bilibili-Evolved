import { NavbarComponent } from '../custom-navbar-component'
export class Blank extends NavbarComponent {
  constructor(public number: number) {
    super()
    this.flex = '1 0 auto'
    this.disabled = true
  }
  get name() {
    return ('blank' + this.number) as keyof CustomNavbarOrders
  }
}
export default {
  export: {
    Blank
  }
}