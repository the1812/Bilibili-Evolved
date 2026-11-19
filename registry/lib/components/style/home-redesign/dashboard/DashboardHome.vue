<template>
  <HomeRedesignBase>
    <div
      class="dashboard-home"
      :style="{ '--dashboard-home-column-count-override': columnCount > 0 ? columnCount : null }"
    >
      <DashboardTabs />
    </div>
  </HomeRedesignBase>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { useDashboardOption } from './options'
import DashboardTabs from './tabs/DashboardTabs.vue'

const columnCount = useDashboardOption('columnCount')
const showWatchlater = useDashboardOption('showWatchlater')

const watchlaterDisabledClass = 'dashboard-home-watchlater-disabled'
watch(
  showWatchlater,
  enabled => document.documentElement.classList.toggle(watchlaterDisabledClass, !enabled),
  { immediate: true },
)
onBeforeUnmount(() => document.documentElement.classList.remove(watchlaterDisabledClass))
</script>
