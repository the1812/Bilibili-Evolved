<template>
  <a
    class="be-up-info"
    :class="{ fallback: !upFaceUrl }"
    :href="actualHref"
    :title="upName"
    target="_blank"
  >
    <DpiImage v-if="upFaceUrl" :size="24" class="be-up-info-cover" :src="upFaceUrl" />
    <div v-else class="be-up-info-cover-fallback">
      <slot name="fallback-icon">
        <VIcon icon="up-outline" :size="18" />
      </slot>
    </div>
    <div class="be-up-info-name">
      {{ upName }}
    </div>
  </a>
</template>
<script lang="ts">
import { DpiImage, VIcon } from '@/ui'

export default Vue.extend({
  components: {
    DpiImage,
    VIcon,
  },
  props: {
    href: {
      type: String,
      default: '',
    },
    upId: {
      type: [String, Number],
      default: '',
    },
    upFaceUrl: {
      type: String,
      default: '',
    },
    upName: {
      type: String,
      required: true,
    },
  },
  computed: {
    actualHref() {
      if (this.href) {
        return this.href
      }
      return `https://space.bilibili.com/${this.upId}`
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.be-up-info {
  &:not(.fallback) {
    @include card(14px);
    @include round-bar(28);
    padding: 2px;
    box-shadow: none;
    padding-right: 8px;
  }
  @include h-center(8px);
  font-size: 12px;
  line-height: normal;

  &-cover {
    border-radius: 50%;
  }
  &-cover-fallback {
    @include h-center();
    justify-content: center;
    height: 24px;
    width: 18px;
    margin-right: -3px;
  }
  &-name {
    @include single-line();
    transition: 0.2s ease-out;
  }
  &:hover .be-up-info-name {
    color: var(--theme-color) !important;
  }
}
</style>
