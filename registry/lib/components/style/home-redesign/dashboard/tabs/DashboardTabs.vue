<template>
  <div v-if="visibleTabs.length" class="dashboard-home-tabs">
    <div
      class="default-tabs"
      role="tablist"
      aria-label="仪表盘首页"
      @keydown="moveTabFocus"
      @focusout="resetTabFocus"
    >
      <button
        v-for="tab in visibleTabs"
        :id="tabId(tab)"
        :key="tab.name"
        type="button"
        class="default-tab"
        :class="{ selected: tab === selectedTab }"
        role="tab"
        :aria-controls="panelId(tab)"
        :aria-selected="tab === selectedTab ? 'true' : 'false'"
        :tabindex="tab.name === tabbableTabName ? 0 : -1"
        @focus="focusedTabName = tab.name"
        @click="selectTab(tab)"
      >
        <span class="default-tab-name">{{ tab.displayName }}</span>
      </button>
    </div>
    <div
      v-for="tab in visibleTabs"
      :id="panelId(tab)"
      :key="tab.name"
      class="default-content"
      role="tabpanel"
      :aria-labelledby="tabId(tab)"
      :hidden="tab !== selectedTab"
      tabindex="0"
    >
      <transition name="content-transition">
        <component :is="tab.component" v-if="tab === selectedTab" v-bind="tab.propsData" />
      </transition>
    </div>
  </div>
  <VEmpty v-else>请在仪表盘首页设置中开启标签页</VEmpty>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { VEmpty } from '@/ui'
import { getDashboardHomeOptions } from '../options'
import { type DashboardTab, useDashboardTabs } from './use-dashboard-tabs'

const { visibleTabs, selectedTab, selectTab } = useDashboardTabs(getDashboardHomeOptions())
const focusedTabName = ref<string>()
const tabbableTabName = computed(
  () =>
    visibleTabs.value.find(tab => tab.name === focusedTabName.value)?.name ??
    selectedTab.value?.name,
)
const tabId = (tab: DashboardTab) => `dashboard-home-tab-${tab.visibilityOption}`
const panelId = (tab: DashboardTab) => `dashboard-home-panel-${tab.visibilityOption}`

const moveTabFocus = (event: KeyboardEvent) => {
  const tabList = event.currentTarget as HTMLElement
  const buttons = [...tabList.querySelectorAll<HTMLButtonElement>('button')]
  const index = buttons.indexOf(event.target as HTMLButtonElement)
  const nextIndex = {
    ArrowLeft: (index + buttons.length - 1) % buttons.length,
    ArrowRight: (index + 1) % buttons.length,
    Home: 0,
    End: buttons.length - 1,
  }[event.key]
  if (index >= 0 && nextIndex !== undefined) {
    event.preventDefault()
    buttons[nextIndex].focus()
  }
}

const resetTabFocus = (event: FocusEvent) => {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    focusedTabName.value = undefined
  }
}
</script>
