import type { FeatureSource } from '@/core/feature-source'
import { registerAndGetData } from '@/plugins/data'

export type ComponentUpdateSourceProvider = (componentName: string) => FeatureSource | undefined

const [providers] = registerAndGetData(
  'settingsPanel.componentUpdateSources',
  [] as ComponentUpdateSourceProvider[],
)

export const getComponentUpdateSource = (componentName: string) => {
  for (const provider of providers) {
    const source = provider(componentName)
    if (source) {
      return source
    }
  }
  return undefined
}
