<template>
  <div class="be-video-control-bar-extend">
    <div
      v-for="item of items"
      :key="item.name"
      class="bilibili-player-video-btn"
      :style="{ order: item.order.toString() }"
      :data-name="item.name"
      @click="item.action($event)"
    >
      <button>
        <span class="bp-svgicon">
          <VIcon :icon="item.icon" />
        </span>
      </button>
      <div class="be-video-control-tooltip">
        {{ item.displayName }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { VIcon } from '@/ui'

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
})
</script>
<style lang="scss">
@import 'common';

.be-video-control-bar-extend {
  display: flex;
  .bp-svgicon {
    width: auto;
    padding-top: 1px;
    .be-icon {
      transition: transform .2s ease-out;
    }
    .be-icon svg,
    .be-icon {
      $size: 22px;
      font-size: $size;
      width: $size;
      height: $size;
      .bilibili-player.mode-fullscreen &,
      .bilibili-player.mode-webfullscreen & {
        $size: 28px;
        font-size: $size;
        width: $size;
        height: $size;
      }
    }
  }
  .be-video-control-tooltip {
    font-size: 12px;
    padding: 6px 8px;
    line-height: normal;
    color: #fff;
    background-color: #000000b3;
    border-radius: 4px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(calc(-100% - 11px));
    opacity: 0;
  }
  .bilibili-player-video-btn {
    position: relative;
    &:hover .be-video-control-tooltip {
      transition: all .3s ease-in-out .3s;
      opacity: 1;
      transform: translateX(-50%) translateY(calc(-100% - 19px));
    }
    &:active .bp-svgicon .be-icon {
      transform: scale(0.95);
    }
  }
}
</style>
