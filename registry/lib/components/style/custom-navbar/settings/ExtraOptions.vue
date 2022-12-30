<template>
  <div class="custom-navbar-extra-options">
    <VButton
      v-if="login"
      ref="button"
      @mouseover="loadNavbarSettings()"
      @click="toggleNavbarSettings()"
    >
      布局设置<VIcon icon="right-arrow" :size="16"></VIcon>
    </VButton>
  </div>
</template>
<script lang="ts">
import { getUID } from '@/core/utils'
import { VIcon, VButton } from '@/ui'
import { setTriggerElement, loadNavbarSettings, toggleNavbarSettings } from './vm'

export default Vue.extend({
  components: {
    VIcon,
    VButton,
  },
  data() {
    return {
      login: Boolean(getUID()),
    }
  },
  methods: {
    async loadNavbarSettings() {
      const isFirstLoad = await loadNavbarSettings()
      if (isFirstLoad) {
        const triggerButton = this.$refs.button.$el as HTMLElement
        setTriggerElement(triggerButton)
      }
    },
    toggleNavbarSettings,
  },
})
</script>
<style lang="scss">
.custom-navbar-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
