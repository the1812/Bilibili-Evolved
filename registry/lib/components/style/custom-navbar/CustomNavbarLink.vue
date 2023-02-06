<template>
  <a :target="newTab ? '_blank' : null">
    <slot />
  </a>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    newTab: {
      type: Boolean,
      default: true,
    },
  },
})
</script>
