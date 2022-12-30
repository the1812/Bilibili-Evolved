<template>
  <div class="fresh-home-video-slides">
    <div v-if="loaded" class="fresh-home-video-slides-covers">
      <a
        v-for="(video, index) of items"
        :key="video.id"
        :title="video.title"
        class="fresh-home-video-slides-cover"
        :href="index !== 1 ? 'javascript:void(0)' : url(video.bvid)"
        target="_blank"
        @click.capture="index !== 1 ? jumpToCard($event, index) : () => {}"
      >
        <DpiImage
          :src="video.coverUrl"
          :size="{ width: ui.mainCoverWidth, height: ui.mainCoverHeight }"
        />
      </a>
    </div>
    <div class="cover-placeholder-vertical"></div>
    <div v-if="!loaded" class="fresh-home-video-slides-empty">
      <div class="empty-placeholder fresh-home-video-slides-main-title" v-text="' '"></div>
      <div class="empty-indicator">
        <VLoading v-if="loading" />
        <div v-if="error" class="empty-indicator-error">
          <VEmpty />
          <VButton class="fresh-home-video-slides-refresh-button" round @click="reload">
            <VIcon icon="mdi-refresh" />
            刷新
          </VButton>
        </div>
      </div>
    </div>
    <div v-if="currentItem && loaded" class="fresh-home-video-slides-row">
      <div class="fresh-home-video-slides-main-info">
        <div class="fresh-home-video-slides-row">
          <div class="cover-placeholder-horizontal"></div>
          <div class="fresh-home-video-slides-main-actions">
            <a class="fresh-home-video-slides-play-button" :href="currentUrl" target="_blank">
              <VButton type="primary" round>
                <VIcon icon="mdi-play" />
                播放
              </VButton>
            </a>
            <VButton
              v-if="watchlaterAdded"
              class="fresh-home-video-slides-watchlater-button"
              icon
              title="取消稍后再看"
              @click="toggleWatchlater(currentItem.aid)"
            >
              <VIcon icon="mdi-clock-check-outline" :size="20" />
            </VButton>
            <VButton
              v-else
              class="fresh-home-video-slides-watchlater-button"
              icon
              title="稍后再看"
              @click="toggleWatchlater(currentItem.aid)"
            >
              <VIcon icon="mdi-clock-outline" :size="20" />
            </VButton>
            <a
              class="fresh-home-video-slides-up-container"
              :href="`https://space.bilibili.com/${currentItem.upID}`"
              :title="currentItem.upName"
              target="_blank"
            >
              <DpiImage :size="24" :src="currentItem.upFaceUrl" />
              <div class="fresh-home-video-slides-up-name">
                {{ currentItem.upName }}
              </div>
            </a>
          </div>
        </div>
        <a
          class="fresh-home-video-slides-main-title"
          :title="currentItem.title"
          :href="currentUrl"
          target="_blank"
        >
          {{ currentItem.title }}
        </a>
      </div>
      <div class="fresh-home-video-slides-main-description">
        <div class="description-text" v-text="currentItem.description"></div>
      </div>
      <div class="fresh-home-video-slides-actions">
        <VButton class="fresh-home-video-slides-refresh-button" title="刷新" icon @click="reload">
          <VIcon icon="mdi-refresh" />
        </VButton>
        <VButton
          class="fresh-home-video-slides-previous-button"
          title="上一个"
          icon
          @click="previousCard"
        >
          <VIcon icon="mdi-arrow-left" />
        </VButton>
        <VButton class="fresh-home-video-slides-next-button" title="下一个" icon @click="nextCard">
          <VIcon icon="mdi-arrow-right" :size="36" />
        </VButton>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { applyContentFilter } from '@/components/feeds/api'
import { VideoCard } from '@/components/feeds/video-card'
import { getWatchlaterList, toggleWatchlater, watchlaterList } from '@/components/video/watchlater'
import { formatDuration } from '@/core/utils/formatters'
import { DpiImage, VButton, VIcon, VLoading, VEmpty } from '@/ui'
import { cssVariableMixin, requestMixin } from '../../../../mixin'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    DpiImage,
    VLoading,
    VEmpty,
  },
  mixins: [
    requestMixin(),
    cssVariableMixin({
      mainCoverHeight: 185,
      mainCoverWidth: 287,
      otherCoverHeight: 100,
      otherCoverWidth: 154,
      mainPaddingX: 18,
      mainPaddingY: 20,
      coverPadding: 16,
    }),
  ],
  data() {
    return {
      watchlaterList,
      itemLimit: 10,
    }
  },
  computed: {
    currentItem() {
      return this.items[1]
    },
    currentUrl() {
      return this.url(this.currentItem.bvid)
    },
    watchlaterAdded() {
      return this.watchlaterList.includes(this.currentItem.aid)
    },
  },
  created() {
    getWatchlaterList()
  },
  methods: {
    parseJson(json: any) {
      const items = lodash.get(json, 'data.archives', [])
      const cards = items.map(
        (item: any): VideoCard => ({
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
          dynamic: item.desc === '-' ? '' : item.desc,
          type: item.tname,
          duration: item.duration,
          durationText: formatDuration(item.duration),
        }),
      )
      return applyContentFilter(cards)
    },
    url(id: string) {
      return `https://www.bilibili.com/video/${id}`
    },
    toggleWatchlater,
    nextCard() {
      this.items.push(this.items.shift())
    },
    previousCard() {
      this.items.unshift(this.items.pop())
    },
    jumpToCard(event: MouseEvent, index: number) {
      if (index <= 1 || index >= this.items.length) {
        return
      }
      let steps = index - 1
      const jump = () => {
        this.nextCard()
        steps--
        if (steps > 0) {
          setTimeout(jump)
        }
      }
      jump()
      event.preventDefault()
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';

.fresh-home-video-slides {
  @include card(12px);
  @include v-stretch(var(--cover-padding));
  --main-info-padding: calc(
    var(--main-padding-y) + var(--main-cover-height) - var(--other-cover-height) -
      var(--cover-padding)
  );
  position: relative;
  overflow: hidden;
  padding: var(--main-padding-y) var(--main-padding-x);
  height: 266px;

  .cover-placeholder-vertical {
    height: var(--other-cover-height);
    width: 0;
  }
  .cover-placeholder-horizontal {
    width: var(--main-cover-width);
    height: 0;
  }
  .be-button .be-icon {
    transition: 0.2s ease-out;
  }
  a {
    display: block;
    transition: color 0.2s ease-out;
    &:hover {
      color: var(--theme-color) !important;
    }
  }

  & &-empty {
    padding-top: var(--main-info-padding);
    @include h-center();
    justify-content: center;
    .empty-placeholder {
      visibility: hidden;
      white-space: pre;
    }
    .empty-indicator {
      @include absolute-center();
      &-error {
        @include v-center(12px);
        .be-button {
          padding: 4px 10px 4px 6px !important;
          .be-icon {
            margin-right: 6px;
          }
        }
      }
    }
  }
  & &-row {
    @include h-stretch(var(--cover-padding));
  }
  & &-play-button {
    flex: 1;
    font-size: 16px;
    filter: drop-shadow(0 4px 12px var(--theme-color-10));
    .be-icon {
      margin-right: 6px;
    }
  }
  & &-refresh-button {
    .be-icon {
      transition-duration: 0.5s;
    }
    &:hover .be-icon {
      transform: rotate(1turn);
    }
  }
  & &-previous-button {
    &:hover .be-icon {
      @include bounce-x(-2);
    }
    &:active .be-icon {
      transform: scale(0.9);
    }
  }
  & &-next-button {
    padding: 6px !important;
    &:hover .be-icon {
      @include bounce-x(2);
    }
    &:active .be-icon {
      transform: scale(0.9);
    }
  }
  & &-watchlater-button {
    padding: 6px !important;
  }
  & &-up-container {
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
  & &-up-name {
    @include single-line();
    font-size: 12px;
  }
  & &-main-info {
    @include v-stretch();
    justify-content: space-between;
    position: relative;
    padding-top: var(--main-info-padding);
    width: calc(var(--main-cover-width) + var(--cover-padding) + var(--other-cover-width));
  }
  & &-main-title {
    font-size: 16px;
    @include single-line();
    @include semi-bold();
  }
  & &-main-actions {
    @include h-center(8px);
    width: var(--other-cover-width);
    flex-wrap: wrap;
    position: absolute;
    right: 0;
    top: 0;
  }
  & &-main-description {
    @include v-stretch();
    @include no-scrollbar();
    font-size: 13px;
    line-height: 1.5;
    opacity: 0.75;
    flex: 1;
    padding: 2px;
    .description-text {
      height: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
  & &-actions {
    @include h-stretch(8px);
    align-items: flex-end;
    .be-button .content-container {
      opacity: 0.8;
    }
  }
  & &-covers {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
  & &-cover {
    @include card(12px);
    position: absolute;
    box-shadow: none;
    overflow: hidden;
    top: var(--main-padding-y);
    left: var(--main-padding-x);
    width: var(--other-cover-width);
    height: var(--other-cover-height);
    transition: 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    img {
      transition: 0.2s ease-out;
      width: 100%;
      height: 100%;
    }
    &:hover img {
      transform: scale(1.05);
    }
    &:nth-child(1) {
      opacity: 0;
      transform: translateX(calc(0px - var(--other-cover-width) - var(--cover-padding)));
    }
    &:nth-child(2) {
      width: var(--main-cover-width);
      height: var(--main-cover-height);
    }
    @for $i from 3 through 10 {
      &:nth-child(#{$i}) {
        transform: translateX(
          calc(
            var(--main-cover-width) +
              var(--cover-padding) +
              #{$i -
              3} *
              (var(--other-cover-width) + var(--cover-padding))
          )
        );
      }
    }
  }
}
</style>
