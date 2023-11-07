<template>
  <div class="navbar-upload">
    <VIcon icon="upload" :size="18"></VIcon>
    <div class="navbar-upload-name">投稿</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { VIcon } from '@/ui'

export default defineComponent({
  components: {
    VIcon,
  },
})
</script>
<style lang="scss" scoped>
.navbar-upload {
  display: flex;
  align-items: center;
  &-name {
    padding-left: 4px;
    font-size: 12pt;
    font-weight: bold;
  }
}
</style>
