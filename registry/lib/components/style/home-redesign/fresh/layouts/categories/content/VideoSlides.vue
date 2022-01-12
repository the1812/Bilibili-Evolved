<template>
  <div class="fresh-home-video-slides">
    <div class="cover-placeholder-vertical"></div>
    <div v-if="currentItem" class="fresh-home-video-slides-row">
      <div class="fresh-home-video-slides-main-info">
        <div class="fresh-home-video-slides-row">
          <div class="cover-placeholder-horizontal"></div>
          <div class="fresh-home-video-slides-main-actions">
            <VButton class="fresh-home-video-slides-play-button" type="primary" round>
              <VIcon icon="mdi-play" />
              播放
            </VButton>
            <VButton class="fresh-home-video-slides-watchlater-button" icon title="稍后再看">
              <VIcon icon="mdi-clock-outline" :size="20" />
            </VButton>
            <div class="fresh-home-video-slides-up-container">
              <DpiImage :size="24" :src="currentItem.upFaceUrl" />
              <div class="fresh-home-video-slides-up-name">
                {{ currentItem.upName }}
              </div>
            </div>
          </div>
        </div>
        <div class="fresh-home-video-slides-main-title">
          {{ currentItem.title }}
        </div>
      </div>
      <div class="fresh-home-video-slides-main-description">
        <div class="description-text" v-text="currentItem.description"></div>
      </div>
      <div class="fresh-home-video-slides-actions">
        <VButton class="fresh-home-video-slides-refresh-button" icon>
          <VIcon icon="mdi-refresh" />
        </VButton>
        <VButton class="fresh-home-video-slides-previous-button" icon>
          <VIcon icon="mdi-arrow-left" />
        </VButton>
        <VButton class="fresh-home-video-slides-next-button" icon>
          <VIcon icon="mdi-arrow-right" :size="36" />
        </VButton>
      </div>
    </div>
    <div class="fresh-home-video-slides-covers">
      <div
        v-for="video of items"
        :key="video.id"
        :title="video.title"
        class="fresh-home-video-slides-cover"
      >
        <DpiImage
          :src="video.coverUrl"
          :size="{ width: ui.mainCoverWidth, height: ui.mainCoverHeight }"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { VideoCard } from '@/components/feeds/video-card'
import { formatDuration } from '@/core/utils/formatters'
import { DpiImage, VButton, VIcon } from '@/ui'
import { requestMixin } from './request'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    DpiImage,
  },
  mixins: [requestMixin],
  data() {
    return {
      itemLimit: 10,
      ui: {
        mainCoverHeight: 185,
        mainCoverWidth: 287,
        otherCoverHeight: 100,
        otherCoverWidth: 154,
        mainPaddingX: 18,
        mainPaddingY: 20,
        coverPadding: 16,
      },
    }
  },
  computed: {
    currentItem() {
      return this.items[1]
    },
  },
  mounted() {
    const element = this.$el as HTMLElement
    Object.entries(this.ui as Record<string, number>).forEach(([name, value]) => {
      element.style.setProperty(`--${lodash.kebabCase(name)}`, `${value}px`)
    })
  },
  methods: {
    parseJson(json: any) {
      const items = lodash.get(json, 'data.archives', [])
      return items.map((item: any): VideoCard => ({
        id: item.aid,
        aid: item.aid,
        bvid: item.bvid,
        coverUrl: item.pic,
        title: item.title,
        upName: item.owner.name,
        upFaceUrl: item.owner.face,
        upID: item.owner.mid,
        playCount: item.stat.view,
        danmakuCount: item.stat.danmaku,
        like: item.stat.like,
        coins: item.stat.coin,
        description: item.desc,
        type: item.tname,
        duration: item.duration,
        durationText: formatDuration(item.duration),
      }))
    },
  },
})
</script>
<style lang="scss">
@import "common";

.fresh-home-video-slides {
  @include card(12px);
  @include v-stretch(var(--cover-padding));
  position: relative;
  overflow: hidden;
  padding: var(--main-padding-y) var(--main-padding-x);
  .cover-placeholder-vertical {
    height: var(--other-cover-height);
    width: 0;
  }
  .cover-placeholder-horizontal {
    width: var(--main-cover-width);
    height: 0;
  }

  &-row {
    @include h-stretch(var(--cover-padding));
  }
  &-play-button {
    flex: 1;
    font-size: 16px;
    filter: drop-shadow(0 4px 12px var(--theme-color-10));
    .be-icon {
      margin-right: 6px;
    }
  }
  &-next-button,
  &-watchlater-button {
    padding: 6px !important;
  }
  &-up-container {
    @include h-center(8px);
    @include card(14px);
    @include round-bar(28);
    max-width: var(--other-cover-width);
    box-shadow: none;
    padding: 2px;
    padding-right: 8px;
    img {
      border-radius: 50%;
    }
  }
  &-up-name {
    @include single-line();
    font-size: 12px;
    &:hover {
      color: var(--theme-color);
    }
  }
  &-main-info {
    @include v-stretch(var(--main-padding-y));
    justify-content: space-between;
    max-width: calc(var(--main-cover-width) + var(--cover-padding) + var(--other-cover-width));
  }
  &-main-title {
    font-size: 16px;
    @include single-line();
    @include semi-bold();
  }
  &-main-actions {
    @include h-center(8px);
    width: var(--other-cover-width);
    flex-wrap: wrap;
  }
  &-main-description {
    @include v-stretch();
    @include no-scrollbar();
    font-size: 13px;
    line-height: 1.5;
    opacity: .75;
    flex: 1;
    padding: 2px;
    .description-text {
      height: 0;
      white-space: pre-wrap;
    }
  }
  &-actions {
    @include h-stretch(8px);
    align-items: flex-end;
    .be-button .content-container {
      opacity: .8;
    }
  }
  &-covers {
    position: absolute;
    top: 0;
    left: 0;
  }
  &-cover {
    @include card(12px);
    position: absolute;
    box-shadow: none;
    overflow: hidden;
    top: var(--main-padding-y);
    left: var(--main-padding-x);
    width: var(--other-cover-width);
    height: var(--other-cover-height);
    img {
      width: 100%;
      height: 100%;
    }
    &:nth-child(1) {
      opacity: 0;
      transform: translateX(- var(--other-cover-width) - var(--cover-padding));
    }
    &:nth-child(2) {
      width: var(--main-cover-width);
      height: var(--main-cover-height);
    }
    @for $i from 3 through 10 {
      &:nth-child(#{$i}) {
        transform: translateX(calc(
          var(--main-cover-width) + var(--cover-padding) +
          #{$i - 3} * (var(--other-cover-width) + var(--cover-padding))
        ));
      }
    }
  }
}
</style>
