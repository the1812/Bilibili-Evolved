<template>
  <img :width="width" :height="height" :srcset="srcset" :src="src" :style="{filter: blur ? 'blur(' + blur + 'px)' : undefined}">
</template>

<script>
export default {
  props: ['size', 'src', 'blur'],
  computed: {
    srcset () {
      if (!this.src || !this.size) {
        return null
      }
      return getDpiSourceSet(this.src, this.size)
    },
    width () {
      if (typeof this.size === 'object' && 'width' in this.size) {
        return this.size.width
      }
      return null
    },
    height () {
      if (typeof this.size === 'object' && 'height' in this.size) {
        return this.size.height
      }
      return null
    }
  },
}
</script>
