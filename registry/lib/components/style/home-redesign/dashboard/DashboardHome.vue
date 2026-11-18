<template>
  <HomeRedesignBase>
    <div
      class="dashboard-home"
      :style="{ '--dashboard-home-column-count-override': columnCount > 0 ? columnCount : null }"
    >
      <TabControl
        v-if="visibleTabs.length"
        :key="tabControlVersion"
        class="dashboard-home-tabs"
        :default-tab="dashboardHomeOptions.defaultTab"
        :tabs="visibleTabs"
        @change="rememberSelectedLink"
      />
      <VEmpty v-else>请在仪表盘首页设置中开启标签页</VEmpty>
    </div>
  </HomeRedesignBase>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { TabControl, VEmpty } from '@/ui'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { getDashboardHomeOptions, useDashboardOption } from './options'
import { useDashboardTabs } from './tabs/use-dashboard-tabs'

const dashboardHomeOptions = getDashboardHomeOptions()
const { visibleTabs, tabControlVersion, rememberSelectedLink } =
  useDashboardTabs(dashboardHomeOptions)
const columnCount = useDashboardOption('columnCount')
const showWatchlater = useDashboardOption('enableWatchlater')

const watchlaterDisabledClass = 'dashboard-home-watchlater-disabled'
watch(
  showWatchlater,
  enabled => document.documentElement.classList.toggle(watchlaterDisabledClass, !enabled),
  { immediate: true },
)
onBeforeUnmount(() => document.documentElement.classList.remove(watchlaterDisabledClass))
</script>
