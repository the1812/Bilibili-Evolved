import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { getComponentSettings } from '@/core/settings'

import type { ComponentMetadata } from '../component'

export const componentSettingsMixin = defineComponent({
  props: {
    componentData: {
      type: Object as PropType<ComponentMetadata>,
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
  defineComponent({
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
