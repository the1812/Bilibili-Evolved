<template>
  <div class="live-feeds">
    <VLoading v-if="loading"></VLoading>
    <VEmpty v-else-if="!loading && cards.length === 0"></VEmpty>
    <transition-group name="cards" tag="div" class="live-feeds-content">
      <a v-for="c of cards" :key="c.id" class="live-card" target="_blank" :href="c.url">
        <div class="face-container">
          <DpiImage class="face" :size="48" :src="c.upFaceUrl"></DpiImage>
        </div>
        <div class="live-info">
          <div class="live-title" :title="c.title">{{ c.title }}</div>
          <div class="live-name" :title="c.upName">{{ c.upName }}</div>
        </div>
      </a>
    </transition-group>
  </div>
</template>
<script lang="ts">
import { VLoading, VEmpty, DpiImage } from '@/ui'
import { responsiveGetPages, getJsonWithCredentials } from '@/core/ajax'
import { LiveFeedItem } from './live-feed-item'

export default Vue.extend({
  components: {
    VLoading,
    VEmpty,
    DpiImage,
  },
  data() {
    return {
      loading: true,
      rawItems: [],
      hasMorePage: true,
    }
  },
  computed: {
    cards(): LiveFeedItem[] {
      const parseLiveCard = (card: any) => ({
        id: card.roomid,
        title: card.title,
        upFaceUrl: card.face,
        upName: card.uname,
        url: card.link,
      })
      return (this.rawItems as any[]).map(parseLiveCard)
    },
  },
  async created() {
    const [responsive] = responsiveGetPages({
      api: page =>
        getJsonWithCredentials(
          `https://api.live.bilibili.com/relation/v1/feed/feed_list?page=${page}&pagesize=24`,
        ),
      getList: json => lodash.get(json, 'data.list', []),
      getTotal: json => lodash.get(json, 'data.results', 0),
    })
    this.rawItems = await responsive
    this.loading = false
  },
})
</script>
<style lang="scss">
@import 'common';
.live-feeds {
  width: 100%;
  @include v-center();
  .live-feeds-content {
    align-self: stretch;
    &-enter,
    &-leave-to {
      opacity: 0;
      transform: translateY(-16px) scale(0.9);
    }
    &-leave-active {
      transition: 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
      position: absolute;
    }
    .live-card {
      margin: 0 8px 12px 8px;
      background-color: #fff;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #8882;
      @include h-stretch();
      height: 54px;
      border-radius: 26px;
      box-sizing: border-box;
      padding: 2px;
      width: auto;
      flex-shrink: 0;
      body.dark & {
        background-color: #282828;
        color: #eee;
      }
      .face-container {
        flex-shrink: 0;
        border-radius: 50%;
        height: 48px;
        overflow: hidden;
        .face {
          height: 100%;
          width: 100%;
        }
      }
      &:hover .face {
        transform: scale(1.05);
      }
      .live-info {
        @include v-stretch();
        flex: 1 0 0;
        width: 0;
        justify-content: center;
      }
      .live-title {
        font-size: 14px;
        @include semi-bold();
        padding: 0 12px;
        padding-bottom: 6px;
        @include single-line();
        color: inherit;
        line-height: normal;
      }
      &:hover .live-title {
        color: var(--theme-color);
      }
      .live-name {
        opacity: 0.75;
        padding: 0 12px;
        @include single-line();
        line-height: normal;
      }
    }
  }
}
</style>
