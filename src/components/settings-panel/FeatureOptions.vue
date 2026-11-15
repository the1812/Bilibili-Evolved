<template>
  <div class="component-detail-section">
    <div class="component-detail-section-title">选项</div>
    <div v-for="[name, option] of options" :key="name" class="generated-option">
      <ComponentOption
        :name="name"
        :display-name="option.displayName"
        :option="option"
        :component="component"
      />
    </div>
    <div v-if="component.extraOptions" class="extra-option">
      <component :is="component.extraOptions" :component-data="component" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentMetadata } from '../types'
import ComponentOption from './ComponentOption.vue'

const props = defineProps<{ component: ComponentMetadata }>()
const options = computed(() =>
  Object.entries(props.component.options ?? {}).filter(([, option]) => !option.hidden),
)
</script>
