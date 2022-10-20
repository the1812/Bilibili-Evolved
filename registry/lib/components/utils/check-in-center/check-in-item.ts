import { postTextWithCredentials, getJsonWithCredentials } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { formData, getCsrf } from '@/core/utils'
import { registerAndGetData } from '@/plugins/data'

export interface CheckInItem {
  name: string
  displayName: string
  icon: string
  action: (button: HTMLDivElement, event: MouseEvent) => Promise<void>
  disabled?: boolean
}
const builtInItems: CheckInItem[] = [
  {
    name: 'seeds-to-coins',
    displayName: '瓜子换硬币',
    icon: 'mdi-seed-outline',
    action: async () => {
      const seedsToCoinsApi = 'https://api.live.bilibili.com/xlive/revenue/v1/wallet/silver2coin'
      const text = await postTextWithCredentials(
        seedsToCoinsApi,
        formData({
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
      } else {
        Toast.success(`${json.message}\n剩余银瓜子:${json.data.silver}`, '瓜子换硬币', 3000)
      }
    },
  },
  {
    name: 'live-check-in',
    displayName: '直播间签到',
    icon: 'mdi-calendar-check',
    action: async () => {
      const liveCheckInApi = 'https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign'
      const json = (await getJsonWithCredentials(liveCheckInApi)) as {
        code: number
        message: string
        data: {
          text: string
          specialText: string
          allDays: number
          hadSignDays: number
          isBonusDay: number
        }
      }
      if (json.code !== 0) {
        Toast.info(json.message, '直播间签到', 3000)
      } else {
        const { text, specialText, allDays, hadSignDays } = json.data
        const message = `签到成功, 获得了${text} ${specialText}\n本月进度: ${hadSignDays} / ${allDays}`
        Toast.success(message, '直播间签到', 3000)
      }
    },
  },
]
export const [checkInItems] = registerAndGetData('checkInCenter.items', builtInItems)
