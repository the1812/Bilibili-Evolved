<template>
  <section class="dashboard-home-tab-settings" aria-label="仪表盘设置">
    <DashboardGeneralSettings />
    <div
      class="dashboard-home-tab-settings-scroll"
      role="region"
      aria-labelledby="dashboard-home-tab-settings-title"
      tabindex="0"
    >
      <table aria-labelledby="dashboard-home-tab-settings-title">
        <thead>
          <tr>
            <th scope="col">
              <span
                id="dashboard-home-tab-settings-title"
                class="dashboard-home-tab-settings-heading"
              >
                <VIcon icon="mdi-tab" :size="20" aria-hidden="true" />
                标签页设置
              </span>
            </th>
            <th scope="col">显示</th>
            <th scope="col">卡片布局</th>
            <th scope="col">行列数</th>
            <th scope="col">按日期分组</th>
            <th scope="col">排序</th>
          </tr>
        </thead>
        <tbody ref="tableBody">
          <tr v-for="(row, index) in rows" :key="row.tab.id" :data-tab-id="row.tab.id">
            <th scope="row">{{ row.tab.name }}</th>
            <td>
              <input
                type="checkbox"
                :checked="row.shown"
                :aria-label="'显示「' + row.tab.name + '」'"
                @change="changeVisibility(row, $event)"
              />
            </td>
            <td>
              <select
                v-if="row.layoutOption"
                :value="row.layout"
                :aria-label="'「' + row.tab.name + '」卡片布局'"
                @change="changeLayout(row, $event)"
              >
                <option v-for="layout in layouts" :key="layout" :value="layout">
                  {{ layout }}
                </option>
              </select>
              <span v-else-if="row.layout">{{ row.layout }}</span>
            </td>
            <td>
              <input
                v-if="row.trackCountOption"
                class="dashboard-home-tab-settings-track-count"
                type="number"
                min="0"
                :max="maxTrackCount"
                step="1"
                :value="row.trackCount ?? ''"
                :aria-label="'「' + row.tab.name + '」的行列数，留空或设为 0 时自动计算'"
                placeholder="自动"
                @change="changeTrackCount(row, $event)"
              />
            </td>
            <td>
              <input
                v-if="row.dateGroupingOption"
                type="checkbox"
                :checked="row.groupByDate"
                :aria-label="'「' + row.tab.name + '」按日期分组'"
                @change="changeDateGrouping(row, $event)"
              />
            </td>
            <td>
              <div class="dashboard-home-tab-settings-order">
                <span
                  v-if="dragEnabled"
                  class="dashboard-home-tab-settings-drag-handle"
                  title="拖动排序"
                  aria-hidden="true"
                >
                  <VIcon icon="mdi-drag-vertical" />
                </span>
                <button
                  type="button"
                  class="dashboard-home-action"
                  title="上移"
                  :aria-label="'上移「' + row.tab.name + '」'"
                  :aria-disabled="index === 0 ? 'true' : undefined"
                  @click="moveRow(row, -1, $event)"
                >
                  <VIcon icon="mdi-arrow-up" :size="16" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="dashboard-home-action"
                  title="下移"
                  :aria-label="'下移「' + row.tab.name + '」'"
                  :aria-disabled="index === rows.length - 1 ? 'true' : undefined"
                  @click="moveRow(row, 1, $event)"
                >
                  <VIcon icon="mdi-arrow-down" :size="16" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer class="dashboard-home-tab-settings-actions">
      <button
        type="button"
        class="dashboard-home-action"
        :aria-disabled="hasCustomOrder ? undefined : 'true'"
        @click="restoreOrder"
      >
        <VIcon icon="mdi-sort-variant" :size="16" aria-hidden="true" />
        恢复默认顺序
      </button>
      <button type="button" class="dashboard-home-action" @click="restoreSettings">
        <VIcon icon="mdi-restore" :size="16" aria-hidden="true" />
        恢复全部默认设置
      </button>
    </footer>
    <span class="dashboard-home-visually-hidden" role="status">{{ settingsStatus }}</span>
  </section>
</template>

<script setup lang="ts">
import type Sortable from 'sortablejs'
import type { SortableEvent } from 'sortablejs'
import { inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { SortableJSLibrary } from '@/core/runtime-library'
import { VIcon } from '@/ui'
import {
  LayoutOption,
  maxTrackCount,
  resetDashboardOptions,
  setDashboardOption,
  validateTrackCount,
} from '../../options'
import DashboardGeneralSettings from './DashboardGeneralSettings.vue'
import { dashboardTabSettingsKey, type DashboardTabSettingsRow } from './use-dashboard-tab-settings'

const { rows, hasCustomOrder, moveTab, resetOrder, setVisibility } = inject(dashboardTabSettingsKey)
const layouts = Object.values(LayoutOption)
const settingsStatus = ref('')
const tableBody = ref<HTMLTableSectionElement>()
const dragEnabled = ref(false)
let sortable: Sortable

const changeVisibility = ({ tab }: DashboardTabSettingsRow, event: Event) => {
  setVisibility(tab.id, (event.currentTarget as HTMLInputElement).checked)
}

const changeLayout = ({ layoutOption }: DashboardTabSettingsRow, event: Event) => {
  const value = (event.currentTarget as HTMLSelectElement).value as LayoutOption
  if (layoutOption && layouts.includes(value)) {
    setDashboardOption(layoutOption, value)
  }
}

const changeTrackCount = (
  { trackCountOption, trackCount }: DashboardTabSettingsRow,
  event: Event,
) => {
  if (!trackCountOption) {
    return
  }
  const input = event.currentTarget as HTMLInputElement
  const value = input.value === '' && !input.validity.badInput ? 0 : input.valueAsNumber
  const count = validateTrackCount(value, trackCount ?? 0)
  setDashboardOption(trackCountOption, count)
  input.value = count ? String(count) : ''
}

const changeDateGrouping = ({ dateGroupingOption }: DashboardTabSettingsRow, event: Event) => {
  if (dateGroupingOption) {
    setDashboardOption(dateGroupingOption, (event.currentTarget as HTMLInputElement).checked)
  }
}

const announceMove = ({ tab }: DashboardTabSettingsRow, offset: number) => {
  const position = moveTab(tab.id, offset)
  if (position !== undefined) {
    settingsStatus.value = `${tab.name}已移至第 ${position} 位`
  }
}

const moveRow = async (row: DashboardTabSettingsRow, direction: -1 | 1, event: MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement
  const restoreFocus = document.activeElement === button
  announceMove(row, direction)
  await nextTick()
  if (restoreFocus && button.isConnected && document.activeElement === document.body) {
    button.focus()
  }
}

const restoreOrder = () => {
  if (hasCustomOrder.value) {
    resetOrder()
    settingsStatus.value = '已恢复默认顺序'
  }
}

const restoreSettings = () => {
  if (window.confirm('将仪表盘的全部设置恢复为默认值，包括标签页顺序和显示状态？')) {
    resetDashboardOptions()
    settingsStatus.value = '仪表盘的全部设置已恢复为默认值'
  }
}

const finishDrag = async ({ from, item, oldIndex, newIndex }: SortableEvent) => {
  if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
    return
  }
  const row = rows.value[oldIndex]
  // Restore Vue's previous DOM order before applying the saved order through keyed rows.
  const previousSibling = from.children[oldIndex + (newIndex < oldIndex ? 1 : 0)]
  from.insertBefore(item, previousSibling ?? null)
  if (row?.tab.id === item.dataset.tabId) {
    announceMove(row, newIndex - oldIndex)
    await nextTick()
    if (item.isConnected) {
      item.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }
}

onMounted(async () => {
  const Sortable = await SortableJSLibrary.then(
    library => library,
    () => undefined,
  ).catch(error => {
    console.warn('Dashboard Home tab dragging is unavailable', error)
    return undefined
  })
  const body = tableBody.value
  if (Sortable && body?.isConnected) {
    sortable = Sortable.create(body, {
      draggable: 'tr',
      handle: '.dashboard-home-tab-settings-drag-handle',
      ghostClass: 'dashboard-home-tab-settings-drag-target',
      direction: 'vertical',
      onEnd: finishDrag,
    })
    dragEnabled.value = true
  }
})

onBeforeUnmount(() => sortable?.destroy())
</script>
