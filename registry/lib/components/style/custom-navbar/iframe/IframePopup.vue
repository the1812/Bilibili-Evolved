<template>
  <iframe
    ref="el"
    :src="item.src"
    frameborder="0"
    :width="item.width"
    :height="item.height"
  ></iframe>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { popupProps, usePopup } from '../mixins'

export default defineComponent({
  name: 'IframePopup',
  props: popupProps,
  setup: usePopup,
})
</script>
