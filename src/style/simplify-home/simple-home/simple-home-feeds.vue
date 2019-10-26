<template>
  <div class="feeds">
    <div class="header">
      <div class="title">动态</div>
      <a class="more">
        <icon type="mdi" icon="dots-horizontal"></icon>更多
      </a>
    </div>
    <div class="video-feeds">
      <div class="sub-header">视频</div>
      <div class="contents">
        <div class="card-wrapper" v-for="card in videoFeeds" :key="card.id">
          <video-card :data="card" orientation="vertical"></video-card>
        </div>
      </div>
    </div>
    <div class="bangumi-feeds">
      <div class="sub-header">番剧</div>
      <div class="contents">
        <div class="card-wrapper" v-for="card in bangumiFeeds" :key="card.id">
          <video-card :data="card" orientation="vertical"></video-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  components: {
    VideoCard: () => import('../video-card.vue'),
    Icon: () => import('../../icon.vue')
  },
  data() {
    return {
      videoFeeds: [],
      bangumiFeeds: []
    }
  },
  async mounted() {
    const { getVideoFeeds } = await import('../../../activity/feeds-apis')
    this.videoFeeds = await getVideoFeeds('video')
    this.bangumiFeeds = await getVideoFeeds('bangumi')
  }
}
</script>

<style lang="scss">
.simple-home .feeds {
  width: calc(100% + 16px);
  justify-self: center;
  // display: flex;
  // align-items: stretch;
  // flex-direction: column;
  display: grid;
  grid-template-areas: 'header header' 'video bangumi';
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(2, auto);
  row-gap: 16px;
  column-gap: 16px;
  .header,
  .sub-header {
    padding: 0 8px;
  }
  .video-feeds,
  .bangumi-feeds {
    display: flex;
    flex-direction: column;
    --card-width: 200px;
    --card-height: 250px;
    --card-count: 1;
    .contents {
      width: calc((var(--card-width) + 16px) * var(--card-count));
      padding-bottom: 16px;
      margin-top: 16px;
      display: flex;
      overflow: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none !important;
      &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
      }
      .card-wrapper {
        padding: 0 8px;
        scroll-snap-align: start;
        flex-shrink: 0;
      }
    }
  }
  .video-feeds {
    grid-area: video;
    @media screen and (min-width: 800px) {
      --card-count: 2;
    }
    @media screen and (min-width: 1180px) {
      --card-count: 3;
    }
    @media screen and (min-width: 1700px) {
      --card-count: 4;
    }
  }
  .bangumi-feeds {
    grid-area: bangumi;
    justify-self: end;
    @media screen and (min-width: 950px) {
      --card-count: 2;
    }
    @media screen and (min-width: 1450px) {
      --card-count: 3;
    }
    @media screen and (min-width: 1900px) {
      --card-count: 4;
    }
  }
}
</style>