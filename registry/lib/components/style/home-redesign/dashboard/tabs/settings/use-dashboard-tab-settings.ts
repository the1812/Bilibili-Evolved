import { computed, type InjectionKey } from 'vue'
import { getUID } from '@/core/utils'
import {
  dashboardHomeOptionsMetadata,
  LayoutOption,
  setDashboardOption,
  useDashboardOption,
  validateTrackCount,
} from '../../options'
import { contentCardLayouts } from '../../shared/cards/content-card'
import {
  dashboardPluginTabs,
  dashboardSettingsTabId,
  getBuiltInDashboardTabs,
  type DashboardTab,
} from '../dashboard-tabs'

export const useDashboardTabSettings = () => {
  const builtInTabs = getBuiltInDashboardTabs(getUID())
  const preferredTab = useDashboardOption('defaultTab')
  const tabOrder = useDashboardOption('tabOrder')
  const hiddenPluginTabs = useDashboardOption('hiddenPluginTabs')
  const builtInOptions = new Map(
    builtInTabs.map(tab => [
      tab.id,
      {
        tab,
        shown: tab.visibilityOption && useDashboardOption(tab.visibilityOption),
        layout: tab.layoutOption && useDashboardOption(tab.layoutOption),
        trackCount: tab.trackCountOption && useDashboardOption(tab.trackCountOption),
        groupByDate: tab.dateGroupingOption && useDashboardOption(tab.dateGroupingOption),
      },
    ]),
  )

  const orderedTabs = computed(() => {
    const pluginTabs = dashboardPluginTabs.value.filter(
      ({ id }) => typeof id === 'string' && id && !/\s/.test(id) && !builtInOptions.has(id),
    )
    const tabs = [...builtInTabs, ...lodash.uniqBy(pluginTabs, 'id')]
    const order = tabOrder.value
    const positions = new Map(order.map((id, index) => [id, index]))
    return tabs.sort(
      (a, b) => (positions.get(a.id) ?? order.length) - (positions.get(b.id) ?? order.length),
    )
  })

  const isShown = (tab: DashboardTab) =>
    builtInOptions.get(tab.id)?.shown?.value ?? !hiddenPluginTabs.value.includes(tab.id)

  const visibleTabs = computed(() => orderedTabs.value.filter(isShown))
  const defaultTab = computed(
    () =>
      visibleTabs.value.find(tab => builtInOptions.get(tab.id)?.tab.name === preferredTab.value) ??
      visibleTabs.value.find(tab => tab.id !== dashboardSettingsTabId) ??
      visibleTabs.value[0],
  )

  const getCardLayout = (tab?: DashboardTab) => {
    const settings = tab && builtInOptions.get(tab.id)
    const option = settings?.tab.layoutOption
    if (!option) {
      return tab?.fixedLayout
    }
    const value = settings.layout?.value
    const layout = Object.hasOwn(contentCardLayouts, value)
      ? value
      : dashboardHomeOptionsMetadata[option].defaultValue
    return contentCardLayouts[layout]
  }

  const getTrackCount = ({ id }: DashboardTab) => {
    const count = builtInOptions.get(id)?.trackCount?.value
    return Number.isInteger(count) && count > 0 ? validateTrackCount(count, 0) : null
  }

  const rows = computed(() =>
    orderedTabs.value.map(tab => {
      const settings = builtInOptions.get(tab.id)
      const layout = getCardLayout(tab)
      return {
        tab,
        shown: isShown(tab),
        layout: Object.values(LayoutOption).find(option => contentCardLayouts[option] === layout),
        layoutOption: settings?.tab.layoutOption,
        trackCount: getTrackCount(tab),
        trackCountOption: settings?.tab.trackCountOption,
        groupByDate: settings?.groupByDate?.value,
        dateGroupingOption: settings?.tab.dateGroupingOption,
      }
    }),
  )

  const setVisibility = (id: string, shown: boolean) => {
    const option = builtInOptions.get(id)?.tab.visibilityOption
    if (option) {
      setDashboardOption(option, shown)
    } else {
      const ids = hiddenPluginTabs.value.filter(hiddenId => hiddenId !== id)
      setDashboardOption('hiddenPluginTabs', shown ? ids : [...ids, id])
    }
  }

  const moveTab = (id: string, direction: -1 | 1) => {
    const ids = orderedTabs.value.map(tab => tab.id)
    const current = ids.indexOf(id)
    const next = current + direction
    if (current < 0 || next < 0 || next >= ids.length) {
      return undefined
    }
    ids.splice(current, 1)
    ids.splice(next, 0, id)
    setDashboardOption('tabOrder', ids)
    return next + 1
  }

  const hasCustomOrder = computed(() => tabOrder.value.length > 0)
  const resetOrder = () => setDashboardOption('tabOrder', [])

  return {
    rows,
    orderedTabs,
    isShown,
    defaultTab,
    getCardLayout,
    getTrackCount,
    setVisibility,
    moveTab,
    hasCustomOrder,
    resetOrder,
  }
}

export type DashboardTabSettingsRow = ReturnType<
  typeof useDashboardTabSettings
>['rows']['value'][number]

export const dashboardTabSettingsKey: InjectionKey<ReturnType<typeof useDashboardTabSettings>> =
  Symbol('dashboardHomeTabSettings')
