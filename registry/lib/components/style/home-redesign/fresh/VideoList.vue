<template>
  <div
    class="fresh-home-video-list scroll-top scroll-bottom"
    :class="{ 'not-empty': videos.length > 0 }"
  >
    <div ref="content" class="fresh-home-video-list-content">
      <div v-if="videos.length === 0" class="fresh-home-video-list-empty">
        <VLoading v-if="loading" />
        <VEmpty v-else />
      </div>
      <VideoCardWrapper v-for="video of videos" v-else ref="cards" :key="video.id" :data="video" />
    </div>
  </div>
</template>
<script lang="ts">
import { VEmpty, VLoading } from '@/ui'
import { enableHorizontalScroll } from '@/core/horizontal-scroll'
import { addComponentListener } from '@/core/settings'
import VideoCardWrapper from './VideoCardWrapper.vue'
import { setupScrollMask, cleanUpScrollMask } from './scroll-mask'

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
  watch: {
    videos() {
      this.setupIntersection()
    },
    loaded() {
      if (this.loaded) {
        this.setupIntersection()
      }
    },
  },
  beforeDestroy() {
    cleanUpScrollMask(this.$el)
  },
  mounted() {
    const container = this.$refs.content as HTMLElement
    let cancel: () => void
    addComponentListener(
      'freshHome.horizontalWheelScroll',
      (scroll: boolean) => {
        if (scroll) {
          cancel = enableHorizontalScroll(container)
        } else {
          cancel?.()
        }
      },
      true,
    )
  },
  methods: {
    async setupIntersection() {
      await this.$nextTick()
      setupScrollMask({
        container: this.$el,
        items: this.$refs.cards.map((c: Vue) => c.$el),
      })
    },
    offsetPage(offset: number) {
      const container = this.$refs.content as HTMLElement
      const style = getComputedStyle(container)
      const containerWidth = container.clientWidth
      const wrapperWidth =
        parseFloat(style.getPropertyValue('--card-width')) +
        parseFloat(style.getPropertyValue('--card-padding'))
      const pageWidth = Math.trunc(containerWidth / wrapperWidth) * wrapperWidth
      container.scrollBy(offset * pageWidth, 0)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';

.fresh-home-video-list {
  --card-height: var(--home-content-height);
  --card-width: 200px;
  --card-padding: 12px;
  position: relative;
  display: flex;
  flex: 1 0 0;
  width: 0;
  @include scroll-mask-x(36px, var(--home-base-color));

  &-content {
    @include h-center();
    @include no-scrollbar();
    overscroll-behavior: initial;
    flex: 1;
    min-height: calc(var(--home-content-height) + var(--card-padding) * 2);
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
}
</style>
