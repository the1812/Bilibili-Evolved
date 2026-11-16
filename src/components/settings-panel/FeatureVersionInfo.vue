<template>
  <div v-if="feature.metadata.commitHash || showName" class="component-detail-internal-data">
    <div v-if="feature.metadata.commitHash" class="component-detail-commit">
      <span>Commit: {{ commitLabel }}</span>
      <VIcon
        v-if="commitWarning"
        icon="mdi-alert-circle-outline"
        class="commit-warning"
        :size="14"
        :title="commitWarning"
      />
    </div>
    <div v-if="showName" class="component-detail-internal-name">内部名称: {{ feature.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFeatureUrl } from '@/core/feature-source'
import { matchingUpdateBranches, meta } from '@/core/meta'
import { VIcon } from '@/ui'
import { useComponentData } from './component-data'
import type { SettingsFeature } from './settings-feature'

const props = defineProps<{
  feature: SettingsFeature
  showName: boolean
}>()
const registry = useComponentData(() => props.feature.operations.registry)
const source = computed(() => registry.value?.source)
const githubRef = computed(() => (source.value?.kind === 'github' ? source.value.ref : undefined))
const commitLabel = computed(() => {
  const hash = props.feature.metadata.commitHash?.substring(0, 9)
  return githubRef.value ? `${hash} (${githubRef.value})` : hash
})
const commitWarning = computed(() => {
  const url = getFeatureUrl(source.value)
  const label = registry.value?.label
  if (/^http:\/\/localhost:\d+\/registry\/dist\/(components|plugins)\/.+\.js$/.test(url)) {
    return `当前${label}的更新地址是本地开发链接`
  }
  const { branch } = meta.compilationInfo
  const sourceBranch = githubRef.value
  if (
    sourceBranch &&
    sourceBranch !== branch &&
    !matchingUpdateBranches.get(branch)?.includes(sourceBranch)
  ) {
    return `当前本体分支为 ${branch}, ${label}更新源分支为 ${sourceBranch}, 可能会存在兼容性问题`
  }
  return undefined
})
</script>
