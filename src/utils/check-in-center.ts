interface CheckInItem {
  id: string
  icon: string
  name: string
  action: (button: HTMLButtonElement, event: MouseEvent) => Promise<void>
}
const checkInItems: CheckInItem[] = [
  {
    id: 'seeds-to-coins',
    icon: 'mdi-seed-outline',
    name: '瓜子换硬币',
    action: async () => {
      const seedsToCoinsApi = 'https://api.live.bilibili.com/pay/v1/Exchange/silver2coin'
      const json = await Ajax.getJsonWithCredentials(seedsToCoinsApi) as {
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
    }
  },
  {
    id: 'live-check-in',
    icon: 'mdi-calendar-check',
    name: '直播间签到',
    action: async () => {
      const liveCheckInApi = 'https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign'
      const json = await Ajax.getJsonWithCredentials(liveCheckInApi) as {
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
    }
  },
]
export default {
  widget: {
    content: checkInItems.map(item => {
      return /*html*/`
        <button
          class="gui-settings-flat-button"
          id="${item.id}">
          <i class="mdi mdi-24px ${item.icon}"></i>
          <span>${item.name}</span>
        </button>
      `
    }).join('\n'),
    condition: () => Boolean(getUID()),
    success: () => {
      checkInItems.forEach(item => {
        const button = document.getElementById(item.id) as HTMLButtonElement
        if (!button) {
          return
        }
        button.addEventListener('click', e => {
          try {
            button.disabled = true
            item.action(button, e)
          } finally {
            button.disabled = false
          }
        })
      })
    },
  },
}
