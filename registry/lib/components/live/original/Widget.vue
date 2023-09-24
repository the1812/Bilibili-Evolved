<template>
  <a :href="href" tabindex="-1">
    <DefaultWidget name="返回原版直播间" icon="mdi-arrow-left-circle-outline" />
  </a>
</template>
<script lang="ts">
import { DefaultWidget } from '@/ui'
import { getOriginalLiveroomUrl } from './get-original-liveroom-url'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    return {
      href: getOriginalLiveroomUrl(document.URL),
    }
  },
})
</script>
