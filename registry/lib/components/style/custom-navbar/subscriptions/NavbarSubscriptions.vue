<template>
  <div ref="el" class="navbar-subscriptions">
    <TabControl ref="tabControl" :tabs="tabs" :more-link="moreLink"></TabControl>
  </div>
</template>
<script lang="ts">
import type { Ref } from 'vue'
import { defineComponent, ref } from 'vue'
import { getUID } from '@/core/utils'
import { TabControl } from '@/ui'
import type { TabMapping, TabMappings } from '@/ui/tab-mapping'

import { popupProps, usePopup } from '../mixins'
import { SubscriptionTypes } from './subscriptions'

export default defineComponent({
  components: {
    TabControl,
  },
  props: popupProps,
  setup: props => ({
    ...usePopup(props),
    tabControl: ref(null) as Ref<InstanceType<typeof TabControl> | null>,
  }),
  data() {
    const uid = getUID()
    return {
      moreLink: (tab: TabMapping) => `https://space.bilibili.com/${uid}/${tab.name}`,
      tabs: [
        {
          name: SubscriptionTypes.Bangumi,
          displayName: '追番',
          activeLink: `https://space.bilibili.com/${uid}/bangumi`,
          component: () => import('./BangumiSubscriptions.vue').then(m => m.default),
        },
        {
          name: SubscriptionTypes.Cinema,
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
}
</style>
