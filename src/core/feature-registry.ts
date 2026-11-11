import type { DocSourceItem } from '../../registry/lib/docs'
import { monkey } from './ajax'
import { CdnTypes, getCdnConfig } from './cdn-types'
import type { FeatureSource } from './feature-source'

export const loadRegistryEntries = async (branch: string, cdn: ReturnType<typeof getCdnConfig>) => {
  const url = `${cdn.root(branch, cdn.repo)}doc/features/features.json`
  const entries = await monkey<DocSourceItem[]>({ url, responseType: 'json' })
  if (!Array.isArray(entries)) {
    throw new Error(`无效的在线仓库索引: ${url}`)
  }
  return entries
}

export const findFeatureSource = async (
  name: string,
  branch: string,
  cdn: CdnTypes,
): Promise<FeatureSource> => {
  const config = getCdnConfig(cdn)
  const entries = await loadRegistryEntries(branch, config)
  const item = entries.find(
    entry =>
      entry.type === 'component' &&
      entry.name === name &&
      !entry.owner &&
      (entry.repo ?? config.repo) === config.repo,
  )
  if (!item) {
    throw new Error(`在线仓库的 ${branch} 分支没有可切换的组件版本`)
  }
  return { kind: 'github', repo: config.repo, ref: branch, path: item.fullAbsolutePath, cdn }
}
