<template>
  <VButton :disabled="disabled" class="check-all-updates" @click="checkUpdates()">
    <VIcon :size="16" icon="mdi-cloud-sync-outline" />
    立即检查所有更新
  </VButton>
</template>
<script lang="ts">
import { Toast } from '@/core/toast'
import { VButton, VIcon } from '@/ui'
import { forceCheckUpdateAndReload } from './checker'

export default Vue.extend({
  components: {
    VButton,
    VIcon,
  },
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    async checkUpdates() {
      try {
        this.disabled = true
        const toast = Toast.info('正在检查更新...', '检查所有更新')
        await forceCheckUpdateAndReload()
        toast.close()
      } finally {
        this.disabled = false
      }
    },
  },
})
</script>
<style lang="scss" scoped>
.check-all-updates {
  margin: 1px 0;
  .be-icon {
    margin-right: 6px;
  }
}
</style>
