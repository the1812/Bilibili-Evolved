import { ComponentMetadata } from './types'
import { component as SettingsPanel } from './settings-panel'
import { component as LaunchBar } from './launch-bar'
import { component as I18n } from './i18n'
import { component as AutoUpdate } from './auto-update'
import { component as NotifyNewVersion } from './notify-new-version'

export const getBuiltInComponents = (): ComponentMetadata[] => [
  SettingsPanel,
  LaunchBar,
  I18n,
  AutoUpdate,
  NotifyNewVersion,
]
