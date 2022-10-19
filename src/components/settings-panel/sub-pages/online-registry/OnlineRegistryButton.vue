<template>
  <VButton @mouseover="initPopup()" @click="togglePopup()">
    <slot />
  </VButton>
</template>
<script lang="ts">
import { VButton } from '@/ui'
import { initPopup, togglePopup } from './vm'

export default Vue.extend({
  components: {
    VButton,
  },
  methods: {
    initPopup,
    togglePopup,
  },
})
</script>
