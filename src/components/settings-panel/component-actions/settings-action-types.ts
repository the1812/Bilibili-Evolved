import type { Executable, VueModule } from '@/core/common-types'
import type { SettingsFeature } from '../settings-feature'

export interface SettingsButtonAction {
  name: string
  displayName: string
  icon: string
  title?: string
  action: Executable
}

interface SettingsViewAction {
  name: string
  view: Executable<VueModule>
  props: Record<string, unknown>
}

export type SettingsAction = SettingsButtonAction | SettingsViewAction

export interface SettingsDetailActions {
  buttons?: SettingsAction[]
  menu?: SettingsAction[]
}

export type SettingsDetailActionProvider = (feature: SettingsFeature) => SettingsDetailActions

export interface SettingsBatchAction extends Omit<SettingsButtonAction, 'action'> {
  verb: string
  prepare: (selection: readonly SettingsFeature[]) => {
    count: number
    run: () => Promise<string>
  }
}
