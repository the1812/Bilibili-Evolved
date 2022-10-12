<template>
  <a :href="href" tabindex="-1">
    <DefaultWidget name="返回原版直播间" icon="mdi-arrow-left-circle-outline" />
  </a>
</template>
<script lang="ts">
import { DefaultWidget } from '@/ui'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  data() {
    const match = document.URL.match(/^https:\/\/live\.bilibili\.com\/([\d]+)/)
    if (!match) {
      return {
        href: document.URL,
      }
    }
    return {
      href: `https://live.bilibili.com/blanc/${match[1]}`,
    }
  },
})
</script>
