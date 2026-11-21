import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { getUID } from '@/core/utils'
import { dashboardHomeOptionsMetadata, useDashboardOption, validateTrackCount } from '../options'
import { contentCardLayouts, type ContentCardLayout } from '../shared/cards/content-card'
import { getDashboardTabs, type DashboardTab } from './dashboard-tabs'

const tabQueryParam = 'dashboardTab'

export const useDashboardTabs = () => {
  const tabs = getDashboardTabs(getUID())
  const rememberTabInUrl = useDashboardOption('rememberTabInUrl')
  const preferredTab = useDashboardOption('defaultTab')
  const tabVisibility = tabs.map(tab => ({ tab, shown: useDashboardOption(tab.visibilityOption) }))
  const visibleTabs = computed(() =>
    tabVisibility.filter(({ shown }) => shown.value).map(({ tab }) => tab),
  )
  const defaultTab = computed(
    () => visibleTabs.value.find(tab => tab.name === preferredTab.value) ?? visibleTabs.value[0],
  )
  const selectedTab = shallowRef(defaultTab.value)

  const getTabFromUrl = () => {
    const id = new URLSearchParams(location.search).get(tabQueryParam)
    return visibleTabs.value.find(tab => tab.id === id)
  }
  const replaceTabInUrl = (tab?: DashboardTab) => {
    const url = new URL(location.href)
    const id = tab && tab !== defaultTab.value ? tab.id : null
    if (url.searchParams.get(tabQueryParam) === id) {
      return
    }
    if (id) {
      url.searchParams.set(tabQueryParam, id)
    } else {
      url.searchParams.delete(tabQueryParam)
    }
    history.replaceState(history.state, '', url.href)
  }
  const restoreTabFromUrl = () => {
    if (!rememberTabInUrl.value) {
      return
    }
    selectedTab.value = getTabFromUrl() ?? defaultTab.value
    replaceTabInUrl(selectedTab.value)
  }
  restoreTabFromUrl()

  watch([selectedTab, defaultTab], () => {
    if (rememberTabInUrl.value) {
      replaceTabInUrl(selectedTab.value)
    }
  })
  watch(rememberTabInUrl, enabled => {
    if (enabled) {
      selectedTab.value = getTabFromUrl() ?? selectedTab.value
      replaceTabInUrl(selectedTab.value)
    } else {
      replaceTabInUrl()
    }
  })
  window.addEventListener('popstate', restoreTabFromUrl)

  watch(visibleTabs, visible => {
    if (!visible.includes(selectedTab.value)) {
      selectedTab.value = defaultTab.value
    }
  })
  onBeforeUnmount(() => window.removeEventListener('popstate', restoreTabFromUrl))

  const layoutOptions = new Map(
    tabs.flatMap(({ layoutOption }) =>
      layoutOption ? [[layoutOption, useDashboardOption(layoutOption)] as const] : [],
    ),
  )
  const trackCountOptions = new Map(
    tabs.flatMap(({ trackCountOption }) =>
      trackCountOption ? [[trackCountOption, useDashboardOption(trackCountOption)] as const] : [],
    ),
  )
  const getCardLayout = (tab?: DashboardTab): ContentCardLayout | undefined => {
    const layoutOption = tab?.layoutOption
    if (!layoutOption) {
      return tab?.fixedLayout
    }
    const option = layoutOptions.get(layoutOption)?.value
    const layout = Object.hasOwn(contentCardLayouts, option)
      ? option
      : dashboardHomeOptionsMetadata[layoutOption].defaultValue
    return contentCardLayouts[layout]
  }
  const getTrackCount = ({ trackCountOption }: DashboardTab) => {
    const count = trackCountOptions.get(trackCountOption)?.value
    return Number.isInteger(count) && count > 0 && count === validateTrackCount(count, 0)
      ? count
      : null
  }
  return { visibleTabs, selectedTab, getCardLayout, getTrackCount }
}
