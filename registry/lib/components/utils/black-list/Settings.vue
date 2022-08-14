<template>
  <div>
    <div class="custom-block-list-extra-options">
      <VButton
        v-if="login"
        ref="button"
        @mouseover="loadNameBlockListSettings()"
        @click="toggleNameSettings()"
      >
        精确匹配列表<VIcon icon="right-arrow" :size="16"></VIcon>
      </VButton>
    </div>
    <div class="custom-block-list-extra-options">
      <VButton
        v-if="login"
        ref="button"
        @mouseover="loadRegexBlockListSettings()"
        @click="toggleRegexSettings()"
      >
        正则匹配列表<VIcon icon="right-arrow" :size="16"></VIcon>
      </VButton>
    </div>
  </div>
</template>
<script lang="ts">
import { getUID } from '@/core/utils'
import { VIcon, VButton } from '@/ui'
import { loadNameSettings, loadRegexSettings, setNameProps, setRegexProps, toggleNameSettings, toggleRegexSettings } from './vm'

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
    async loadNameBlockListSettings() {
      const isFirstLoad = await loadNameSettings()
      if (isFirstLoad) {
        const triggerButton = this.$refs.button.$el as HTMLElement
        setNameProps(triggerButton)
      }
    },
    toggleNameSettings,
    async loadRegexBlockListSettings() {
      const isFirstLoad = await loadRegexSettings()
      if (isFirstLoad) {
        const triggerButton = this.$refs.button.$el as HTMLElement
        setRegexProps(triggerButton)
      }
    },
    toggleRegexSettings,
  },
})
</script>
<style lang="scss">
.custom-block-list-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
