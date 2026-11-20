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
import { intersectionObserve } from '@/core/observer'

const findScrollParent = (element: HTMLElement) => {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(parent)
    if (/(auto|scroll)/.test(overflowX + overflowY)) {
      return parent
    }
  }
  return null
}

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
    lazy: {
      type: Boolean,
      default: true,
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
      intersectionObserver: null as IntersectionObserver | null,
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
  created() {
    if (!this.lazy) {
      this.calcSrc()
    }
  },
  mounted() {
    if (!this.lazy) {
      return
    }
    const scrollParent = this.intersection.root ? null : findScrollParent(this.$el as HTMLElement)
    const options: IntersectionObserverInit = {
      root: scrollParent,
      rootMargin: scrollParent ? '100%' : '200px',
      ...this.intersection,
    }
    const [observer] = intersectionObserve([this.$el], options, entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.calcSrc()
          observer.disconnect()
        }
      })
    })
    this.intersectionObserver = observer
  },
  beforeDestroy() {
    this.intersectionObserver?.disconnect()
  },
  methods: {
    sourceChange() {
      if (this.lazy && (this.actualSrc === EmptyImageUrl || this.srcset === null)) {
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
