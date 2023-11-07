<template>
  <VButton @mouseover="initPopup()" @click="togglePopup()">
    <slot />
  </VButton>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { VButton } from '@/ui'

import { initPopup, togglePopup } from './vm'

export default defineComponent({
  components: {
    VButton,
  },
  methods: {
    initPopup,
    togglePopup,
  },
})
</script>
