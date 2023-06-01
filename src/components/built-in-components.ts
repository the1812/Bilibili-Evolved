import { ComponentMetadata } from './types'
import { component as SettingsPanel } from './settings-panel'
import { component as LaunchBar } from './launch-bar'
import { component as I18n } from './i18n'
import { component as AutoUpdate } from './auto-update'
import { component as NotifyNewVersion } from './notify-new-version'
import { component as Bisector } from './bisector'
import { component as Compatibilities } from './compatibilities'

export const getBuiltInComponents = (): ComponentMetadata[] => [
  SettingsPanel,
  LaunchBar,
  I18n,
  AutoUpdate,
  NotifyNewVersion,
  Bisector,
  Compatibilities,
]

export const isBuiltInComponent = (name: string) =>
  getBuiltInComponents().some(c => c.name === name)
