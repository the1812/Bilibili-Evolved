<template>
  <span
    title="稍后再看"
    class="watchlater"
    :class="{ on }"
    @click="toggle()"
  >
    <VIcon :size="28" icon="mdi-timetable"></VIcon>
    <span class="text">稍后再看</span>
    <div class="tip" :class="{ show: tipShowing }">{{ tipText }}</div>
  </span>
</template>

<script lang="ts">
import { VIcon } from '@/ui'
import { watchlaterList, toggleWatchlater } from '@/core/watchlater'

export default Vue.extend({
  components: {
    VIcon,
  },
  data() {
    return {
      watchlaterList,
      aid: unsafeWindow.aid,
      tipText: '',
      tipShowing: false,
      tipHandle: 0,
      on: false,
    }
  },
  created() {
    this.on = this.isInWatchlater()
  },
  methods: {
    isInWatchlater() {
      return this.watchlaterList.includes(parseInt(this.aid))
    },
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
      this.on = this.isInWatchlater()
      this.showTip(
        this.on ? '已添加至稍后再看' : '已从稍后再看移除',
      )
    },
  },
})
</script>

<style lang="scss">
.video-toolbar .ops {
  .watchlater {
    margin-right: 28px !important;
    position: relative;
    width: auto !important;
    @media screen and (max-width: 1320px), (max-height: 750px) {
      margin-right: max(calc(min(11vw, 11vh) - 117.2px),6px) !important;
      .text {
        display: none;
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
    }
  }
}
.more-ops-list > ul > li:nth-child(2) {
  display: none !important;
}
</style>
