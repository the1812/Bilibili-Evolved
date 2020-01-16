<template>
  <div class="bangumi-timeline">
    bangumi timeline
  </div>
</template>

<script lang="ts">
export default {
  props: {
    type: {
      type: String,
      default: 'global',
      required: false
    }
  },
  data() {
    const apiMapping: { [key: string]: string | undefined } = {
      global: 'https://bangumi.bilibili.com/web_api/timeline_global',
      chinese: 'https://bangumi.bilibili.com/web_api/timeline_cn'
    }
    return {
      apiUrl: apiMapping[this.type] || apiMapping.global
    }
  }
}
</script>

<style lang="scss">
.simple-home .bangumi-timeline {
  display: grid;
}
</style>