<template>
  <div class="be-video-control-bar-extend squirtle-block-wrap">
    <div
      v-for="item of items"
      :key="item.name"
      class="be-video-control-bar-extend-item bilibili-player-video-btn squirtle-block-wrap bpx-player-ctrl-btn"
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
  .squirtle-controller-wrap & {
    margin-top: 1px;
  }
  &,
  .squirtle-controller.squirtle-wide-screen &.squirtle-block-wrap {
    width: auto !important;
    margin-top: 0px;
  }
  .bp-svgicon {
    width: auto;
    padding-top: 1px;
    .be-icon {
      transition: transform 0.2s ease-out;
    }
    .be-icon svg,
    .be-icon {
      $size: 22px;
      font-size: $size;
      width: $size;
      height: $size;
      color: #fff;
      fill: #fff;
      @include on-fullscreen {
        $size: 28px;
        font-size: $size;
        width: $size;
        height: $size;
      }
    }
  }
  .be-video-control-tooltip {
    pointer-events: none;
    font-size: 12px;
    padding: 6px 8px;
    line-height: normal;
    white-space: nowrap;
    color: #fff;
    background-color: #000000b3;
    border-radius: 4px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(calc(-100% - 11px));
    opacity: 0;
  }
  &-item {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    .squirtle-controller-wrap & {
      align-items: center;
    }
    &:hover .be-video-control-tooltip {
      transition: all 0.3s ease-in-out 0.3s;
      opacity: 1;
      transform: translateX(-50%) translateY(calc(-100% - 19px));
    }
    &:active .bp-svgicon .be-icon {
      transform: scale(0.95);
    }
    button {
      background-color: transparent;
      margin: 0;
      padding: 0;
      border: none;
      cursor: pointer;
      &:hover,
      &:active {
        outline: none !important;
      }
    }
  }
}
.bpx-player-control-wrap {
  @include on-fullscreen {
    & .be-video-control-bar-extend-item button {
      padding-top: 2px;
    }
  }
}
</style>
