const api = `https://api.live.bilibili.com/pay/v1/Exchange/silver2coin`
export default {
  widget: {
    content: /*html*/`
    <button
      class="gui-settings-flat-button"
      id="seeds-to-coins">
      <i class="mdi mdi-24px mdi-seed-outline"></i>
      <span>瓜子换硬币</span>
    </button>`,
    success: () => {
      const exchange = async () => {
        const json = await Ajax.getJsonWithCredentials(api) as {
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
      const button = dq('#seeds-to-coins') as HTMLButtonElement
      button.addEventListener('click', async () => {
        try {
          button.disabled = true
          await exchange()
        } finally {
          button.disabled = false
        }
      })
    },
  },
}