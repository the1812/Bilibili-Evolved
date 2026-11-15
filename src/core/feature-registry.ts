import type { DocSourceItem } from '../../registry/lib/docs'
import { monkey } from './ajax'
import { CdnTypes, getCdnConfig } from './cdn-types'
import type { FeatureSource } from './feature-source'
import type { RegistryFeatureType } from './feature-types'

export const loadRegistryEntries = async (branch: string, cdn: ReturnType<typeof getCdnConfig>) => {
  const url = `${cdn.root(branch, cdn.repo)}doc/features/features.json`
  const entries = await monkey<DocSourceItem[]>({ url, responseType: 'json' })
  if (!Array.isArray(entries)) {
    throw new Error(`无效的功能库索引: ${url}`)
  }
  return entries
}

export const findFeatureSource = async (
  type: RegistryFeatureType,
  name: string,
  branch: string,
  cdn: CdnTypes,
): Promise<FeatureSource> => {
  const config = getCdnConfig(cdn)
  const entries = await loadRegistryEntries(branch, config)
  const item = entries.find(
    entry =>
      entry.type === type &&
      entry.name === name &&
      !entry.owner &&
      (entry.repo ?? config.repo) === config.repo,
  )
  if (!item) {
    throw new Error(`功能库的 ${branch} 分支没有可切换的${type === 'plugin' ? '插件' : '组件'}版本`)
  }
  return { kind: 'github', repo: config.repo, ref: branch, path: item.fullAbsolutePath, cdn }
}
