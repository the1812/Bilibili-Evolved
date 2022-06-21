<template>
  <div class="default-tab" data-name="feeds" @click="onTabChange">动态</div>
</template>
<script lang="ts">
import { MinimalHomeTabOption } from '../types'

export default Vue.extend({
  methods: {
    onTabChange() {
      this.$emit('tab-change', MinimalHomeTabOption.Feeds)
    },
  },
})
</script>
