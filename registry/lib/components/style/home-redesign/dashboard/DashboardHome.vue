<template>
  <HomeRedesignBase>
    <div
      class="dashboard-home"
      :class="{ 'hide-watchlater': !showWatchlater }"
      :style="{ '--dashboard-home-column-count-override': columnCount > 0 ? columnCount : null }"
    >
      <DashboardTabs />
    </div>
  </HomeRedesignBase>
</template>

<script setup lang="ts">
import HomeRedesignBase from '../HomeRedesignBase.vue'
import { useDashboardOption } from './options'
import DashboardTabs from './tabs/DashboardTabs.vue'

const columnCount = useDashboardOption('columnCount')
const showWatchlater = useDashboardOption('showWatchlater')
</script>
