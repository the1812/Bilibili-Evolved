import { getComponentSettings, isUserComponent } from '@/core/settings'
import { getDescriptionText } from '../../description'
import type { ComponentMetadata } from '../../types'
import { getComponentMenuActions } from '../component-actions/component-actions'
import { removeUserComponent } from '../user-item'
import { SettingsFeature } from './base'
import { registryEntry } from './registry'
import type {
  RelatedSettingsFeatures,
  SettingsFeatureDetail,
  SettingsFeatureOperations,
  SettingsFeatureRow,
} from './types'

export class ComponentSettingsFeature extends SettingsFeature<ComponentMetadata> {
  protected readonly openHook = 'settingsPanel.componentDetail.open'
  protected readonly closeHook = 'settingsPanel.componentDetail.close'
  readonly isChildOf = undefined

  get row(): SettingsFeatureRow {
    const { metadata } = this
    return {
      tags: metadata.tags,
      get toggle() {
        return metadata.configurable === false ? undefined : getComponentSettings(metadata)
      },
    }
  }

  get detail(): SettingsFeatureDetail {
    const { options, extraOptions, description } = this.metadata
    const hasOptions = extraOptions || Object.values(options ?? {}).some(option => !option.hidden)
    return {
      description: options && !description ? undefined : this.metadata,
      section: hasOptions
        ? { view: () => import('../FeatureOptions.vue'), props: { component: this.metadata } }
        : undefined,
    }
  }

  get operations(): SettingsFeatureOperations {
    const enabled = this.metadata.configurable !== false
    return {
      enabled,
      menu: () => getComponentMenuActions(this.metadata),
      registry: registryEntry('component', this.name),
      removal: isUserComponent(this.metadata)
        ? { run: () => removeUserComponent(this.metadata), batch: true }
        : undefined,
    }
  }

  async searchText() {
    return [
      await super.searchText(),
      ...this.metadata.tags.flatMap(tag => [tag.name, tag.displayName]),
      await getDescriptionText(this.metadata),
    ].join('\n')
  }

  readonly related = (features: readonly SettingsFeature[]): RelatedSettingsFeatures => {
    const prefix = `${this.displayName} - `
    return {
      title: '关联插件',
      entries: features
        .filter(feature => feature.isChildOf?.(this.name))
        .map(feature => ({
          feature,
          displayName: feature.displayName.startsWith(prefix)
            ? feature.displayName.slice(prefix.length).trim() || feature.displayName
            : feature.displayName,
        })),
    }
  }
}
