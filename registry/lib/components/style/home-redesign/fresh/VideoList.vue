<template>
  <div
    class="fresh-home-video-list scroll-top scroll-bottom"
    :class="{ 'not-empty': videos.length > 0 }"
  >
    <div class="fresh-home-video-list-mask left"></div>
    <div ref="content" class="fresh-home-video-list-content">
      <div v-if="videos.length === 0" class="fresh-home-video-list-empty">
        <VLoading v-if="loading" />
        <VEmpty v-else />
      </div>
      <VideoCardWrapper
        v-for="video of videos"
        v-else
        :key="video.id"
        :data="video"
      />
    </div>
    <div class="fresh-home-video-list-mask right"></div>
  </div>
</template>
<script lang="ts">
import { intersectionObserve } from '@/core/observer'
import { VEmpty, VLoading } from '@/ui'
import VideoCardWrapper from './VideoCardWrapper.vue'

export default Vue.extend({
  components: {
    VEmpty,
    VLoading,
    VideoCardWrapper,
  },
  props: {
    videos: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      observer: [],
    }
  },
  watch: {
    videos() {
      this.setupIntersection()
    },
    loading(loading: boolean) {
      if (!loading) {
        this.setupIntersection()
      }
    },
  },
  methods: {
    async setupIntersection() {
      await this.$nextTick()
      const observers = this.observer as IntersectionObserver[]
      if (observers) {
        observers.forEach(o => o.disconnect())
        this.observers = []
      }
      const container = this.$refs.content as HTMLElement
      const videoWrappers = dqa(container, '.fresh-home-video-card-wrapper') as HTMLElement[]
      if (videoWrappers.length === 0) {
        return
      }
      const observerConfig: IntersectionObserverInit = { threshold: [1], root: container }
      const [firstWrapper] = videoWrappers
      const [firstObserver] = intersectionObserve(
        [firstWrapper],
        observerConfig,
        records => records.forEach(r => {
          const isScrollTop = r.isIntersecting && r.intersectionRatio === 1
          this.$el.classList.toggle('scroll-top', isScrollTop)
        }),
      )
      this.observers.push(firstObserver)
      if (videoWrappers.length > 1) {
        const lastWrapper = videoWrappers[videoWrappers.length - 1]
        const [lastObserver] = intersectionObserve(
          [lastWrapper],
          observerConfig,
          records => records.forEach(r => {
            const isScrollBottom = r.isIntersecting && r.intersectionRatio === 1
            this.$el.classList.toggle('scroll-bottom', isScrollBottom)
          }),
        )
        this.observers.push(lastObserver)
      }
    },
    offsetPage(offset: number) {
      const container = this.$refs.content as HTMLElement
      const style = getComputedStyle(container)
      const containerWidth = container.clientWidth
      const wrapperWidth = parseFloat(style.getPropertyValue('--card-width')) + parseFloat(style.getPropertyValue('--card-padding'))
      const pageWidth = Math.trunc(containerWidth / wrapperWidth) * wrapperWidth
      container.scrollBy(offset * pageWidth, 0)
    },
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home-video-list {
  --card-height: var(--home-content-height);
  --card-width: 200px;
  --card-padding: 12px;
  position: relative;
  display: flex;
  flex: 1 0 0;
  width: 0;

  &-content {
    @include h-center();
    @include no-scrollbar();
    flex: 1;
  }
  &-empty {
    margin: var(--card-padding);
    border: 2px dashed #8884;
    border-radius: var(--home-card-radius);
    flex-grow: 1;
    align-self: stretch;
    @include h-center();
  }
  &.not-empty &-content {
    scroll-snap-type: x mandatory;
  }
  &-mask {
    opacity: 0;
  }
  &.not-empty &-mask {
    position: absolute;
    pointer-events: none;
    transition: .1s ease-out;
    width: 36px;
    opacity: 1;
    height: 100%;
    flex-shrink: 0;
    top: 0;
    z-index: 1;
    &.left {
      background: linear-gradient(to right, var(--home-base-color) 40%, rgba(0, 0, 0, 0) 100%);
      left: -2px;
    }
    &.right {
      background: linear-gradient(to left, var(--home-base-color) 40%, rgba(0, 0, 0, 0) 100%);
      right: -2px;
    }
  }
  &.scroll-top .fresh-home-video-list-mask.left {
    // background: linear-gradient(to right, var(--home-base-color) 0%, rgba(0, 0, 0, 0) 100%);
    width: 0;
  }
  &.scroll-bottom .fresh-home-video-list-mask.right {
    // background: linear-gradient(to left, var(--home-base-color) 0%, rgba(0, 0, 0, 0) 100%);
    width: 0;
  }
}
</style>
