const seedsToCoinsApi = `https://api.live.bilibili.com/pay/v1/Exchange/silver2coin`
// const [bCoins, coupons] = (() => {
//   const csrf = getCsrf()
//   const vipReceive = (type: number) => {
//     return async (): Promise<{ code: number, message: string }> => {
//       return await (await fetch('https://api.bilibili.com/x/vip/privilege/receive',
//         {
//           credentials: 'include',
//           headers: { 'content-type': 'application/x-www-form-urlencoded' },
//           body: `type=${type}&csrf=${csrf}`,
//           method: 'POST'
//         })).json()
//     }
//   }
//   return [vipReceive(1), vipReceive(2)]
// })()
/*
    <button
      class="gui-settings-flat-button"
      id="receive-b-coins">
      <i class="mdi mdi-24px mdi-seed-outline"></i>
      <span>领取大会员B币券</span>
    </button>
    <button
      class="gui-settings-flat-button"
      id="receive-coupons">
      <i class="mdi mdi-24px mdi-seed-outline"></i>
      <span>领取会员购优惠券</span>
    </button>
*/
export default {
  widget: {
    content: /*html*/`
    <button
      class="gui-settings-flat-button"
      id="seeds-to-coins">
      <i class="mdi mdi-24px mdi-seed-outline"></i>
      <span>瓜子换硬币</span>
    </button>`,
    condition: () => Boolean(getUID()),
    success: () => {
      const exchange = async () => {
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