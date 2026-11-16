import type { FeatureSource } from '@/core/feature-source'
import type { RegistryFeatureType } from '@/core/feature-types'
import { registerAndGetData } from '@/plugins/data'

export type UpdateSourceProvider = (featureName: string) => FeatureSource | undefined

const providers: Record<RegistryFeatureType, UpdateSourceProvider[]> = {
  component: registerAndGetData(
    'settingsPanel.componentUpdateSources',
    [] as UpdateSourceProvider[],
  )[0],
  plugin: registerAndGetData('settingsPanel.pluginUpdateSources', [] as UpdateSourceProvider[])[0],
}

export const getFeatureUpdateSource = (type: RegistryFeatureType, name: string) => {
  for (const provider of providers[type]) {
    const source = provider(name)
    if (source) {
      return source
    }
  }
  return undefined
}
