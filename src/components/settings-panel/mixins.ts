import { getComponentSettings } from '@/core/settings'
import { ComponentMetadata } from '../component'

export const componentSettingsMixin = Vue.extend({
  props: {
    componentData: {
      type: Object as () => ComponentMetadata,
      required: true,
    },
  },
  data() {
    return {
      settings: getComponentSettings(this.componentData),
    }
  },
})
export const virtualScrollMixin = (containerSelector: string) =>
  Vue.extend({
    data() {
      return {
        virtual: false,
      }
    },
    async mounted() {
      const { dq } = await import('@/core/utils')
      const { visibleInside } = await import('@/core/observer')
      const element = this.$el as HTMLElement
      const container = dq(containerSelector) as HTMLElement
      if (!container) {
        console.warn('virtual container not found, virtual scroll will be disabled!')
        return
      }
      visibleInside(element, container, '150% 0px', records => {
        records.forEach(record => {
          this.virtual = !record.isIntersecting
        })
      })
    },
  })
