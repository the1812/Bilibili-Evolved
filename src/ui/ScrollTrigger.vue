<template>
  <div class="be-scroll-trigger" @click="trigger()">
    <slot>
      <VLoading></VLoading>
    </slot>
  </div>
</template>
<script lang="ts">
import { useScopedConsole } from '@/core/utils/log'
import { delay } from '@/core/utils/'

export default Vue.extend({
  components: {
    VLoading: () => import('./VLoading.vue').then(m => m.default),
  },
  props: {
    detectViewport: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isFirstLoad: true,
      isViewportTriggerRunning: false,
      parentLoadState: 'none',
    }
  },
  async mounted() {
    const console = useScopedConsole('ScrollTrigger')
    const element = this.$el as HTMLElement
    const { visible } = await import('@/core/observer')
    visible(element, async records => {
      if (records.some(r => r.intersectionRatio > 0)) {
        console.log('Intersection Observer trigger')
        this.trigger()

        if (!this.detectViewport && !this.isFirstLoad && this.isViewportTriggerRunning) {
          return
        }

        this.isViewportTriggerRunning = true
        while (this.getVisibleStateByViewport(element)) {
          await delay(500)

          // 需要父组件配合 setLoadState，不然会一直 continue
          // 确认父组件加载状态，等待加载完成后再继续执行，否则会出现多次加载的情况
          if (this.parentLoadState !== 'loaded') {
            continue
          }

          // 再次确认元素可视情况，避免当元素已不可视时仍然触发加载
          if (!this.getVisibleStateByViewport(element)) {
            break
          }

          console.log('is first load & viewport trigger')
          this.trigger()
        }
        this.isFirstLoad = false
      }
    })
  },
  methods: {
    /**
     * 当元素顶部位于视口内部时返回为正数，位于视口外部时返回为负数，正好位于视口底部时返回为零。
     * @param element HTML 元素
     * @returns 元素顶部到视口底部的距离
     */
    getElementToViewportBottomDistance(element: HTMLElement): number {
      return document.documentElement.clientHeight - element.getBoundingClientRect().top
    },

    /**
     * 当元素顶部在视口内部时返回 true。
     * 为避免极端情况，当元素顶部到视口底部的距离大于 -20 时同样返回 true。
     * @param element HTML 元素
     * @returns 元素可视情况
     */
    getVisibleStateByViewport(element: HTMLElement): boolean {
      return Boolean(this.getElementToViewportBottomDistance(element) > -20)
    },

    setLoadState(loadState: 'loading' | 'error' | 'loaded') {
      this.parentLoadState = loadState
    },

    resetIsFirstLoad() {
      this.isFirstLoad = true
    },

    trigger() {
      this.$emit('trigger')
    },
  },
})
</script>
<style lang="scss">
.be-scroll-trigger {
  cursor: pointer;
}
</style>
