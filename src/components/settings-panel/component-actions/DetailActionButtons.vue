<template>
  <div v-if="actions.length > 0" class="component-detail-operations">
    <DetailActionItem v-for="action of actions" :key="action.name" :action="action" />
  </div>
</template>

<script setup lang="ts">
import DetailActionItem from './DetailActionItem.vue'
import type { SettingsAction } from './settings-action-types'

defineProps<{ actions: SettingsAction[] }>()
</script>
