<template>
  <img :width="width" :height="height" :srcset="srcset" :src="actualSrc" :style="{filter: blur ? 'blur(' + blur + 'px)' : undefined}">
</template>

<script>
export default {
  props: ['size', 'src', 'blur', 'root', 'rootMargin', 'threshold'],
  data() {
    return {
      srcset: null,
      actualSrc: null,
    }
  },
  watch: {
    size() {
      this.sourceChange()
    },
    src() {
      this.sourceChange()
    },
  },
  methods: {
    sourceChange() {
      if (this.actualSrc === null || this.srcset === null) {
        return
      }
      this.calcSrc()
    },
    calcSrc() {
      if (!this.src || !this.size) {
        return null
      }
      const extension = this.src.substring(this.src.lastIndexOf('.') + 1)
      this.srcset = getDpiSourceSet(this.src, this.size, extension)
      this.actualSrc = this.src
    },
  },
  mounted() {
    const options = {
      root: this.root,
      rootMargin: this.rootMargin || '200px',
      threshold: this.threshold,
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.calcSrc()
          observer.disconnect()
        }
      })
    }, options)
    observer.observe(this.$el)
  },
  computed: {
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
