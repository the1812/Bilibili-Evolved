<template>
  <div class="custom-navbar-extra-options">
    <VButton ref="button" @mouseover="loadNavbarSettings()" @click="toggleNavbarSettings()">
      布局设置<VIcon icon="right-arrow" :size="16"></VIcon>
    </VButton>
  </div>
</template>
<script lang="ts">
import type { Ref } from 'vue'
import { defineComponent, ref } from 'vue'
import { getUID } from '@/core/utils'
import { VButton, VIcon } from '@/ui'

import { loadNavbarSettings, setTriggerElement, toggleNavbarSettings } from './vm'

export default defineComponent({
  components: {
    VIcon,
    VButton,
  },
  setup: () => ({
    button: ref(null) as Ref<InstanceType<typeof VButton> | null>,
  }),
  data() {
    return {
      login: Boolean(getUID()),
    }
  },
  methods: {
    async loadNavbarSettings() {
      const isFirstLoad = await loadNavbarSettings()
      if (isFirstLoad) {
        const triggerButton = this.button.$el as HTMLElement
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
