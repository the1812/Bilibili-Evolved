<template>
  <div class="minimal-home">
    <div class="minimal-home-header">
      <Icon class="logo" icon="logo" type="main"></Icon>
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
      <!-- <Search></Search> -->
    </div>
    <div class="minimal-home-content">
      <transition name="minimal-home-content-transition" mode="out-in">
        <component :is="content" :key="activeTab.name" :rank-days="rankDays"></component>
      </transition>
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
  rankDays?: number
}
const tabs = [
  {
    name: 'video',
    displayName: '视频动态',
    active: true,
    more: 'https://t.bilibili.com/?tab=8'
  },
  {
    name: 'ranking7',
    displayName: '一周排行',
    active: false,
    more: 'https://www.bilibili.com/ranking/all/0/0/7',
    rankDays: 7
  },
  {
    name: 'ranking3',
    displayName: '三日排行',
    active: false,
    more: 'https://www.bilibili.com/ranking',
    rankDays: 3
  },
  {
    name: 'ranking1',
    displayName: '昨日排行',
    active: false,
    more: 'https://www.bilibili.com/ranking/all/0/0/1',
    rankDays: 1
  }
] as Tab[]
export default {
  components: {
    Icon: () => import('../../icon.vue'),
    // Search: () => import('../../search.vue'),
    HomeVideo: () => import('./home-video.vue'),
    RankList: () => import('./rank-list.vue')
  },
  data() {
    return {
      tabs,
      content: 'HomeVideo'
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
  methods: {
    changeTab(tab: Tab) {
      if (tab.active) {
        window.open(tab.more, '_blank')
        return
      }
      const activeTab = this.activeTab
      activeTab.active = false
      tab.active = true
      this.content = tab.name === 'video' ? 'HomeVideo' : 'RankList'
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
    transition: color .2s ease-out, opacity .2s ease-out, transform .2s ease-out;
  }
  .logo {
    font-size: 48px;
    color: var(--theme-color);
  }
  .minimal-home-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .home-tabs {
      display: flex;
      flex-grow: 1;
      justify-content: flex-end;
      margin-right: var(--card-margin);
      .tab {
        color: #707070;
        opacity: 0.75;
        position: relative;
        cursor: pointer;
        margin-left: 32px;

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
    width: calc(
      var(--card-column-count) * (var(--card-width) + var(--card-margin))
    );
    .minimal-home-content-transition {
      &-enter-active,
      &-leave-active {
        transition: .3s ease-out;
      }
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: scale(0.95);
      }
    }
  }
}
@media screen and (max-width: 1300px) {
  .minimal-home {
    --card-column-count: 1;
  }
}
</style>