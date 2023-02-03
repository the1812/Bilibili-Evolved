<template>
  <a v-bind="$attrs" :target="newTab ? '_blank' : null" v-on="$listeners">
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
