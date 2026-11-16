import type { PluginMetadata } from '@/plugins/plugin'
import { removeUserPlugin } from '../user-item'
import { SettingsFeature } from './base'
import { registryEntry } from './registry'
import type { SettingsFeatureDetail, SettingsFeatureOperations, SettingsFeatureRow } from './types'

export class PluginSettingsFeature extends SettingsFeature<PluginMetadata> {
  protected readonly openHook = 'settingsPanel.pluginDetail.open'
  protected readonly closeHook = undefined

  get row(): SettingsFeatureRow {
    return { icon: 'mdi-puzzle-outline' }
  }

  get detail(): SettingsFeatureDetail {
    return { showName: true, description: this.metadata }
  }

  get operations(): SettingsFeatureOperations {
    return {
      registry: registryEntry('plugin', this.name),
      removal: { run: () => removeUserPlugin(this.metadata), confirm: true, batch: true },
    }
  }

  readonly isChildOf = (name: string) => this.name.startsWith(`${name}.`)

  readonly related = (features: readonly SettingsFeature[]) => {
    const [name] = this.name.split('.')
    const match = features.find(feature => feature.name === name)
    return this.name !== name && match
      ? { title: '关联组件', entries: [{ feature: match }] }
      : undefined
  }
}
