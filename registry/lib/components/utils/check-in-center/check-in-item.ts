import { postTextWithCredentials } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { getCsrf } from '@/core/utils'
import { registerAndGetData } from '@/plugins/data'
import { getComponentSettings } from '@/core/settings'
import { CheckInOptions } from './options'

export const getCheckInOptions = () => getComponentSettings<CheckInOptions>('checkInCenter').options

export interface CheckInItem {
  name: string
  displayName: string
  icon: string
  autoRunKey: keyof CheckInOptions
  lastRunKey: keyof CheckInOptions
  action: (button: HTMLDivElement, event: MouseEvent) => Promise<void>
  disabled?: boolean
}
const builtInItems: CheckInItem[] = [
  {
    name: 'seeds-to-coins',
    displayName: '瓜子换硬币',
    icon: 'mdi-seed-outline',
    autoRunKey: 'autoSeedsToCoins',
    lastRunKey: 'lastSeedsToCoins',
    action: async () => {
      const seedsToCoinsApi = 'https://api.live.bilibili.com/xlive/revenue/v1/wallet/silver2coin'
      const text = await postTextWithCredentials(
        seedsToCoinsApi,
        new URLSearchParams({
          csrf: getCsrf(),
          csrf_token: getCsrf(),
        }),
      )
      const json = JSON.parse(text) as {
        code: number
        message: string
        data: {
          gold: string
          silver: string
          coin: number
        }
      }
      if (json.code !== 0) {
        Toast.info(json.message, '瓜子换硬币', 3000)
        if (json.message === '每天最多能兑换 1 个') {
          getCheckInOptions().lastSeedsToCoins = Number(new Date())
        }
      } else {
        Toast.success(`${json.message}\n剩余银瓜子:${json.data.silver}`, '瓜子换硬币', 3000)
        getCheckInOptions().lastSeedsToCoins = Number(new Date())
      }
    },
  },
]
export const [checkInItems] = registerAndGetData('checkInCenter.items', builtInItems)
