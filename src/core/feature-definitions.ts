import type { ComponentMetadata } from '@/components/types'
import type { PluginMetadata } from '@/plugins/plugin'
import { loadDevFeatures } from './dev-features'

type FeatureDefinitions = {
  component: ComponentMetadata
  plugin: PluginMetadata
}

export const getFeatureDefinitions = async <K extends keyof FeatureDefinitions>(kind: K) => {
  const { settings } = await import('./settings')
  const { loadFeatureCode } = await import('./external-input')
  const stored = kind === 'component' ? settings.userComponents : settings.userPlugins
  const overrides = new Map<string, FeatureDefinitions[K]>()
  for (const feature of await loadDevFeatures()) {
    if (feature.kind === kind) {
      overrides.set(feature.metadata.name, feature.metadata as FeatureDefinitions[K])
    }
  }
  const definitions: FeatureDefinitions[K][] = []
  for (const [name, { code }] of Object.entries(stored)) {
    const override = overrides.get(name)
    if (override) {
      definitions.push(override)
      overrides.delete(name)
      continue
    }
    try {
      definitions.push(loadFeatureCode(code) as FeatureDefinitions[K])
    } catch (error) {
      console.error('从代码加载功能失败', { kind, name, error })
    }
  }
  return definitions.concat([...overrides.values()])
}
