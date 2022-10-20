<template>
  <img
    v-bind="$attrs"
    :width="width"
    :height="height"
    :srcset="srcset"
    :src="actualSrc"
    :class="{ placeholder: isPlaceholderActive }"
  />
</template>
<script lang="ts">
import { getDpiSourceSet } from '@/core/utils'
import { EmptyImageUrl } from '@/core/utils/constants'

export default Vue.extend({
  name: 'DpiImage',
  props: {
    size: {
      type: [Object, Number],
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    intersection: {
      type: Object,
      default: () => ({}),
    },
    placeholderImage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      srcset: null,
      actualSrc: EmptyImageUrl,
      isPlaceholderActive: false,
    }
  },
  computed: {
    width() {
      if (typeof this.size === 'object' && 'width' in this.size) {
        return this.size.width
      }
      if (typeof this.size === 'number') {
        return this.size
      }
      return null
    },
    height() {
      if (typeof this.size === 'object' && 'height' in this.size) {
        return this.size.height
      }
      if (typeof this.size === 'number') {
        return this.size
      }
      return null
    },
  },
  watch: {
    size() {
      this.sourceChange()
    },
    src() {
      this.sourceChange()
    },
  },
  mounted() {
    const options = {
      ...{
        rootMargin: '200px',
      },
      ...this.intersection,
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
  methods: {
    sourceChange() {
      if (this.actualSrc === EmptyImageUrl || this.srcset === null) {
        return
      }
      this.calcSrc()
    },
    calcSrc() {
      const isSourceInvalid = !this.src || !this.size
      this.isPlaceholderActive = isSourceInvalid && this.placeholderImage
      if (isSourceInvalid) {
        this.srcset = null
        if (this.placeholderImage) {
          this.actualSrc =
            'https://s1.hdslb.com/bfs/static/blive/live-web-center/static/img/no-cover.1ebe4d5.jpg'
        } else {
          this.actualSrc = EmptyImageUrl
        }
        return
      }
      let { src } = this
      if (src.startsWith('http:')) {
        src = src.replace('http:', 'https:')
      }
      if (src.includes('//static.hdslb.com/images/member/noface.gif')) {
        // 这张图无法缩放
        this.srcset = src
        this.actualSrc = src
        return
      }
      this.srcset = getDpiSourceSet(src, this.size)
      this.actualSrc = src
    },
  },
})
</script>
