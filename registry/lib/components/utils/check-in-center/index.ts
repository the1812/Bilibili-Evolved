import Vue from 'vue'
import { defineComponentMetadata } from '@/components/define'
import { getUID } from '@/core/utils'
import { checkInOptions } from './options'
import { CheckInItem, checkInItems, getCheckInOptions } from './check-in-item'

const shouldAutoRun = (item: CheckInItem): boolean => {
  const opts = getCheckInOptions()
  const auto = opts[item.autoRunKey] // 布尔值
  if (!auto) {
    return false
  }
  const last = Number(opts[item.lastRunKey])
  return new Date(last).toDateString() !== new Date().toDateString()
}

export const component = defineComponentMetadata({
  name: 'checkInCenter',
  displayName: '签到助手',
  tags: [componentsTags.utils],
  options: checkInOptions,
  entry: async () => {
    for (const item of checkInItems) {
      if (shouldAutoRun(item)) {
        try {
          Vue.set(item, 'disabled', true)
          await item.action(document.createElement('div'), new MouseEvent('click'))
        } catch (error) {
          console.error(`${item.displayName} 自动执行请求失败`, error)
        } finally {
          item.disabled = false
        }
      }
    }
  },
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
    condition: () => Boolean(getUID()),
  },
})
