<template>
  <div class="minimal-home">
    <div class="minimal-home-header">
      <!-- <img v-if="logoImage" :src="logoImage" width="120" /> -->
      <!-- <icon v-else class="logo" icon="logo" type="main"></icon> -->
      <div class="home-tabs">
        <div
          v-for="(tab, index) of tabs"
          :key="index"
          class="tab"
          :class="{active: tab.active}"
          :data-tab="tab.name"
          @click="changeTab(tab)"
        >{{tab.displayName}}</div>
      </div>
    </div>
    <div class="minimal-home-content">
      <transition name="minimal-home-content-transition" mode="out-in">
        <component :is="content" :key="activeTab.name" :show-rank="activeTab.showRank"></component>
      </transition>
    </div>
    <div class="minimal-home-footer">
      <div class="footer-button view-more" @click="viewMore()">
        <icon type="mdi" icon="dots-horizontal-circle-outline"></icon>查看更多
      </div>
      <div class="footer-button go-to-top" @click="goToTop()">
        <icon type="mdi" icon="arrow-up-drop-circle-outline"></icon>返回顶部
      </div>
    </div>
  </div>
</template>
<script lang="ts">
// https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=39717974&type_list=8
// https://api.bilibili.com/x/web-interface/ranking/index?day=1
interface Tab {
  name: string
  displayName: string
  active: boolean
  more: string
  showRank: boolean
}
const tabs = [
  {
    name: 'video',
    displayName: '视频动态',
    active: true,
    more: 'https://t.bilibili.com/?tab=8',
    showRank: false
  },
  {
    name: 'ranking',
    displayName: '热门视频',
    active: false,
    more: 'https://www.bilibili.com/ranking',
    showRank: true
  }
] as Tab[]
export default {
  components: {
    Icon: () => import('../../icon.vue'),
    // Search: () => import('../../search.vue'),
    VideoList: () => import('./video-list.vue')
  },
  data() {
    return {
      tabs,
      content: 'VideoList',
      logoImage: null
    }
  },
  computed: {
    activeTab() {
      return this.tabs.find((t: Tab) => t.active) as Tab
    },
    rankDays(): number {
      return this.activeTab.rankDays || 0
    }
  },
  async mounted() {
    // if (settings.minimalHomeSeasonLogo) {
    //   const json = await Ajax.getJson(
    //     'https://api.bilibili.com/x/web-show/res/locs?pf=0&ids=142'
    //   )
    //   if (json.code !== 0) {
    //     return
    //   }
    //   this.logoImage = json.data[142][0].litpic
    // }
  },
  methods: {
    changeTab(tab: Tab) {
      if (tab.active) {
        window.open(tab.more, '_blank')
        return
      }
      const activeTab = this.activeTab
      activeTab.active = false
      tab.active = true
    },
    goToTop() {
      scrollTo(0, 0)
    },
    viewMore() {
      open(this.activeTab.more, '_blank')
    }
  }
}
</script>
<style lang="scss">
.minimal-home {
  --card-width: 600px;
  --card-height: 120px;
  --card-margin: 16px;
  --card-column-count: 2;
  transform: translateX(calc(var(--card-margin) / 2));
  &,
  & * {
    box-sizing: border-box;
    transition: color 0.2s ease-out, opacity 0.2s ease-out,
      transform 0.2s ease-out, background-color 0.2s ease-out;
  }
  .logo {
    font-size: 40px;
    color: var(--theme-color);
  }
  .minimal-home-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .home-tabs {
      display: flex;
      flex-grow: 1;
      justify-content: center;
      margin-right: var(--card-margin);
      .tab {
        color: black;
        opacity: 0.75;
        position: relative;
        cursor: pointer;

        &:not(:first-child) {
          margin-left: 32px;
        }
        body.dark & {
          color: #eee;
        }
        &.active {
          transform: scale(1.2);
          opacity: 1;
          font-weight: bold;
        }
        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          height: 3px;
          width: 24px;
          background-color: var(--theme-color);
          border-radius: 2px;
          transition: 0.2s ease-out;
        }
        &.active::after {
          transform: translateX(-50%) scaleX(1);
        }
      }
    }
  }
  .minimal-home-content {
    margin-top: 32px;
    min-height: 100vh;
    width: calc(
      var(--card-column-count) * (var(--card-width) + var(--card-margin))
    );
    .minimal-home-content-transition {
      &-enter-active,
      &-leave-active {
        transition: 0.3s ease-out;
      }
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: scale(0.95);
      }
    }
  }
  .minimal-home-footer {
    padding: 24px 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-right: var(--card-margin);
    .footer-button {
      display: flex;
      align-items: center;
      padding: 8px 12px 8px 8px;
      background-color: #8882;
      color: black;
      border-radius: 24px;
      font-size: 11pt;
      cursor: pointer;
      .be-icon {
        margin-right: 8px;
      }
      body.dark & {
        color: #eee;
      }
      &:hover {
        background-color: #8884;
      }
    }
  }
}
@media screen and (max-width: 1300px) {
  .minimal-home {
    --card-column-count: 1;
  }
}
@media screen and (min-width: 2000px) {
  .minimal-home {
    --card-column-count: 3;
    .cards.show-rank {
      .video-card:nth-child(8),
      .video-card:nth-child(16),
      .video-card:nth-child(24) {
        margin-right: calc(var(--card-margin) * 2 + var(--card-width));
      }
    }
  }
}
</style>