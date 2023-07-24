<template>
  <div>
    <div class="custom-black-list-extra-options">
      <VButton ref="button" @mouseover="setBlackListProps" @click="toggleBlackList">
        黑名单
        <VIcon icon="right-arrow" :size="16" />
      </VButton>
    </div>
  </div>
</template>
<script lang="ts">
import { VIcon, VButton } from '@/ui'
import { loadBlackList, setBlackListProps, toggleBlackList } from './vm'

export default Vue.extend({
  components: {
    VIcon,
    VButton,
  },
  data() {
    return {
      isFirstLoad: false,
    }
  },
  methods: {
    toggle() {
      this.$refs.popup.toggle()
    },
    async setBlackListProps() {
      if (this.isFirstLoad) {
        return
      }
      this.isFirstLoad = await loadBlackList()
      if (this.isFirstLoad) {
        const triggerButton = this.$refs.button.$el as HTMLElement
        setBlackListProps(triggerButton)
      }
    },
    toggleBlackList,
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
