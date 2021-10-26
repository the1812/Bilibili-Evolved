<template>
  <div class="be-scroll-trigger">
    <slot>
      <VLoading></VLoading>
    </slot>
  </div>
</template>
<script lang="ts">
export default Vue.extend({
  components: {
    VLoading: () => import('./VLoading.vue').then(m => m.default),
  },
  async mounted() {
    const element = this.$el as HTMLElement
    const { visible } = await import('@/core/observer')
    visible(element, records => {
      if (records.some(r => r.intersectionRatio > 0)) {
        this.$emit('trigger')
      }
    })
  },
})
</script>
