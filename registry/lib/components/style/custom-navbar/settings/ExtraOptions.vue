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

let navbarSettingsVM: Vue & {
  toggle: () => void
}
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
      if (navbarSettingsVM) {
        return
      }
      const triggerButton = this.$refs.button.$el as HTMLElement
      const NavbarSettings = await import('./NavbarSettings.vue').then(m => m.default)
      navbarSettingsVM = new NavbarSettings({
        propsData: {
          triggerElement: triggerButton,
        },
      }).$mount()
      console.log(triggerButton, navbarSettingsVM, navbarSettingsVM.$el)
      document.body.insertAdjacentElement('beforeend', navbarSettingsVM.$el)
    },
    toggleNavbarSettings() {
      navbarSettingsVM?.toggle()
    },
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
