<template>
  <div class="bvid-convert">
    <template v-if="aid && bvid">
      <div class="bvid-convert-item">
        av{{ aid }}
      </div>
      <div class="bvid-convert-item">
        {{ bvid }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  data() {
    return {
      aid: '',
      bvid: '',
    }
  },
  async mounted() {
    const { dq } = await import('@/core/utils')
    const bvid = (() => {
      if (unsafeWindow.bvid) {
        return unsafeWindow.bvid
      }
      const link = dq('.av-link,.bv-link,.bvid-link') as HTMLElement
      return link.innerHTML || '未找到BV号'
    })()
    this.aid = unsafeWindow.aid
    this.bvid = bvid
  },
})
</script>

<style lang="scss">
@import "common";
.bvid-convert {
  flex-direction: column;
  border-radius: 4px;
  padding: 6px 8px;
  width: 100%;
  user-select: text;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px #8884;
  @include default-background-color();
  &-item {
    font-size: 14px;
  }
}
</style>
