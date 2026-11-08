import { FeatureSource, getFeatureSource, isLocalFeatureUrl } from '../feature-source'
import type { Settings } from './types'

interface LegacyUpdateSource {
  url?: string
  source?: FeatureSource
  alwaysUpdate?: boolean
  lastUpdateCheck: number
}

export const migrateUpdateSources = (settings: Settings) => {
  if (settings.featureSourcesMigrated) {
    return
  }
  const updateOptions = settings.components.autoUpdate.options
  const urls = updateOptions.urls as Record<string, Record<string, LegacyUpdateSource>>
  const devOptions = settings.userComponents.devClient?.settings.options
  const devRecords = devOptions?.devRecords as Record<string, { originalUrl: string }> | undefined
  for (const [kind, items] of Object.entries(urls)) {
    for (const [name, item] of Object.entries(items)) {
      if (item.url === undefined) {
        continue
      }
      const originalUrl = kind === 'styles' ? undefined : devRecords?.[name]?.originalUrl
      const restore = originalUrl && isLocalFeatureUrl(item.url)
      item.source = getFeatureSource(restore ? originalUrl : item.url)
      if (restore) {
        item.alwaysUpdate = isLocalFeatureUrl(originalUrl)
        item.lastUpdateCheck = 0
        updateOptions.lastUpdateCheck = 0
      }
      delete item.url
    }
  }
  if (devRecords) {
    // 已安装的旧版 DevClient 仍会遍历这个对象。
    devOptions.devRecords = {}
  }
  settings.featureSourcesMigrated = true
}

export const importSettings = (backup: Partial<Settings>) => {
  const { featureSourcesMigrated, ...values } = backup
  Object.entries(values).forEach(([key, value]) => {
    GM_setValue(key, value)
  })
  if (backup.components) {
    GM_setValue('featureSourcesMigrated', featureSourcesMigrated ?? false)
  }
}
