import { findFeatureSource } from '@/core/feature-registry'
import { FeatureSource, switchGithubBranch } from '@/core/feature-source'
import type { RegistryFeatureType } from '@/core/feature-types'
import { branches, matchingUpdateBranches, meta, stableUpdateBranches } from '@/core/meta'
import { getGeneralSettings } from '@/core/settings'
import type { SettingsButtonAction } from '../settings-panel/component-actions/settings-action-types'
import { updateFeature } from './utils'

const getChannelSwitchTarget = (type: RegistryFeatureType, name: string, source: FeatureSource) => {
  const coreBranch = meta.compilationInfo.branch
  const stableBranch = coreBranch === branches.stableCdn ? branches.stableCdn : branches.stable
  if (source.kind === 'github') {
    if (source.ref !== branches.preview && !stableUpdateBranches.includes(source.ref)) {
      return undefined
    }
    const branch = source.ref === branches.preview ? stableBranch : branches.preview
    return { branch, getSource: () => switchGithubBranch(source, branch) }
  }
  const matchingBranches = matchingUpdateBranches.get(coreBranch)
  if (!matchingBranches) {
    return undefined
  }
  const branch = matchingBranches.includes(branches.preview) ? branches.preview : stableBranch
  return {
    branch,
    title: `从功能库安装同名${type === 'plugin' ? '插件' : '组件'}并替换当前更新源`,
    getSource: () => findFeatureSource(type, name, branch, getGeneralSettings().cdnRoot),
  }
}

export const createSwitchUpdateChannelAction = (
  type: RegistryFeatureType,
  name: string,
  source: FeatureSource,
): SettingsButtonAction | undefined => {
  const target = getChannelSwitchTarget(type, name, source)
  if (!target) {
    return undefined
  }
  const toPreview = target.branch === branches.preview
  const label = type === 'plugin' ? '插件' : '组件'
  const displayName = toPreview ? '切换到预览版' : '切换到稳定版'
  const confirmPreview =
    toPreview && matchingUpdateBranches.get(meta.compilationInfo.branch)?.includes(branches.stable)
  return {
    name: 'switchUpdateChannel',
    displayName,
    icon: 'mdi-source-branch',
    title: target.title,
    action: async () => {
      if (
        confirmPreview &&
        !window.confirm(
          `当前本体是稳定版，确定要将此${label}切换到预览版吗？这可能导致${label}出现不兼容的情况而失效。`,
        )
      ) {
        return
      }
      const { Toast } = await import('@/core/toast')
      const toast = Toast.info('正在切换版本...', displayName)
      try {
        const { message } = await updateFeature(await target.getSource())
        Toast.success(message, displayName, 3000)
      } catch (error) {
        Toast.error((error as Error).message ?? String(error), displayName, 5000)
      } finally {
        toast.close()
      }
    },
  }
}
