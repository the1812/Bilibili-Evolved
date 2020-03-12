<template>
  <div class="trendings">
    <div class="header">
      <div class="title">热门</div>
      <div class="tabs">
        <div
          class="tab"
          v-for="tab in tabs"
          :key="tab.day"
          @click="changeTab(tab)"
          :class="{active: currentTab === tab}"
        >
          <div class="tab-name">{{tab.name}}</div>
        </div>
      </div>
    </div>
    <div class="contents">
      <div class="card-wrapper" v-for="card in trendingCards" :key="card.id">
        <video-card :data="card" orientation="vertical"></video-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface Tab {
  name: string
  day: number
  url: string
}
const tabs: Tab[] = [
  {
    name: '今日',
    day: 1,
    url: 'https://www.bilibili.com/ranking/all/0/0/1'
  },
  {
    name: '三日',
    day: 3,
    url: 'https://www.bilibili.com/ranking'
  },
  {
    name: '一周',
    day: 7,
    url: 'https://www.bilibili.com/ranking/all/0/0/7'
  }
]
export default {
  components: {
    VideoCard: () => import('../video-card.vue')
  },
  data() {
    return {
      tabs,
      currentTab: tabs[0],
      trendingCards: []
    }
  },
  watch: {
    currentTab(tab: Tab) {
      this.updateTrendingTab(tab)
    }
  },
  methods: {
    async updateTrendingTab(tab: Tab) {
      const { getTrendingVideos } = await import('../trending-videos')
      this.trendingCards = await getTrendingVideos(tab.day)
    },
    changeTab(tab: Tab) {
      if (this.currentTab === tab) {
        open(tab.url, '_blank')
      } else {
        this.currentTab = tab
      }
    }
  },
  mounted() {
    this.updateTrendingTab(this.currentTab)
  }
}
</script>

<style lang="scss">
.simple-home .trendings {
  display: flex;
  flex-direction: column;
  .header {
    padding: 0 8px;
  }
  .contents {
    --card-width: 200px;
    --card-height: 250px;
    --card-count: 3;
    margin-top: 16px;
    display: flex;
    overflow: auto;
    height: calc(var(--card-height) + 16px);
    width: calc((var(--card-width) + 16px) * var(--card-count));
    // scroll-snap-type: x mandatory;
    scrollbar-width: none !important;

    @media screen and (max-width: 1300px) and (min-width: 900px) {
      & {
        --card-count: 2;
      }
    }
    @media screen and (max-width: 1100px) and (min-width: 900px) {
      & {
        --card-count: 4;
      }
    }
    @media screen and (min-width: 1550px) {
      & {
        --card-count: 4;
      }
    }
    // @media screen and (min-width: 1850px) {
    //   & {
    //     --card-count: 5;
    //   }
    // }
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
</style>