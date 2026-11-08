<template>
  <VButton
    v-if="isConnected && debugPath"
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
import type { ComponentVueAction } from '@/components/settings-panel/component-actions/component-actions'
import type { ComponentMetadata } from '@/components/types'
import { Toast } from '@/core/toast'
import { VButton, VIcon } from '@/ui'
import { devClient, DevClientEvents } from './client'
import { getComponentDevPath } from './converter'

const props = defineProps<{ item: ComponentVueAction; component: ComponentMetadata }>()
const busy = ref(false)
const debugPaths = ref(devClient.debugPaths)
const isConnected = ref(devClient.isConnected)
const debugPath = computed(() => getComponentDevPath(props.component.name))
const isDebugging = computed(() => debugPaths.value.includes(debugPath.value))
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
  if (busy.value || !debugPath.value) {
    return
  }
  busy.value = true
  const toast = Toast.info('启动调试中...', 'DevClient')
  try {
    await devClient.startDebug(debugPath.value, { kind: 'component', name: props.component.name })
  } catch (error) {
    console.error(error)
  } finally {
    toast.close()
    busy.value = false
  }
}
const stopDebug = () => {
  if (!busy.value && debugPath.value) {
    devClient.stopDebug(debugPath.value)
  }
}
</script>
