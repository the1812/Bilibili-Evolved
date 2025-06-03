<template>
  <div>
    <div class="custom-black-list-extra-options">
      <VButton ref="button" @mouseover="setBlackListPropsWrapper" @click="toggleBlackList">
        黑名单
        <VIcon icon="right-arrow" :size="16" />
      </VButton>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useTemplateRef } from 'vue'
import { VIcon, type VButton } from '@/ui'
import { loadBlackList, toggleBlackList } from './vm'

const button = useTemplateRef<InstanceType<typeof VButton>>('button')

const setBlackListPropsWrapper = async () => {
  await loadBlackList(button.value.$el as HTMLElement)
}
</script>
<style lang="scss">
.custom-black-list-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
