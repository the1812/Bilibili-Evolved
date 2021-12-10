<template>
  <iframe
    :src="item.src"
    frameborder="0"
    :width="item.width"
    :height="item.height"
  ></iframe>
</template>

<script lang="ts">
import { popperMixin } from '../mixins'

export default Vue.extend({
  name: 'IframePopup',
  mixins: [popperMixin],
})
</script>
