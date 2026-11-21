<template>
  <div
    v-if="visibleTabs.length"
    class="dashboard-home-tabs"
    :class="{ 'has-floating-tabs': floatingTabs, 'is-scrolling-down': scrollingDown }"
    :style="{ '--dashboard-home-tab-bar-block-size': `${tabBarHeight}px` }"
  >
    <div ref="tabBarElement" class="dashboard-home-tab-bar">
      <div
        class="dashboard-home-tab-list"
        role="tablist"
        aria-label="仪表盘首页"
        @keydown="handleTabKeydown"
        @focusout="resetTabFocus"
      >
        <button
          v-for="tab in visibleTabs"
          :id="getTabId(tab)"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-controls="getPanelId(tab)"
          :aria-selected="tab === selectedTab ? 'true' : 'false'"
          :tabindex="tab.id === tabbableTabId ? 0 : -1"
          @focus="focusedTabId = tab.id"
          @click="selectTab(tab, $event)"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>
    <div
      v-for="tab in visibleTabs"
      :id="getPanelId(tab)"
      :key="tab.id"
      :data-content-card-layout="getCardLayout(tab)"
      :class="{ 'has-manual-card-count': getTrackCount(tab) }"
      :style="{ '--dashboard-home-card-track-count': getTrackCount(tab) }"
      role="tabpanel"
      :aria-labelledby="getTabId(tab)"
      :hidden="tab !== selectedTab"
      :tabindex="tab === selectedTab ? 0 : undefined"
    >
      <transition name="dashboard-home-panel">
        <component :is="tab.component" v-if="tab === selectedTab" v-bind="tab.propsData" />
      </transition>
    </div>
  </div>
  <VEmpty v-else>请在仪表盘首页设置中开启标签页</VEmpty>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { sizeChange } from '@/core/observer'
import { VEmpty } from '@/ui'
import { contentCardLayoutKey } from '../shared/cards/content-card'
import type { DashboardTab } from './dashboard-tabs'
import { useDashboardTabs } from './use-dashboard-tabs'

const emit = defineEmits<{ (event: 'open-link', url: string, clickEvent: MouseEvent): void }>()
const { visibleTabs, selectedTab, getCardLayout, getTrackCount } = useDashboardTabs()
const tabBarElement = ref<HTMLElement>()
const tabBarHeight = ref(0)
const floatingTabs = ref(false)
const scrollingDown = ref(false)

const focusedTabId = ref<string>()
const tabbableTabId = computed(
  () => visibleTabs.value.find(tab => tab.id === focusedTabId.value)?.id ?? selectedTab.value?.id,
)
const getTabId = (tab: DashboardTab) => `dashboard-home-tab-${tab.id}`
const getPanelId = (tab: DashboardTab) => `dashboard-home-panel-${tab.id}`

const selectTab = (tab: DashboardTab, event: MouseEvent) => {
  if (tab === selectedTab.value && tab.activeLink) {
    emit('open-link', tab.activeLink, event)
  }
  selectedTab.value = tab
}

const handleTabKeydown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }
  // Holding Enter should activate a tab once, even when reselecting it opens a link.
  if (event.key === 'Enter' && event.repeat) {
    event.preventDefault()
    return
  }
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    return
  }

  const tabList = event.currentTarget as HTMLElement
  const buttons = [...tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
  const focusedIndex = buttons.indexOf(event.target as HTMLButtonElement)
  if (focusedIndex < 0) {
    return
  }
  const rtl = getComputedStyle(tabList).direction === 'rtl'
  const previousIndex = (focusedIndex + buttons.length - 1) % buttons.length
  const followingIndex = (focusedIndex + 1) % buttons.length
  const nextIndex = {
    ArrowLeft: rtl ? followingIndex : previousIndex,
    ArrowRight: rtl ? previousIndex : followingIndex,
    Home: 0,
    End: buttons.length - 1,
  }[event.key]
  event.preventDefault()
  buttons[nextIndex].focus()
}

const resetTabFocus = (event: FocusEvent) => {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    focusedTabId.value = undefined
  }
}

provide(
  contentCardLayoutKey,
  computed(() => getCardLayout(selectedTab.value)),
)

watch(
  tabBarElement,
  (bar, _, onCleanup) => {
    if (!bar) {
      return
    }
    let lastScrollY = Math.max(0, window.scrollY)
    scrollingDown.value = false

    const updateScrollState = () => {
      const scrollY = Math.max(0, window.scrollY)
      const stickyTop = parseFloat(getComputedStyle(bar).insetBlockStart)
      floatingTabs.value = scrollY > 0 && bar.getBoundingClientRect().top <= stickyTop
      if (scrollY !== lastScrollY) {
        scrollingDown.value = scrollY > lastScrollY
        lastScrollY = scrollY
      }
    }
    const measureTabBar = () => {
      tabBarHeight.value = bar.getBoundingClientRect().height
      updateScrollState()
    }
    measureTabBar()
    const [observer] = sizeChange(bar, measureTabBar)
    window.addEventListener('scroll', updateScrollState, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    })
  },
  { flush: 'post' },
)
</script>
