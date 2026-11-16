<template>
  <VButton
    v-if="isConnected"
    class="dev-client-action"
    :disabled="busy"
    @click="isDebugging ? stopDebug() : startDebug()"
  >
    <VIcon v-if="busy" icon="mdi-network-outline" :size="16" />
    <VIcon v-else-if="isDebugging" icon="mdi-minus-network-outline" :size="16" />
    <VIcon v-else icon="mdi-play-network-outline" :size="16" />
    {{ busy ? '启动中' : debugLabel }}
  </VButton>
</template>
<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import type { SettingsFeatureTarget } from '@/components/settings-panel/settings-feature'
import { VButton, VIcon } from '@/ui'
import { devClient, DevClientEvents } from './client'

const props = defineProps<{ target: SettingsFeatureTarget; path: string }>()
const busy = ref(false)
const debugPaths = ref(devClient.debugPaths)
const isConnected = ref(devClient.isConnected)
const isDebugging = computed(() => debugPaths.value.includes(props.path))
const debugLabel = computed(() => (isDebugging.value ? '停止调试' : '开始调试'))

const handleServerChange = (event: CustomEvent<boolean>) => {
  isConnected.value = event.detail
}
const handleDebugPathsChange = (event: CustomEvent<string[]>) => {
  debugPaths.value = event.detail
}
devClient.addEventListener(DevClientEvents.ServerChange, handleServerChange)
devClient.addEventListener(DevClientEvents.DebugPathsChange, handleDebugPathsChange)
onUnmounted(() => {
  devClient.removeEventListener(DevClientEvents.ServerChange, handleServerChange)
  devClient.removeEventListener(DevClientEvents.DebugPathsChange, handleDebugPathsChange)
})

const startDebug = async () => {
  if (busy.value) {
    return
  }
  busy.value = true
  try {
    await devClient.startDebug(props.path, props.target)
  } catch (error) {
    console.error(error)
  } finally {
    busy.value = false
  }
}
const stopDebug = () => {
  if (!busy.value) {
    devClient.stopDebug(props.path)
  }
}
</script>
