<template>
  <div class="navbar-subscriptions">
    <TabControl ref="tabControl" :tabs="tabs" :more-link="moreLink">
      <template #header-item>
        <div class="navbar-subscriptions-filter">
          <VDropdown v-model="selectedFilter" round :items="filterItems" />
        </div>
      </template>
    </TabControl>
  </div>
</template>
<script lang="ts">
import { TabControl, VDropdown } from '@/ui'
import { TabMapping, TabMappings } from '@/ui/tab-mapping'
import { getUID } from '@/core/utils'
import { popperMixin } from '../mixins'
import { SubscriptionTypes } from './subscriptions'
import { SubscriptionStatus, SubscriptionStatusFilter } from './types'

const filterItems: {
  name: string
  value: SubscriptionStatusFilter
  displayName: string
}[] = [
  {
    name: 'all',
    value: {
      viewAll: true,
      status: SubscriptionStatus.Viewing,
    },
    displayName: '全部',
  },
  {
    name: 'viewing',
    value: {
      viewAll: false,
      status: SubscriptionStatus.Viewing,
    },
    displayName: '在看',
  },
  {
    name: 'toView',
    value: {
      viewAll: false,
      status: SubscriptionStatus.ToView,
    },
    displayName: '想看',
  },
  {
    name: 'viewed',
    value: {
      viewAll: false,
      status: SubscriptionStatus.Viewed,
    },
    displayName: '看过',
  },
]
export default Vue.extend({
  components: {
    TabControl,
    VDropdown,
  },
  mixins: [popperMixin],
  data() {
    const uid = getUID()
    return {
      uid,
      filterItems,
      selectedFilter: filterItems[0],
      moreLink: (tab: TabMapping) => `https://space.bilibili.com/${uid}/${tab.name}`,
      filter: {
        viewAll: true,
        status: SubscriptionStatus.Viewing,
      } as SubscriptionStatusFilter,
    }
  },
  computed: {
    tabs(): TabMappings {
      return [
        {
          name: SubscriptionTypes.Bangumi,
          displayName: '追番',
          activeLink: `https://space.bilibili.com/${this.uid}/bangumi`,
          component: () => import('./BangumiSubscriptions.vue').then(m => m.default),
          propsData: {
            filter: this.selectedFilter.value,
          },
        },
        {
          name: SubscriptionTypes.Cinema,
          displayName: '追剧',
          activeLink: `https://space.bilibili.com/${this.uid}/cinema`,
          component: () => import('./CinemaSubscriptions.vue').then(m => m.default),
          propsData: {
            filter: this.selectedFilter.value,
          },
        },
      ]
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import '../popup';

.navbar-subscriptions {
  width: 380px;
  @include navbar-popup-height();
  padding: 0 4px 0 4px;
  box-sizing: border-box;
  font-size: 12px;
  .be-tab-control {
    padding-top: 12px;
    height: 100%;
    box-sizing: border-box;
    .default-content {
      padding-bottom: 0;
    }
  }
  &-filter {
    @include h-stretch();
    justify-content: flex-end;
    height: 26px;
  }
}
</style>
