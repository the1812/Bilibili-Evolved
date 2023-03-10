import { type Ref, ref, onMounted } from 'vue'
import { CustomNavbarItem } from './custom-navbar-item'

export const popupProps = {
  item: {
    type: CustomNavbarItem,
    required: true,
  },
  container: {
    type: HTMLElement,
    required: true,
  },
}

export const usePopup = (props: {
  item: CustomNavbarItem
  container: HTMLElement
}): {
  el: Ref<HTMLElement | null>
  popupShow: () => void
} => {
  const el = ref<HTMLElement | null>(null)
  onMounted(() => {
    const navBarItem = props.item
    const containerElement = props.container
    if (containerElement) {
      navBarItem?.usePopper(containerElement, el.value.parentElement)
    }
  })
  const popupShow = (): void => {
    const navBarItem = props.item
    navBarItem?.popper?.update().then()
  }
  return { el, popupShow }
}
