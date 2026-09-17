<template>
  <div class="video-card-list" :class="{ 'show-description': showDescription }">
    <VLoading v-if="loading"></VLoading>
    <VEmpty v-else-if="!loading && cards.length === 0"></VEmpty>
    <template v-else>
      <div class="video-card-list-content">
        <transition-group name="cards" tag="div" class="left-column">
          <VideoCard
            v-for="c of columnedCards.left"
            :key="c.id"
            orientation="vertical"
            :is-new="c.new"
            :show-stats="false"
            :data="c"
          ></VideoCard>
        </transition-group>
        <transition-group name="cards" tag="div" class="right-column">
          <VideoCard
            v-for="c of columnedCards.right"
            :key="c.id"
            orientation="vertical"
            :is-new="c.new"
            :show-stats="false"
            :data="c"
          ></VideoCard>
        </transition-group>
      </div>
      <ScrollTrigger v-if="hasMorePage" @trigger="$emit('next-page')"></ScrollTrigger>
    </template>
  </div>
</template>
<script lang="ts">
import { PropType } from 'vue'
import { VLoading, VEmpty, ScrollTrigger } from '@/ui'
import { VideoCard } from '@/components/feeds/video-card'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'

/** 列表里的视频卡片: 在 `VideoCard` 基础上加上可选的 NEW 标记 */
type VideoCardListItem = VideoCard & { new?: boolean }

/**
 * 顶栏动态页签的双列视频卡片列表
 * @remarks
 * 只负责展示, 卡片与加载状态由使用它的页签通过 `next-page` 混入提供(见 `next-page.ts`),
 * 滚动到底部时抛出 `next-page` 事件由页签继续加载
 */
export default Vue.extend({
  components: {
    VideoCard: VideoCardComponent,
    VLoading,
    VEmpty,
    ScrollTrigger,
  },
  props: {
    /** 已加载的卡片 */
    cards: {
      type: Array as PropType<VideoCardListItem[]>,
      required: true,
    },
    /** 是否正在加载第一页 */
    loading: {
      type: Boolean,
      required: true,
    },
    /** 是否还有更多数据, 决定是否显示滚动加载触发器 */
    hasMorePage: {
      type: Boolean,
      required: true,
    },
    /** 是否在竖向卡片底部显示描述行(订阅页签用来标注更新来自哪个合集/收藏夹) */
    showDescription: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    columnedCards() {
      return {
        left: this.cards.filter((_, index) => index % 2 === 0),
        right: this.cards.filter((_, index) => index % 2 !== 0),
      }
    },
  },
})
</script>
<style lang="scss" scoped>
.video-card-list {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  flex: 1;
  padding: 0 8px;
  .be-scroll-trigger {
    padding-bottom: 12px;
  }
  &-content {
    flex: 1;
    align-self: stretch;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 356px;
    .cards {
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: translateY(-16px) scale(0.9);
      }
      &-leave-active {
        transition: 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
        position: absolute;
      }
    }
    .left-column,
    .right-column {
      display: flex;
      flex-direction: column;
      padding-bottom: 12px;
      .video-card {
        --card-width: 174px;
        &:not(:last-child) {
          margin-bottom: 8px;
        }
      }
    }
  }
  // 竖向卡片的描述行默认隐藏(见 VideoCard.vue), 这里借它显示合集/收藏夹名
  &.show-description .video-card.vertical :deep(.description) {
    grid-area: stats;
    display: block;
    height: auto;
    align-self: end;
    margin: 0 10px 8px;
    font-size: 12px;
    line-height: 1.2;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
