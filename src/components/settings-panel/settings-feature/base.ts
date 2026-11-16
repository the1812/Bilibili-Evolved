import { getHook } from '@/plugins/hook'
import type {
  NamedFeature,
  RelatedSettingsFeatures,
  SettingsFeatureDetail,
  SettingsFeatureOperations,
  SettingsFeatureRow,
} from './types'

export abstract class SettingsFeature<Metadata extends NamedFeature = NamedFeature> {
  abstract get row(): SettingsFeatureRow
  abstract get detail(): SettingsFeatureDetail
  abstract get operations(): SettingsFeatureOperations
  protected abstract readonly openHook: string
  protected abstract readonly closeHook?: string
  abstract readonly related?: (
    features: readonly SettingsFeature[],
  ) => RelatedSettingsFeatures | undefined
  abstract readonly isChildOf?: (name: string) => boolean

  constructor(readonly metadata: Metadata) {}

  get name() {
    return this.metadata.name
  }

  get displayName() {
    return this.metadata.displayName
  }

  searchText(): string | Promise<string> {
    return `${this.name}\n${this.displayName}`
  }

  openDetail(select: () => void) {
    this.changeDetail(this.openHook, select)
  }

  closeDetail(clear: () => void) {
    this.changeDetail(this.closeHook, clear)
  }

  private changeDetail(hook: string | undefined, change: () => void) {
    if (!hook) {
      change()
      return
    }
    const { before, after } = getHook(hook)
    before(this.name)
    change()
    after(this.name)
  }
}
