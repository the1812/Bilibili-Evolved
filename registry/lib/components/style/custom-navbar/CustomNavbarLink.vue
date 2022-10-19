<template>
  <a v-bind="$attrs" :target="newTab ? '_blank' : null" v-on="$listeners">
    <slot />
  </a>
</template>
<script lang="ts">
export default Vue.extend({
  props: {
    newTab: {
      type: Boolean,
      default: true,
    },
  },
})
</script>
