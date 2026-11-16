<template>
  <MiniToast
    v-if="actions.length > 0"
    placement="bottom-end"
    trigger="click"
    class="extra-actions-wrapper"
  >
    <div class="extra-actions">
      <VIcon icon="mdi-dots-vertical" :size="18" />
    </div>
    <template #toast>
      <div class="extra-actions-list">
        <DetailActionItem v-for="action of actions" :key="action.name" :action="action" menu />
      </div>
    </template>
  </MiniToast>
</template>

<script setup lang="ts">
import { MiniToast, VIcon } from '@/ui'
import DetailActionItem from './DetailActionItem.vue'
import type { SettingsAction } from './settings-action-types'

defineProps<{ actions: SettingsAction[] }>()
</script>
