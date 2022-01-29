<template>
  <a
    class="be-up-info"
    :class="{ fallback: !upFaceUrl }"
    :href="`https://space.bilibili.com/${upID}`"
    :title="upName"
    target="_blank"
  >
    <DpiImage
      v-if="upFaceUrl"
      :size="24"
      class="be-up-info-cover"
      :src="upFaceUrl"
    />
    <div v-else class="be-up-info-cover-fallback">
      <VIcon
        icon="up-outline"
        :size="18"
      />
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
    upID: {
      type: [String, Number],
      required: true,
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
})
</script>
<style lang="scss">
@import "common";

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
    margin: 0 -3px 0 3px;
  }
  &-name {
    @include single-line();
    transition: .2s ease-out;
  }
  &:hover .be-up-info-name {
    color: var(--theme-color) !important;
  }
}
</style>
