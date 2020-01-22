import { NavbarComponent } from '../custom-navbar-component'
export class SimpleLink extends NavbarComponent {
  constructor(name: string, link: string, public linkName: string) {
    super()
    this.html = name
    this.href = link
    this.touch = false
    this.active = document.URL.startsWith(link)
  }
  get name() {
    return (this.linkName + 'Link') as keyof CustomNavbarOrders
  }
}
export default {
  export: {
    SimpleLink,
  },
}