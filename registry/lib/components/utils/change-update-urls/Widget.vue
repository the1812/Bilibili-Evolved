<template>
  <DefaultWidget
    name="替换更新链接"
    icon="mdi-file-replace-outline"
    :disabled="busy"
    @click="replaceBranch()"
  ></DefaultWidget>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { AutoUpdateOptions } from '@/components/auto-update'
import { switchGithubBranch } from '@/core/feature-source'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { DefaultWidget } from '@/ui'

const busy = ref(false)
const replaceBranch = () => {
  const targetBranch = window.prompt('输入希望替换成的分支名称')?.trim()
  if (!targetBranch) {
    return
  }
  busy.value = true
  try {
    const { options } = getComponentSettings<AutoUpdateOptions>('autoUpdate')
    for (const items of Object.values(options.urls)) {
      for (const item of Object.values(items)) {
        const source = switchGithubBranch(item.source, targetBranch)
        if (source !== item.source) {
          item.source = source
        }
      }
    }
    Toast.info('替换完成', '替换更新链接', 3000)
  } catch (error) {
    logError(error)
  } finally {
    busy.value = false
  }
}
</script>
