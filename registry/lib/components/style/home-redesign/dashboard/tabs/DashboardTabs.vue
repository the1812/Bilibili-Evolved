<template>
  <div
    v-if="visibleTabs.length"
    class="dashboard-home-tabs"
    :class="{ 'has-floating-tabs': floatingTabs, 'is-scrolling-down': scrollingDown }"
    :style="{ '--dashboard-home-tab-bar-height': `${tabBarHeight}px` }"
  >
    <div ref="tabBar" class="dashboard-home-tab-bar">
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
          <span class="default-tab-name">{{ tab.name }}</span>
        </button>
      </div>
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
import { computed, ref, watch } from 'vue'
import { sizeChange } from '@/core/observer'
import { VEmpty } from '@/ui'
import { getDashboardHomeOptions } from '../options'
import { type DashboardTab, useDashboardTabs } from './use-dashboard-tabs'

const { visibleTabs, selectedTab, selectTab } = useDashboardTabs(getDashboardHomeOptions())
const tabBar = ref<HTMLElement>()
const tabBarHeight = ref(0)
const floatingTabs = ref(false)
const scrollingDown = ref(false)
watch(
  tabBar,
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
  if (index < 0) {
    return
  }
  const rtl = getComputedStyle(tabList).direction === 'rtl'
  const previous = (index + buttons.length - 1) % buttons.length
  const next = (index + 1) % buttons.length
  const nextIndex = {
    ArrowLeft: rtl ? next : previous,
    ArrowRight: rtl ? previous : next,
    Home: 0,
    End: buttons.length - 1,
  }[event.key]
  if (nextIndex !== undefined) {
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
