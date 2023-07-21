<template>
  <div>
    <div class="custom-black-list-extra-options">
      <VButton v-if="login" ref="button" @mouseover="setblackListProps" @click="toggleblackList">
        黑名单
        <VIcon icon="right-arrow" :size="16" />
      </VButton>
    </div>
  </div>
</template>
<script lang="ts">
import { getUID } from '@/core/utils'
import { VIcon, VButton } from '@/ui'

import { loadblackList, setblackListProps, toggleblackList } from './vm'

export default Vue.extend({
  components: {
    VIcon,
    VButton,
  },
  data() {
    return {
      isFirstLoad: false,
      login: Boolean(getUID()),
    }
  },
  methods: {
    async setblackListProps() {
      if (this.isFirstLoad) {
        return
      }
      this.isFirstLoad = await loadblackList()
      if (this.isFirstLoad) {
        const triggerButton = this.$refs.button.$el as HTMLElement
        setblackListProps(triggerButton)
      }
    },
    toggleblackList,
  },
})
</script>
<style lang="scss">
.custom-black-list-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
