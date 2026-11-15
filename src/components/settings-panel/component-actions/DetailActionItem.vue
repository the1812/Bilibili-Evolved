<template>
  <component :is="action.view" v-if="'view' in action" v-bind="action.props" />
  <ComponentAction v-else-if="menu" :item="action" />
  <AsyncButton v-else :title="action.title" @click="action.action()">
    <VIcon :icon="action.icon" :size="16" />
    {{ action.displayName }}
  </AsyncButton>
</template>

<script setup lang="ts">
import { AsyncButton, VIcon } from '@/ui'
import ComponentAction from './ComponentAction.vue'
import type { SettingsAction } from './settings-action-types'

defineProps<{ action: SettingsAction; menu?: boolean }>()
</script>
