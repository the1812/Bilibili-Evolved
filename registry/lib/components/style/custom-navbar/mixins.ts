import { defineComponent } from 'vue'
import { CustomNavbarItem } from './custom-navbar-item'

export const popperMixin = defineComponent({
  props: {
    item: {
      type: CustomNavbarItem,
      required: true,
    },
    container: {
      type: HTMLElement,
      required: true,
    },
  },
  mounted() {
    const navBarItem = this.item as CustomNavbarItem
    const containerElement = this.container as HTMLElement
    if (containerElement) {
      navBarItem?.usePopper(containerElement, this.$el.parentElement)
    }
  },
  methods: {
    popupShow() {
      const navBarItem = this.item as CustomNavbarItem
      navBarItem?.popper?.update()
    },
  },
})
