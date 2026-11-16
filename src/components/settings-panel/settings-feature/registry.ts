import type { RegistryFeatureType } from '@/core/feature-types'
import { getFeatureUpdateSource } from '../feature-update-source'

const registryLabels: Record<RegistryFeatureType, string> = {
  component: '组件',
  plugin: '插件',
}

export const registryEntry = (kind: RegistryFeatureType, name: string) => ({
  target: { kind, collection: `${kind}s` as const, name },
  label: registryLabels[kind],
  get source() {
    return getFeatureUpdateSource(kind, name)
  },
})
