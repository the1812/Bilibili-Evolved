<template>
  <span
    title="稍后再看"
    class="watchlater"
    :class="{ on: isInWatchlater }"
    @click="toggle()"
  >
    <VIcon :size="28" icon="mdi-timetable"></VIcon>稍后再看
    <div class="tip" :class="{ show: tipShowing }">{{ tipText }}</div>
  </span>
</template>

<script lang="ts">
import { store } from '@/core/store'

const { mapState, mapActions } = Vuex
export default Vue.extend({
  components: {
    VIcon: () => import('@/ui/icon/VIcon.vue').then(m => m.default),
  },
  store,
  data() {
    return {
      aid: unsafeWindow.aid,
      tipText: '',
      tipShowing: false,
      tipHandle: 0,
    }
  },
  computed: {
    ...mapState(['watchlaterList']),
    isInWatchlater() {
      return this.watchlaterList.includes(parseInt(this.aid))
    },
  },
  methods: {
    ...mapActions(['toggleWatchlater']),
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
      await this.toggleWatchlater(this.aid)
      this.showTip(
        this.isInWatchlater ? '已添加至稍后再看' : '已从稍后再看移除',
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
