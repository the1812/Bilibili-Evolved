<template>
  <div class="fresh-home-video-card-wrapper">
    <VideoCard v-bind="attrs" orientation="vertical" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import VideoCard from '@/components/feeds/VideoCard.vue'

export default defineComponent({
  components: {
    VideoCard,
  },
  inheritAttrs: false,
  computed: {
    attrs(): any {
      return this.$attrs
    },
  },
})
</script>
<style lang="scss">
.fresh-home-video-card-wrapper {
  --padding: var(--card-padding, 12px);
  padding: var(--padding) 0;
  padding-left: var(--padding);
  scroll-snap-align: start;
  &:last-child {
    padding-right: var(--padding);
  }
  .video-card {
    border-radius: var(--home-card-radius) !important;
    .cover-container {
      border-radius: calc(var(--home-card-radius) - 1px) calc(var(--home-card-radius) - 1px) 0 0 !important;
    }
    &,
    & * {
      transition: 0.2s ease-out;
    }
  }
}
</style>
