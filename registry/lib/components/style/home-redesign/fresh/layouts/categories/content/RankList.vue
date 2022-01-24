<template>
  <div class="fresh-home-rank-list">
    <div v-if="firstItem" class="fresh-home-rank-list-first-item">
      <div class="fresh-home-rank-list-rank-item"></div>
      <div class="fresh-home-rank-list-rank-item-title">
        {{ firstItem.title }}
      </div>
      <div class="fresh-home-rank-list-cover">
        <DpiImage
          :src="firstItem.coverUrl"
          :size="{ width: 350, height: 225 }"
        />
      </div>
      <div class="fresh-home-rank-list-laser" data-number="1"></div>
    </div>
    <div v-if="secondItem" class="fresh-home-rank-list-second-item">
      <div class="fresh-home-rank-list-rank-item">
        <div class="fresh-home-rank-list-rank-item-title">
          {{ secondItem.title }}
        </div>
      </div>
      <div class="fresh-home-rank-list-cover">
        <DpiImage
          :src="secondItem.coverUrl"
          :size="{ width: 168, height: 110 }"
        />
      </div>
      <div class="fresh-home-rank-list-laser" data-number="2"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import { DpiImage } from '@/ui'
import { requestMixin, cssVariableMixin } from './mixin'

export default Vue.extend({
  components: {
    DpiImage,
  },
  mixins: [
    requestMixin,
    cssVariableMixin({
      panelHeight: 608,
      padding: 12,
      rankItemHeight: 110,
      rankItemMargin: 24,
      rankItemTitleHeight: 20,
      firstCoverHeight: 225,
      firstCoverWidth: 350,
    }),
  ],
  computed: {
    firstItem() {
      return this.items[0]
    },
    secondItem() {
      return this.items[1]
    },
    thirdItem() {
      return this.items[2]
    },
    firstRow() {
      return this.items.slice(3, 6)
    },
    secondRow() {
      return this.items.slice(6, 10)
    },
  },
  methods: {
    parseJson(json: any) {
      const items = (lodash.get(json, 'data', []) || []) as any[]
      return items
        .map(
          (item): VideoCard => ({
            id: item.aid,
            aid: parseInt(item.aid),
            bvid: item.bvid,
            title: item.title,
            playCount: item.play,
            favorites: item.favorites,
            upID: item.mid,
            upName: item.author,
            description: item.description,
            coverUrl: item.pic,
            coins: item.coins,
            durationText: item.duration,
            points: item.pts,
          }),
        )
        .slice(0, 10)
    },
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home-rank-list {
  position: relative;
  flex: 1;
  width: 400px;
  height: var(--panel-height);
  padding: var(--padding);
  margin: calc(0px - var(--padding));

  & &-first-item {
    @include v-stretch();
    transform: translateZ(0);
    position: absolute;
    top: var(--padding);
    left: var(--padding);
    height: calc(100% - 2 * var(--padding));
    width: calc(100% - 2 * var(--padding));
  }
  & &-rank-item {
    @include card(12px);
    position: absolute;
    z-index: -1;
    top: 0;
    width: 100%;
    height: var(--rank-item-height);
    opacity: 0.95;
  }
  & &-second-item {
    position: absolute;
    top: calc(
      2 * var(--padding) + var(--rankItemTitleHeight) + var(--firstCoverHeight) +
        var(--rankItemMargin)
    );
  }
  & &-rank-item-title {
    @include semi-bold();
    @include single-line();
    line-height: var(--rank-item-title-height);
    padding: 12px 14px;
  }
  & &-cover {
    @include card(12px);
    display: flex;
    align-self: center;
    box-shadow: none;
    overflow: hidden;
    &:hover img {
      transition: 0.2s ease-out;
      transform: scale(1.05);
    }
  }
  & &-laser {
    position: relative;
    align-self: center;
    flex: 1;
    width: 4px;
    border-radius: 2px;
    background-image: linear-gradient(
      to bottom,
      var(--theme-color) 0%,
      var(--theme-color-10) 100%
    );
    &::after {
      content: attr(data-number);
      @include absolute-center();
      @include h-center();
      justify-content: center;
      top: 0;
      font-weight: bold;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: var(--theme-color);
      color: var(--foreground-color);
    }
  }
}
</style>
