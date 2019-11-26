<template>
  <div class="categories">
    <div class="header">
      <div class="title">分区</div>
      <div class="tabs">
        <div
          class="tab"
          v-for="t of tabs"
          :key="t.key"
          :style="{order: getOrder(t.key)}"
          :class="{active: selectedTab === t.key}"
          @click="selectedTab = t.key"
        >
          <div class="tab-name">{{t.name}}</div>
        </div>
      </div>
      <div class="buttons">
        <div class="toggle-reorder">
          <icon type="mdi" icon="swap-horizontal"></icon>排序
        </div>
      </div>
    </div>
    {{selectedTab}}
  </div>
</template>

<script lang="ts">
const tabNames = {
  anime: '动画',
  bangumi: '番剧',
  china: '国创',
  manga: '漫画',
  music: '音乐',
  dance: '舞蹈',
  game: '游戏',
  tech: '科技',
  digital: '数码',
  life: '生活',
  kichiku: '鬼畜',
  fashion: '时尚',
  ads: '广告',
  entertainment: '娱乐',
  column: '专栏',
  movie: '电影',
  tv: 'TV剧',
  film: '影视',
  documentary: '纪录片'
}
export default {
  components: {
    Icon: () => import('../../../icon.vue')
  },
  data() {
    return {
      tabs: Object.entries(tabNames).map(([key, name]) => {
        return {
          key,
          name
        }
      }),
      selectedTab: Object.entries(settings.simpleHomeCategoryOrders).sort(
        (a, b) => a[1] - b[1]
      )[0][0]
    }
  },
  methods: {
    getOrder(key: string) {
      return settings.simpleHomeCategoryOrders[key]
    }
  }
}
</script>

<style lang="scss">
.simple-home .categories {
  display: flex;
  flex-direction: column;
  .header {
    align-items: stretch;
    .tabs {
      display: flex;
      flex: 1 1 0;
      margin: 0 32px;
      justify-content: space-between;
      overflow: auto;
      width: 0;
      scrollbar-width: none !important;
      &::-webkit-scrollbar {
        height: 0 !important;
        width: 0 !important;
      }
    }
  }
}
</style>