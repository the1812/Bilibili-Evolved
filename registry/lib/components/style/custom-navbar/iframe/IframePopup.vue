<template>
  <iframe :src="item.src" frameborder="0" :width="item.width" :height="item.height"></iframe>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { NavbarIframeConfig } from './iframe'
import { popperMixin } from '../mixins'
import { CustomNavbarItem } from '../custom-navbar-item'

export default Vue.extend({
  name: 'IframePopup',
  mixins: [popperMixin],
  props: {
    item: {
      type: CustomNavbarItem as unknown as PropType<CustomNavbarItem & NavbarIframeConfig>,
      required: true,
    },
  },
})
</script>
