<template>
  <iframe :src="item.src" frameborder="0" :width="item.width" :height="item.height"></iframe>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { popperMixin } from '../mixins'

export default defineComponent({
  name: 'IframePopup',
  mixins: [popperMixin],
})
</script>
