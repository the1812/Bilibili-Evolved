<template>
  <div class="be-scroll-trigger" @click="trigger()">
    <slot>
      <VLoading></VLoading>
    </slot>
  </div>
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue'
import { useScopedConsole } from '@/core/utils/log'

export default defineComponent({
  components: {
    VLoading: defineAsyncComponent(() => import('./VLoading.vue')),
  },
  emits: ['trigger'],
  async mounted() {
    const console = useScopedConsole('ScrollTrigger')
    const element = this.$el as HTMLElement
    const { visible } = await import('@/core/observer')
    visible(element, records => {
      if (records.some(r => r.intersectionRatio > 0)) {
        console.log('Intersection Observer trigger')
        this.trigger()
      }
    })
  },
  methods: {
    trigger() {
      this.$emit('trigger')
    },
  },
})
</script>
<style lang="scss">
.be-scroll-trigger {
  cursor: pointer;
}
</style>
