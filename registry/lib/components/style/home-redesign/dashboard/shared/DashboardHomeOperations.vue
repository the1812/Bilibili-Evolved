<template>
  <div class="dashboard-home-operations">
    <VButton
      round
      icon
      class="dashboard-home-operations-refresh"
      title="刷新"
      @click="
        backToTop()
        $emit('refresh')
      "
    >
      <VIcon icon="mdi-refresh" :size="size" />
    </VButton>
    <VButton round icon class="dashboard-home-operations-top" title="返回顶部" @click="backToTop">
      <VIcon icon="mdi-arrow-up" :size="size" />
    </VButton>
  </div>
</template>
<script lang="ts">
import { VButton, VIcon } from '@/ui'

export default Vue.extend({
  components: { VButton, VIcon },
  data() {
    return {
      size: 28,
    }
  },
  methods: {
    backToTop() {
      window.scrollTo(0, 0)
    },
  },
})
</script>
