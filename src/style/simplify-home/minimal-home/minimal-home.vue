<template>
  <div class="minimal-home">
    <div class="minimal-home-header">
      <Logo class="logo"></Logo>
      <div class="home-tabs">
        <div v-for="(tab, index) of tabs" :key="index" class="tab" :class="{active: tab.active}" :data-tab="tab.name" @click="changeTab(tab)">{{tab.displayName}}</div>
      </div>
      <Search></Search>
    </div>
    <div class="minimal-home-content">
      <component :is="content"></component>
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
}
export default {
  components: {
    Logo: () => import('../../logo.vue'),
    Search: () => import('../../search.vue')
  },
  data() {
    return {
      tabs: [
        {
          name: 'video',
          displayName: '视频动态',
          active: true,
          more: 'https://t.bilibili.com/?tab=8',
        },
        {
          name: 'ranking7',
          displayName: '一周排行',
          active: true,
          more: 'https://www.bilibili.com/ranking/all/0/0/7',
        },
        {
          name: 'ranking3',
          displayName: '三日排行',
          active: true,
          more: 'https://www.bilibili.com/ranking',
        },
        {
          name: 'ranking1',
          displayName: '昨日排行',
          active: true,
          more: 'https://www.bilibili.com/ranking/all/0/0/1',
        },
      ] as Tab[],
      content: null,
    }
  },
  methods: {
    changeTab(tab: Tab) {
      if (tab.active) {
        window.open(tab.more, '_blank')
        return
      }
      const activeTab = this.tabs.find((t: Tab) => t.active) as Tab
      activeTab.active = false
      tab.active = true
    }
  },
}
</script>
<style lang="scss">
.minimal-home {
  &,
  & * {
    box-sizing: border-box;
  }
  .logo {
    font-size: 48px;
  }
}
</style>