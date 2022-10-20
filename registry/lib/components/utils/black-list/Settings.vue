<template>
  <div>
    <div class="custom-black-list-extra-options">
      <VButton
        v-if="login"
        ref="button"
        @mouseover="loadNameBlackListSettings()"
        @click="toggleNameSettings()"
      >
        精确匹配列表<VIcon icon="right-arrow" :size="16"></VIcon>
      </VButton>
    </div>
    <div class="custom-black-list-extra-options">
      <VButton
        v-if="login"
        ref="button"
        @mouseover="loadRegexBlackListSettings()"
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
import {
  loadNameSettings,
  loadRegexSettings,
  setNameProps,
  setRegexProps,
  toggleNameSettings,
  toggleRegexSettings,
} from './vm'

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
    async loadNameBlackListSettings() {
      const isFirstLoad = await loadNameSettings()
      if (isFirstLoad) {
        const triggerButton = this.$refs.button.$el as HTMLElement
        setNameProps(triggerButton)
      }
    },
    toggleNameSettings,
    async loadRegexBlackListSettings() {
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
.custom-black-list-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
