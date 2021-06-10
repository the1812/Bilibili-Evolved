<template>
  <div class="navbar-subscriptions">
    <TabControl ref="tabControl" :tabs="tabs" :more-link="moreLink"></TabControl>
  </div>
</template>
<script lang="ts">
import { TabControl } from '@/ui'
import { TabMappings, TabMapping } from '@/ui/tab-mapping'
import { getUID } from '@/core/utils'
import { popperMixin } from '../mixins'
import { SubscriptionTypes } from './subscriptions'

export default Vue.extend({
  components: {
    TabControl,
  },
  mixins: [popperMixin],
  data() {
    const uid = getUID()
    return {
      moreLink: (tab: TabMapping) => `https://space.bilibili.com/${uid}/${tab.name}`,
      tabs: [
        {
          name: SubscriptionTypes.bangumi,
          displayName: '追番',
          activeLink: `https://space.bilibili.com/${uid}/bangumi`,
          component: () => import('./BangumiSubscriptions.vue').then(m => m.default),
        },
        {
          name: SubscriptionTypes.cinema,
          displayName: '追剧',
          activeLink: `https://space.bilibili.com/${uid}/cinema`,
          component: () => import('./CinemaSubscriptions.vue').then(m => m.default),
        },
      ] as TabMappings,
    }
  },
})
</script>
<style lang="scss">
.navbar-subscriptions {
  width: 380px;
  height: 600px;
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
}
</style>
