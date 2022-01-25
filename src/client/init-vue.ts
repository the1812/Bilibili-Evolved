import { default as VueLibrary } from 'vue'
import { Plugin as VueFragmentPlugin } from 'vue-fragment'

export const initVue = () => {
  window.Vue = VueLibrary
  Vue.config.devtools = false
  Vue.config.productionTip = false
  Vue.directive('hit', {
    inserted(el, { value }) {
      if (value && typeof value === 'function') {
        const wrapper = (e: KeyboardEvent | MouseEvent) => {
          if (value.length > 0) {
            value(e)
          } else {
            value()
          }
        }
        el.addEventListener('click', value)
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            wrapper(e)
          }
        })
      }
    },
  })
  Vue.use(VueFragmentPlugin)
}
