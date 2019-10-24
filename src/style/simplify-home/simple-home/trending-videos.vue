<template>
  <div class="trendings">
    <div class="header">
      <div class="title">热门</div>
      <div class="tabs">
        <div
          class="tab"
          v-for="tab in tabs"
          :key="tab.day"
          @click="currentTab = tab"
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
}
const tabs: Tab[] = [
  {
    name: '一周',
    day: 7
  },
  {
    name: '三日',
    day: 3
  },
  {
    name: '昨日',
    day: 1
  }
]
export default {
  components: {
    VideoCard: () => import('../video-card.vue'),
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
    }
  },
  mounted() {
    this.updateTrendingTab(this.currentTab)
  },
}
</script>

<style lang="scss">
.simple-home .trendings {
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    .title {
      color: var(--title-color);
      font-weight: bold;
      font-size: 24px;
    }
    .tabs {
      display: flex;
      align-items: center;
      .tab {
        cursor: pointer;
        position: relative;
        .tab-name {
          opacity: 0.5;
          font-size: 14px;
        }
        &:not(:last-child) {
          margin-right: 24px;
        }
        &::after {
          content: '';
          width: calc(80%);
          height: 3px;
          border-radius: 2px;
          position: absolute;
          background-color: var(--theme-color);
          left: 10%;
          bottom: -6px;
          transform: scaleX(0);
          transition: 0.2s ease-out;
        }
        &.active::after {
          transform: scaleX(1);
        }
        &.active .tab-name {
          font-weight: bold;
          opacity: 1;
          transform: scale(1.1);
        }
      }
    }
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
    scroll-snap-type: x mandatory;
    scrollbar-width: none !important;

    @media screen and (max-width: 1250px) and (min-width: 900px) {
      & {
        --card-count: 2;
      }
    }
    @media screen and (max-width: 1050px) and (min-width: 900px) {
      & {
        --card-count: 1;
      }
    }
    @media screen and (min-width: 1600px) {
      & {
        --card-count: 4;
      }
    }
    @media screen and (min-width: 1900px) {
      & {
        --card-count: 5;
      }
    }
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