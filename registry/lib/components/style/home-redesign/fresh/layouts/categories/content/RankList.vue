<template>
  <div class="fresh-home-rank-list" :class="{ loading, loaded }">
    <div v-if="!loaded" class="fresh-home-rank-list-loading-container">
      <VLoading v-if="loading" />
      <div v-if="(error || items.length === 0) && !loading" class="fresh-home-rank-list-empty">
        <VEmpty />
        <VButton
          class="fresh-home-rank-list-refresh-button"
          round
          @click="reload"
        >
          <VIcon icon="mdi-refresh" />
          刷新
        </VButton>
      </div>
    </div>
    <template v-if="loaded">
      <div v-if="firstItem" class="fresh-home-rank-list-first-item animation">
        <div class="fresh-home-rank-list-rank-item"></div>
        <a
          class="fresh-home-rank-list-rank-item-title"
          target="_blank"
          :href="videoHref(firstItem)"
          :title="firstItem.title"
        >
          {{ firstItem.title }}
        </a>
        <a
          class="fresh-home-rank-list-cover"
          target="_blank"
          :href="videoHref(firstItem)"
        >
          <DpiImage
            :src="firstItem.coverUrl"
            :size="{ width: ui.firstCoverWidth, height: ui.firstCoverHeight }"
          />
          <UpInfo
            :up-face-url="firstItem.upFaceUrl"
            :up-id="firstItem.upID"
            :up-name="firstItem.upName"
          />
          <div class="fresh-home-rank-list-stats">
            <VIcon icon="mdi-fire" :size="16" />
            {{ firstItem.points | formatCount }}
          </div>
        </a>
        <div class="fresh-home-rank-list-laser" data-number="1"></div>
      </div>
      <div v-if="secondItem" class="fresh-home-rank-list-second-item animation">
        <a
          class="fresh-home-rank-list-rank-item"
          target="_blank"
          :href="videoHref(secondItem)"
        >
          <div
            class="fresh-home-rank-list-rank-item-title"
            :title="secondItem.title"
          >
            {{ secondItem.title }}
          </div>
          <UpInfo
            :up-face-url="secondItem.upFaceUrl"
            :up-id="secondItem.upID"
            :up-name="secondItem.upName"
          />
          <div class="fresh-home-rank-list-stats">
            <VIcon icon="mdi-fire" :size="16" />
            {{ secondItem.points | formatCount }}
            <VIcon icon="play" :size="16" />
            {{ secondItem.playCount | formatCount }}
          </div>
        </a>
        <a
          class="fresh-home-rank-list-cover"
          target="_blank"
          :href="videoHref(secondItem)"
        >
          <DpiImage
            :src="secondItem.coverUrl"
            :size="{ width: ui.secondCoverWidth, height: ui.secondCoverHeight }"
          />
        </a>
        <div class="fresh-home-rank-list-laser" data-number="2"></div>
      </div>
      <div v-if="thirdItem" class="fresh-home-rank-list-third-item animation">
        <a
          class="fresh-home-rank-list-rank-item"
          target="_blank"
          :href="videoHref(thirdItem)"
        >
          <div
            class="fresh-home-rank-list-rank-item-title"
            :title="thirdItem.title"
          >
            {{ thirdItem.title }}
          </div>
          <UpInfo
            :up-face-url="thirdItem.upFaceUrl"
            :up-id="thirdItem.upID"
            :up-name="thirdItem.upName"
          />
          <div class="fresh-home-rank-list-stats">
            <VIcon icon="mdi-fire" :size="16" />
            {{ secondItem.points | formatCount }}
            <VIcon icon="play" :size="16" />
            {{ secondItem.playCount | formatCount }}
          </div>
        </a>
        <a
          class="fresh-home-rank-list-cover"
          target="_blank"
          :href="videoHref(thirdItem)"
        >
          <DpiImage
            :src="thirdItem.coverUrl"
            :size="{ width: ui.thirdCoverWidth, height: ui.thirdCoverHeight }"
          />
        </a>
        <div class="fresh-home-rank-list-laser" data-number="3"></div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import UpInfo from '@/components/feeds/UpInfo.vue'
import { formatCount } from '@/core/utils/formatters'
import {
  DpiImage,
  VIcon,
  VLoading,
  VEmpty,
  VButton,
} from '@/ui'
import { requestMixin, cssVariableMixin } from './mixin'

export default Vue.extend({
  components: {
    DpiImage,
    UpInfo,
    VIcon,
    VLoading,
    VEmpty,
    VButton,
  },
  filters: {
    formatCount,
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
      secondCoverHeight: 110,
      secondCoverWidth: 168,
      thirdCoverHeight: 90,
      thirdCoverWidth: 139,
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
    videoHref(videoCard: VideoCard) {
      return `https://www.bilibili.com/video/${videoCard.bvid}`
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
  overflow: hidden;
  height: var(--panel-height);
  padding: var(--padding);
  margin: calc(0px - var(--padding));

  --offset-second: calc(
    3 * var(--padding) + var(--rank-item-title-height) + var(--first-cover-height) +
      var(--rank-item-margin)
  );
  --offset-third: calc(
    var(--offset-second) + var(--second-cover-height) + var(--padding) + var(--rank-item-margin)
  );
  --animation-timing: cubic-bezier(0.22, 0.61, 0.36, 1);

  & &-stats {
    @include h-center(12px);
    font-size: 12px;
    opacity: .5;
    margin: 0 10px;
    .be-icon {
      margin-right: -8px;
    }
  }
  & &-rank-item {
    @include card(12px);
    @include v-stretch();
    justify-content: space-between;
    padding: 10px 0;
    height: var(--rank-item-height);
    opacity: 0.95;
    z-index: -1;

    &-title {
      @include semi-bold();
      transition: color .2s ease-out;
      line-height: var(--rank-item-title-height);
      box-sizing: content-box;
      &:hover {
        color: var(--theme-color) !important;
      }
    }
    .be-up-info {
      align-self: flex-start;
    }
  }
  & &-first-item {
    @keyframes first-animation {
      0% {
        transform: translateY(54px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @include v-stretch();
    animation: .4s var(--animation-timing) first-animation paused both;
    position: absolute;
    top: var(--padding);
    left: var(--padding);
    height: calc(100% - 2 * var(--padding));
    width: calc(100% - 2 * var(--padding));
    .fresh-home-rank-list-rank-item {
      position: absolute;
      top: 0;
      width: 100%;
      &-title {
        @include single-line();
        padding: var(--padding) 14px;
      }
    }
    .be-up-info,
    .fresh-home-rank-list-stats {
      position: absolute;
      background-color: #0008;
      color: white;
      border-radius: 8px;
    }
    .be-up-info {
      bottom: 6px;
      left: 6px;
      padding: 3px 6px;
      .be-up-info-cover-fallback {
        height: 18px;
        margin-left: 0;
      }
    }
    .fresh-home-rank-list-stats {
      opacity: 1;
      margin: 0;
      padding: 4px 6px;
      bottom: 6px;
      right: 6px;
    }
  }
  & &-second-item {
    @keyframes second-animation {
      0% {
        transform: translateY(28px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @include v-stretch();
    animation: .4s var(--animation-timing) second-animation paused both;
    position: absolute;
    top: var(--offset-second);
    bottom: var(--padding);

    .fresh-home-rank-list-rank-item {
      position: absolute;
      width: 230px;
      top: var(--padding);
      left: 146px;
      padding-left: 22px;
      &-title {
        @include max-line(2);
        margin-bottom: auto;
        padding: 0 12px;
      }
      .be-up-info {
        margin: 4px 8px;
      }
    }
  }
  & &-third-item {
    @keyframes third-animation {
      0% {
        transform: translateY(14px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @include v-stretch();
    animation: .4s var(--animation-timing) third-animation paused both;
    position: absolute;
    top: var(--offset-third);
    right: var(--padding);
    bottom: var(--padding);
    .fresh-home-rank-list-rank-item {
      position: absolute;
      width: 254px;
      top: var(--padding);
      right: 121px;
      padding-right: 18px;
      &-title {
        @include max-line(2);
        margin-bottom: auto;
        padding: 0 12px;
      }
      .be-up-info {
        margin: 4px 8px;
      }
    }
  }
  & &-cover {
    @include card(12px);
    cursor: pointer;
    display: flex;
    align-self: center;
    box-shadow: none;
    overflow: hidden;
    transform-origin: bottom;
    transition: .2s ease-out;
    position: relative;

    img {
      transition: 0.2s ease-out;
    }
    &:hover img {
      transform: scale(1.05);
    }
    &:hover {
      transform: scale(1.025);
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
  & &-loading-container {
    @include v-center();
    justify-content: center;
    padding: var(--padding);
    border-radius: var(--home-card-radius);
    border: 2px dashed #8884;
    height: 100%;
  }
  & &-empty {
    @include v-center(12px);
    justify-content: center;
    .be-button {
      padding: 4px 10px 4px 6px !important;
      &:hover .be-icon {
        transform: rotate(1turn);
      }
    }
    .be-icon {
      margin-right: 6px;
      transition: .5s ease-out;
    }
  }

  &.loaded {
    @include no-scrollbar();
    .animation {
      animation-play-state: running;
    }
  }
}
</style>
