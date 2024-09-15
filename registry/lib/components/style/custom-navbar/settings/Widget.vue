<template>
  <DefaultWidget
    name="顶栏布局设置"
    icon="mdi-sort"
    @mouseover="loadNavbarSettings()"
    @click="toggleNavbarSettings()"
  />
</template>
<script lang="ts">
import { DefaultWidget } from '@/ui'
import { loadNavbarSettings, toggleNavbarSettings } from './vm'

export default Vue.extend({
  components: {
    DefaultWidget,
  },
  methods: {
    async loadNavbarSettings() {
      await loadNavbarSettings()
    },
    toggleNavbarSettings,
  },
})
</script>
