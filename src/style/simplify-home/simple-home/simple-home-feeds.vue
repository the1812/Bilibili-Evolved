<template>
  <div class="feeds">
    <div class="header">
      <div class="title">动态</div>
      <div class="tabs">
        <div
          class="tab"
          v-for="tab of tabs"
          :key="tab.type"
          :class="{active: tab === currentTab}"
          @click="currentTab = tab"
        >
          <div class="tab-name">{{tab.name}}</div>
        </div>
      </div>
      <div class="flex-grow"></div>
      <a class="more">
        <icon type="mdi" icon="dots-horizontal"></icon>更多
      </a>
    </div>
    <div class="contents-wrapper">
      <div class="contents">
        <div class="card-wrapper" v-for="card in feeds" :key="card.id">
          <video-card :data="card" orientation="vertical"></video-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
interface Tab {
  name: string
  type: 'video' | 'bangumi'
}
const tabs: Tab[] = [
  {
    name: '视频',
    type: 'video'
  },
  {
    name: '番剧',
    type: 'bangumi'
  }
]
export default {
  components: {
    VideoCard: () => import('../video-card.vue'),
    Icon: () => import('../../icon.vue')
  },
  data() {
    return {
      tabs,
      currentTab: tabs[0],
      feeds: []
    }
  },
  watch: {
    currentTab(tab: Tab) {
      this.updateFeedsTab(tab)
    }
  },
  methods: {
    async updateFeedsTab(tab: Tab) {
      const { getVideoFeeds } = await import('../../../activity/feeds-apis')
      this.feeds = await getVideoFeeds(tab.type)
    }
  },
  mounted() {
    this.updateFeedsTab(this.currentTab)
  }
}
</script>

<style lang="scss">
.simple-home .feeds {
  width: calc(100% + 16px);
  justify-self: center;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  .header {
    padding: 0 8px;
    .flex-grow {
      flex-grow: 1;
    }
    .tabs {
      margin-left: 24px;
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
  .contents-wrapper {
    margin-top: 16px;
    display: flex;
    width: 100%;
    .contents {
      --card-width: 200px;
      --card-height: 250px;
      padding-bottom: 16px;
      display: flex;
      overflow: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none !important;
      width: 0;
      flex: 1 0 0;

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
}
</style>