<template>
  <div class="categories">
    <div class="header">
      <div class="title">分区</div>
      <div class="tabs" ref="reorderContainer">
        <div
          class="tab"
          v-for="t of tabs"
          :key="t.key"
          :data-key="t.key"
          :style="{order: getOrder(t.key)}"
          :class="{active: selectedTab === t.key}"
          @click="selectTab(t)"
        >
          <div class="tab-name">{{t.name}}</div>
        </div>
      </div>
      <div class="buttons">
        <div
          class="toggle-reorder"
          @click="reordering = !reordering; reorder.toggle()"
        >
          <icon type="mdi" :icon="reordering ? 'check' : 'swap-horizontal'"></icon>
          {{reordering ? '完成' : '排序'}}
        </div>
      </div>
    </div>
    <transition mode="out-in">
      <component class="category-content" :is="content" :rid="rid"></component>
    </transition>
  </div>
</template>

<script lang="ts">
const tabNames = {
  anime: '动画',
  bangumi: '番剧',
  china: '国创',
  // manga: '漫画',
  music: '音乐',
  dance: '舞蹈',
  game: '游戏',
  tech: '科技',
  digital: '数码',
  life: '生活',
  kichiku: '鬼畜',
  fashion: '时尚',
  // ads: '广告',
  information: '资讯',
  entertainment: '娱乐',
  // column: '专栏',
  movie: '影视',
  tv: 'TV剧',
  film: '放映厅',
  documentary: '纪录片',
}
export default {
  components: {
    Icon: () => import('../../../icon.vue'),
    NormalCategory: () => import('./simple-home-normal-category.vue'),
    BangumiCategory: () => import('./simple-home-bangumi-category.vue'),
  },
  data() {
    return {
      tabs: Object.entries(tabNames).map(([key, name]) => {
        return {
          key,
          name,
        }
      }),
      selectedTab: Object.entries(settings.simpleHomeCategoryOrders).sort(
        (a, b) => a[1] - b[1],
      )[0][0],
      reordering: false,
      reorder: null,
      regionCodes: null,
      regionLinks: null,
    }
  },
  async mounted() {
    this.checkAds()
    const container = this.$refs.reorderContainer as HTMLElement
    const { RegionCodes, RegionLinks } = await import('./category-regions')
    this.regionCodes = RegionCodes
    this.regionLinks = RegionLinks
    const { Reorder } = await import('../../../../utils/reorder')
    const reorder = new Reorder(container)
    this.reorder = reorder
    reorder.addEventListener('reorder', (e: CustomEvent) => {
      const orders = e.detail
      for (const orderDetail of orders) {
        const { element, order } = orderDetail as {
          element: HTMLElement
          order: number
        }
        settings.simpleHomeCategoryOrders[
          element.getAttribute('data-key')!
        ] = order
      }
      settings.simpleHomeCategoryOrders = settings.simpleHomeCategoryOrders
    })
  },
  methods: {
    getOrder(key: string) {
      return settings.simpleHomeCategoryOrders[key]
    },
    checkAds() {
      if ('ads' in settings.simpleHomeCategoryOrders) {
        settings.simpleHomeCategoryOrders.information =
          settings.simpleHomeCategoryOrders.ads
        delete settings.simpleHomeCategoryOrders.ads
        settings.simpleHomeCategoryOrders = settings.simpleHomeCategoryOrders
      }
    },
    selectTab(tab: { key: string; name: string }) {
      if (this.selectedTab === tab.key && this.regionLinks) {
        const link = this.regionLinks[tab.key] as string
        window.open(`https://www.bilibili.com/${link}`, '_blank')
      } else {
        this.selectedTab = tab.key
      }
    },
  },
  computed: {
    content() {
      if (['bangumi', 'china'].includes(this.selectedTab)) {
        return 'BangumiCategory'
        // return null
      } else if (this.selectedTab === 'manga') {
        return null
      } else if (this.selectedTab === 'column') {
        return null
      } else {
        return 'NormalCategory'
      }
    },
    rid() {
      // console.log(this.regionCodes)
      if (!this.regionCodes) {
        return -1
      } else {
        return this.regionCodes[this.selectedTab]
      }
    },
  },
}
</script>

<style lang="scss">
.simple-home .categories {
  --loading-from: #d4d4d4;
  --loading-to: #ddd;
  --slideshow-ratio: 0.6;
  --rank-width: 370px;
  --rank-height: calc(var(--rank-width) / 16 * 10);
  --card-height: 280px;
  --card-width: calc(var(--card-height) * (42 / 25));
  display: flex;
  flex-direction: column;
  body.dark & {
    --loading-from: #333;
    --loading-to: #262626;
  }
  @keyframes category-loading {
    from {
      background-color: var(--loading-from);
    }
    to {
      background-color: var(--loading-to);
    }
  }
  @for $width from 18 through 7 {
    @media screen and (max-width: #{$width * 100}px) {
      --card-height: #{280 - 8 * (19 - $width)}px;
      --rank-width: #{370 - 20 * (19 - $width)}px;
    }
  }
  &,
  & *,
  ::after,
  ::before {
    transition: all 0.2s ease-out;
  }
  .header {
    .tabs {
      display: flex;
      flex: 1 1 0;
      margin: 0 32px;
      justify-content: flex-start;
      overflow: auto;
      width: 0;
      height: 42px;
      scrollbar-width: none !important;
      &::-webkit-scrollbar {
        height: 0 !important;
        width: 0 !important;
      }
      .tab {
        transition: none;
        margin-right: 24px;
      }
    }
  }
  .area-header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-weight: bold;
    font-size: 11pt;
    padding-bottom: 12px;
    &::before {
      content: '';
      display: inline-flex;
      height: 10px;
      width: 10px;
      background-color: var(--theme-color);
      border-radius: 50%;
      margin-right: 8px;
    }
  }
  .category-content {
    margin-top: 12px;
    margin-bottom: 36px;
    &-enter,
    &-leave-to {
      opacity: 0;
    }
  }
}
</style>