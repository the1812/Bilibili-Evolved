<template>
  <div class="fresh-home-video-slides">
    <div v-if="loaded" class="fresh-home-video-slides-covers" :class="coverDirection">
      <a
        v-for="(video, index) of items"
        :key="video.id"
        :title="video.title"
        class="fresh-home-video-slides-cover"
        :href="index !== 1 ? 'javascript:void(0)' : video.videoHref"
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
          <VEmpty>{{ error }}</VEmpty>
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
                <span class="fresh-home-video-slides-play-text">播放</span>
              </VButton>
            </a>
            <VButton
              v-if="currentItem.aid && watchlaterAdded"
              class="fresh-home-video-slides-watchlater-button"
              icon
              title="取消稍后再看"
              @click="toggleWatchlater(currentItem.aid)"
            >
              <VIcon icon="mdi-clock-check-outline" :size="20" />
            </VButton>
            <VButton
              v-else-if="currentItem.aid"
              class="fresh-home-video-slides-watchlater-button"
              icon
              title="稍后再看"
              @click="toggleWatchlater(currentItem.aid)"
            >
              <VIcon icon="mdi-clock-outline" :size="20" />
            </VButton>
            <UpInfo
              v-if="currentItem.upID"
              class="fresh-home-video-slides-up-container"
              :up-face-url="currentItem.upFaceUrl"
              :up-id="currentItem.upID"
              :up-name="currentItem.upName"
            />
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
        <div class="fresh-home-video-slides-stats">
          <div v-if="currentItem.playCount" class="stat">
            <VIcon icon="play" :size="16" />
            {{ currentItem.playCount | formatCount }}
          </div>
          <div v-if="currentItem.rating" class="stat">
            <VIcon icon="mdi-star-outline" :size="16" />
            {{ currentItem.rating }}
          </div>
          <div v-if="currentItem.danmakuCount" class="stat">
            <VIcon icon="danmaku" :size="16" />
            {{ currentItem.danmakuCount | formatCount }}
          </div>
          <div v-if="currentItem.like" class="stat">
            <VIcon icon="like-outline" :size="16" />
            {{ currentItem.like | formatCount }}
          </div>
          <div v-if="currentItem.durationText" class="stat">
            <VIcon icon="mdi-clock-outline" :size="16" />
            {{ currentItem.durationText }}
          </div>
        </div>
        <div
          v-if="currentItem.description"
          class="description-text"
          v-text="currentItem.description"
        ></div>
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
import UpInfo from '@/components/feeds/UpInfo.vue'
import { getWatchlaterList, toggleWatchlater, watchlaterList } from '@/components/video/watchlater'
import { bilibiliApi, getJson } from '@/core/ajax'
import { formatCount } from '@/core/utils/formatters'
import { DpiImage, VButton, VIcon, VLoading, VEmpty } from '@/ui'
import { cssVariableMixin, requestMixin } from '../../../../mixin'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
    DpiImage,
    UpInfo,
    VLoading,
    VEmpty,
  },
  filters: {
    formatCount,
  },
  mixins: [
    requestMixin({
      // log = false: 关闭 Toast, 错误信息改在空态中展示
      requestMethod: url => bilibiliApi(getJson(url), '获取清爽首页分区视频失败', false),
    }),
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
  props: {
    parseJson: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      watchlaterList,
      itemLimit: 10,
      // 最近一次滑动方向, 用于回绕封面的瞬移
      coverDirection: 'next' as 'next' | 'prev',
      // 跳转动画期间锁定信息栏的目标项, 避免跟随中间项连续刷新
      jumpTarget: null as any,
    }
  },
  computed: {
    currentItem() {
      return this.jumpTarget || this.items[1]
    },
    currentUrl() {
      return this.currentItem.videoHref
    },
    watchlaterAdded() {
      return this.watchlaterList.includes(this.currentItem.aid)
    },
  },
  created() {
    getWatchlaterList()
  },
  methods: {
    toggleWatchlater,
    nextCard() {
      this.coverDirection = 'next'
      this.items.push(this.items.shift())
    },
    previousCard() {
      this.coverDirection = 'prev'
      this.items.unshift(this.items.pop())
    },
    jumpToCard(event: MouseEvent, index: number) {
      if (index <= 1 || index >= this.items.length) {
        return
      }
      event.preventDefault()
      // 信息栏直达目标项, 动画期间不再更新
      this.jumpTarget = this.items[index]
      // 逐帧连发多格, 由过渡重定向连成一次滑动; 同帧多发会让回绕封面横穿卡片
      let steps = index - 1
      const step = () => {
        this.nextCard()
        if (--steps > 0) {
          requestAnimationFrame(step)
        } else {
          this.jumpTarget = null
        }
      }
      step()
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';

// 小封面相对主封面的缩放 (154/287, 100/185), 与 cssVariableMixin 尺寸配套
$cover-scale-x: 0.536585;
$cover-scale-y: 0.540541;

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
    // 不参与压缩, 信息行起点不随内容高度变化
    flex-shrink: 0;
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
        .be-empty {
          text-align: center;
          color: #f44336;
        }
        .be-button {
          padding-left: 6px;
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
  & &-play-text {
    // 字形墨迹在行盒中偏下, 上移补偿与图标视觉居中
    transform: translateY(-0.75px);
  }
  & &-play-button {
    // 宽度参与换行计算, 否则短昵称时播放按钮会和 UP 信息挤同一行
    flex: 1 1 auto;
    font-size: 16px;
    filter: drop-shadow(0 4px 12px var(--theme-color-10));
    .be-button {
      // 描边过渡时会露出脏缝 (hover 时基础样式会加回); 三角墨迹偏右, 左侧内边距收小
      box-shadow: none;
      padding-left: 4px;
      &:hover {
        box-shadow: none !important;
      }
    }
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
  & &-previous-button:active .be-icon,
  & &-next-button:active .be-icon {
    transform: scale(0.9);
  }
  & &-previous-button:hover .be-icon {
    @include bounce-x(-2);
  }
  & &-next-button:hover .be-icon {
    @include bounce-x(2);
  }
  & &-next-button,
  & &-watchlater-button {
    padding: 6px !important;
  }
  & &-up-container {
    // UpInfo 内部是 flex 布局, 需覆盖上方 a { display: block }
    display: flex;
    max-width: var(--other-cover-width);
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
    // 固定行高, 否则行盒高度随字体浮动, --main-info-padding 的布局失效
    line-height: 19px;
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
  & &-stats {
    // 封面右侧留白处补充视频数据; 有简介时置于简介上方
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    margin-bottom: 6px;
    opacity: 0.8;
    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
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
    // 首个小封面槽位的偏移与槽位间距 (封面宽 + 间距)
    --slot-offset: calc(var(--main-cover-width) + var(--cover-padding));
    --slot-step: calc(var(--other-cover-width) + var(--cover-padding));
  }
  // 回绕的封面两端都在卡片外, 直接瞬移, 否则会横穿卡片
  & &-covers.next &-cover:last-child:nth-child(n + 3),
  & &-covers.prev &-cover:first-child:nth-last-child(n + 3) {
    transition: none;
  }
  & &-cover {
    @include card(12px);
    position: absolute;
    box-shadow: none;
    overflow: hidden;
    top: var(--main-padding-y);
    left: var(--main-padding-x);
    width: var(--main-cover-width);
    height: var(--main-cover-height);
    transform-origin: top left;
    // 小封面用缩放实现 (只走合成器), 边框与圆角除以缩放系数抵消
    &:not(:nth-child(2)) {
      border-width: calc(1px / #{$cover-scale-x});
      border-radius: calc(12px / #{$cover-scale-x});
    }
    transition: 0.45s cubic-bezier(0.33, 1, 0.68, 1);
    img {
      transition: 0.2s ease-out;
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
    &:hover img {
      transform: scale(1.05);
    }
    &:nth-child(1) {
      opacity: 0;
      transform: translateX(calc(0px - var(--slot-step))) scale($cover-scale-x, $cover-scale-y);
    }
    @for $i from 3 through 10 {
      &:nth-child(#{$i}) {
        transform: translateX(calc(var(--slot-offset) + #{$i - 3} * var(--slot-step)))
          scale($cover-scale-x, $cover-scale-y);
      }
    }
  }
}
</style>
