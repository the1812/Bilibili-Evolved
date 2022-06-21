<template>
  <div class="default-tab" data-name="trending">{{ title }}</div>
</template>
<script lang="ts">
import { minimalHomeOptions } from '../options'
import { MinimalHomeTabOption } from '../types'

export default Vue.extend({
  computed: {
    title() {
      return minimalHomeOptions.personalized ? '推荐' : '热门'
    },
  },
  methods: {
    onTabChange() {
      this.$emit('tab-change', MinimalHomeTabOption.Trending)
    },
  },
})
</script>
