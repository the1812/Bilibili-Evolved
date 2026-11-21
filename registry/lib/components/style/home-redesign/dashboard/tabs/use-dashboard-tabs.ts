import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useDashboardOption } from '../options'
import { dashboardTabQueryParam, getDashboardTabUrl } from '../shared/urls'
import { dashboardSettingsTabId, type DashboardTab } from './dashboard-tabs'
import { useDashboardTabSettings } from './settings/use-dashboard-tab-settings'

export const useDashboardTabs = () => {
  const tabSettings = useDashboardTabSettings()
  const { orderedTabs, isShown, defaultTab } = tabSettings
  const rememberTabInUrl = useDashboardOption('rememberTabInUrl')
  const settingsFromUrl = shallowRef(false)
  const visibleTabs = computed(() =>
    orderedTabs.value.filter(
      tab => isShown(tab) || (settingsFromUrl.value && tab.id === dashboardSettingsTabId),
    ),
  )
  const selectedTab = shallowRef(defaultTab.value)

  const getTabIdFromUrl = () => new URLSearchParams(location.search).get(dashboardTabQueryParam)
  const getSettingsUrl = () => getDashboardTabUrl(location.href, dashboardSettingsTabId)
  const replaceTabInUrl = (id?: string) => {
    if (getTabIdFromUrl() !== (id ?? null)) {
      history.replaceState(history.state, '', getDashboardTabUrl(location.href, id))
    }
  }

  const syncSelectedTab = () => {
    if (rememberTabInUrl.value && !settingsFromUrl.value) {
      replaceTabInUrl(selectedTab.value === defaultTab.value ? undefined : selectedTab.value?.id)
    }
  }

  const restoreTabFromUrl = (fallback = defaultTab.value) => {
    const id = getTabIdFromUrl()
    const wasSettingsFromUrl = settingsFromUrl.value
    settingsFromUrl.value = id === dashboardSettingsTabId
    if (settingsFromUrl.value || rememberTabInUrl.value) {
      selectedTab.value = visibleTabs.value.find(tab => tab.id === id) ?? fallback
      syncSelectedTab()
    } else if (wasSettingsFromUrl) {
      selectedTab.value = defaultTab.value
    }
  }
  const restoreOnPopState = () => restoreTabFromUrl()
  restoreOnPopState()

  const selectTab = (tab: DashboardTab) => {
    if (settingsFromUrl.value && tab.id !== dashboardSettingsTabId) {
      settingsFromUrl.value = false
      if (!rememberTabInUrl.value) {
        replaceTabInUrl()
      }
    }
    selectedTab.value = tab
  }

  watch([selectedTab, defaultTab], syncSelectedTab)
  watch(rememberTabInUrl, enabled => {
    if (enabled) {
      restoreTabFromUrl(selectedTab.value ?? defaultTab.value)
    } else if (!settingsFromUrl.value) {
      replaceTabInUrl()
    }
  })
  window.addEventListener('popstate', restoreOnPopState)

  watch(visibleTabs, visible => {
    if (!visible.includes(selectedTab.value)) {
      selectedTab.value = defaultTab.value
    }
  })
  onBeforeUnmount(() => window.removeEventListener('popstate', restoreOnPopState))

  return { visibleTabs, selectedTab, selectTab, getSettingsUrl, tabSettings }
}
