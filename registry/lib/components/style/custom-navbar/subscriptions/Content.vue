<template>
  <div class="">{{ content }}</div>
</template>
<script lang="ts">
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import type { CustomNavbarOptions } from '..'

export default Vue.extend({
  data() {
    return {
      isBangumiLinkHidden:
        getComponentSettings<CustomNavbarOptions>('customNavbar').options.hidden.includes(
          'bangumi',
        ),
    }
  },
  computed: {
    content() {
      if (this.isBangumiLinkHidden) {
        return '番剧'
      }
      return '追番追剧'
    },
  },
  mounted() {
    addComponentListener('customNavbar.hidden', this.updateBangumiLinkStatus)
  },
  beforeDestroy() {
    removeComponentListener('customNavbar.hidden', this.updateBangumiLinkStatus)
  },
  methods: {
    updateBangumiLinkStatus(hiddenItems: string[]) {
      const isBangumiLinkHidden = hiddenItems.includes('bangumi')
      this.isBangumiLinkHidden = isBangumiLinkHidden
    },
  },
})
</script>
