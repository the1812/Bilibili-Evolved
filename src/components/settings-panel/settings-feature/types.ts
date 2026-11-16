import type { Executable, VueModule, WithName } from '@/core/common-types'
import type { FeatureSource } from '@/core/feature-source'
import type { RegistryFeatureType } from '@/core/feature-types'
import type { ComponentTag, FeatureBase } from '../../types'
import type { SettingsAction } from '../component-actions/settings-action-types'
import type { SettingsFeature } from './base'

export interface SettingsFeatureTarget {
  kind: RegistryFeatureType
  collection: `${RegistryFeatureType}s`
  name: string
}

export type NamedFeature = FeatureBase & WithName

export interface SettingsFeatureRow {
  icon?: string
  tags?: ComponentTag[]
  toggle?: { enabled: boolean }
}

export interface SettingsFeatureDetail {
  description?: FeatureBase
  showName?: boolean
  section?: {
    view: Executable<VueModule>
    props: Record<string, unknown>
  }
}

export interface SettingsFeatureOperations {
  enabled?: boolean
  menu?: () => SettingsAction[]
  registry?: {
    target: SettingsFeatureTarget
    label: string
    source: FeatureSource | undefined
  }
  removal?: {
    run: () => Promise<void>
    confirm?: boolean
    batch?: boolean
  }
}

export interface RelatedSettingsFeature {
  feature: SettingsFeature
  displayName?: string
}

export interface RelatedSettingsFeatures {
  title: string
  entries: RelatedSettingsFeature[]
}
