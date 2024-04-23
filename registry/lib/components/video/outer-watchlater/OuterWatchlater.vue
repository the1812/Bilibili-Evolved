<template>
  <span
    title="稍后再看"
    class="watchlater be-outer-watchlater video-toolbar-left-item"
    :class="{ on, ...displayModeClass }"
    @click="toggle()"
  >
    <VIcon class="icon" :size="28" icon="mdi-timetable"></VIcon>
    <span class="text">稍后再看</span>
    <div class="tip" :class="{ show: tipShowing }">{{ tipText }}</div>
  </span>
</template>

<script lang="ts">
import { VIcon } from '@/ui'
import { watchlaterList, toggleWatchlater } from '@/components/video/watchlater'
import { DisplayMode, Options } from './options'
import { addComponentListener, getComponentSettings } from '@/core/settings'

export default Vue.extend({
  components: {
    VIcon,
  },
  data() {
    const { displayMode } = getComponentSettings<Options>('outerWatchlater').options
    return {
      watchlaterList,
      displayMode,
      aid: unsafeWindow.aid,
      tipText: '',
      tipShowing: false,
      tipHandle: 0,
    }
  },
  computed: {
    on() {
      console.log(this.watchlaterList, this.aid, this.watchlaterList.includes(parseInt(this.aid)))
      return this.watchlaterList.includes(parseInt(this.aid))
    },
    displayModeClass() {
      return {
        'icon-only': this.displayMode === DisplayMode.Icon,
        'icon-and-text': this.displayMode === DisplayMode.IconAndText,
      }
    },
  },
  created() {
    addComponentListener('outerWatchlater.displayMode', (value: DisplayMode) => {
      this.displayMode = value
    })
  },
  methods: {
    showTip(text: string) {
      this.tipText = text
      this.tipShowing = true
      if (this.tipHandle) {
        clearTimeout(this.tipHandle)
      }
      this.tipHandle = setTimeout(() => {
        this.tipShowing = false
      }, 2000)
    },
    async toggle() {
      await toggleWatchlater(this.aid)
      this.showTip(this.on ? '已添加至稍后再看' : '已从稍后再看移除')
    },
  },
})
</script>

<style lang="scss">
.video-toolbar-left,
.video-toolbar .ops,
.video-toolbar-v1 .toolbar-left {
  .watchlater {
    font-size: 14px;
    margin-right: 28px !important;
    position: relative;
    width: auto !important;

    @mixin icon-only {
      margin-right: max(calc(min(11vw, 11vh) - 117.2px), 6px) !important;
      .text {
        display: none;
      }
    }
    &.icon-only {
      @include icon-only();
    }
    &:not(.icon-and-text) {
      @media screen and (max-width: 1340px), (max-height: 750px) {
        @include icon-only();
      }
    }

    .tip {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: #000d;
      padding: 4px 8px;
      border-radius: 4px;
      color: #eee;
      transition: all 0.2s ease-out;
      opacity: 0;
      pointer-events: none;
      &.show {
        opacity: 1;
        pointer-events: initial;
      }
    }
    .be-icon {
      display: inline-flex;
      @media (min-width: 1681px) {
        --size: 36px !important;
      }
    }
  }
}
.video-toolbar-left .watchlater .be-icon {
  transform: translateY(1px);
  margin-right: 8px;
}
.video-toolbar-v1 .watchlater .be-icon {
  transform: translateY(1px);
}
.more-ops-list > ul,
.van-popover .more_dropdown {
  > li:nth-child(2) {
    display: none !important;
  }
}
.video-tool-more-dropdown .video-watchlater.dropdown-item {
  display: none !important;
}
</style>
