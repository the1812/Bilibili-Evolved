<template>
  <section class="dashboard-home-tab-settings" aria-labelledby="dashboard-home-tab-settings-title">
    <header class="dashboard-home-tab-settings-header">
      <h2 id="dashboard-home-tab-settings-title">标签页设置</h2>
      <button
        type="button"
        class="dashboard-home-action"
        :aria-disabled="hasCustomOrder ? undefined : 'true'"
        @click="restoreOrder"
      >
        恢复默认顺序
      </button>
    </header>
    <div
      class="dashboard-home-tab-settings-scroll"
      role="region"
      aria-labelledby="dashboard-home-tab-settings-title"
      tabindex="0"
    >
      <table aria-labelledby="dashboard-home-tab-settings-title">
        <thead>
          <tr>
            <th scope="col">标签页</th>
            <th scope="col">显示</th>
            <th scope="col">卡片布局</th>
            <th scope="col">行列数</th>
            <th scope="col">按日期分组</th>
            <th scope="col">排序</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="row.tab.id">
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
              <span v-else>{{ row.layout ?? '—' }}</span>
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
              <span v-else>—</span>
            </td>
            <td>
              <input
                v-if="row.dateGroupingOption"
                type="checkbox"
                :checked="row.groupByDate"
                :aria-label="'「' + row.tab.name + '」按日期分组'"
                @change="changeDateGrouping(row, $event)"
              />
              <span v-else>—</span>
            </td>
            <td>
              <div class="dashboard-home-tab-settings-order">
                <button
                  type="button"
                  class="dashboard-home-action"
                  :aria-label="'上移「' + row.tab.name + '」'"
                  :aria-disabled="index === 0 ? 'true' : undefined"
                  @click="moveRow(row, -1, $event)"
                >
                  上移
                </button>
                <button
                  type="button"
                  class="dashboard-home-action"
                  :aria-label="'下移「' + row.tab.name + '」'"
                  :aria-disabled="index === rows.length - 1 ? 'true' : undefined"
                  @click="moveRow(row, 1, $event)"
                >
                  下移
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <span class="dashboard-home-visually-hidden" role="status">{{ orderStatus }}</span>
  </section>
</template>

<script setup lang="ts">
import { inject, nextTick, ref } from 'vue'
import { LayoutOption, maxTrackCount, setDashboardOption, validateTrackCount } from '../../options'
import { dashboardTabSettingsKey, type DashboardTabSettingsRow } from './use-dashboard-tab-settings'

const { rows, hasCustomOrder, moveTab, resetOrder, setVisibility } = inject(dashboardTabSettingsKey)
const layouts = Object.values(LayoutOption)
const orderStatus = ref('')

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

const moveRow = async ({ tab }: DashboardTabSettingsRow, direction: -1 | 1, event: MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement
  const restoreFocus = document.activeElement === button
  const position = moveTab(tab.id, direction)
  if (position === undefined) {
    return
  }
  orderStatus.value = `${tab.name}已移至第 ${position} 位`
  await nextTick()
  if (restoreFocus && button.isConnected && document.activeElement === document.body) {
    button.focus()
  }
}

const restoreOrder = () => {
  if (hasCustomOrder.value) {
    resetOrder()
    orderStatus.value = '已恢复默认顺序'
  }
}
</script>
