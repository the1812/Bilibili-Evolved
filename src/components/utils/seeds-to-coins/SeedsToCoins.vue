<template>
  <DefaultWidget
    :disabled="disabled"
    name="瓜子换硬币"
    icon="coin-outline"
    class="seeds-to-coins"
    @click="exchange()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { getJsonWithCredentials } from '@/core/ajax'
import { Toast } from '@/core/toast'

export default Vue.extend({
  components: {
    DefaultWidget: () => import('@/widgets/DefaultWidget.vue').then(m => m.default),
  },
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    async exchange() {
      try {
        this.disabled = true
        const seedsToCoinsApi = 'https://api.live.bilibili.com/pay/v1/Exchange/silver2coin'
        const json = (await getJsonWithCredentials(seedsToCoinsApi)) as {
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
          Toast.success(
            `${json.message}\n剩余银瓜子:${json.data.silver}`,
            '瓜子换硬币',
            3000,
          )
        }
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>

<style lang="scss">
.seeds-to-coins .be-icon {
  transform: scale(0.8);
}
</style>
