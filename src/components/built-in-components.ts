import { component as AutoUpdate } from './auto-update'
import { component as I18n } from './i18n'
import { component as LaunchBar } from './launch-bar'
import { component as NotifyNewVersion } from './notify-new-version'
import { component as Bisector } from './bisector'
import { component as SettingsPanel } from './settings-panel'
import type { ComponentMetadata } from './types'

export const getBuiltInComponents = (): ComponentMetadata[] => [
  SettingsPanel,
  LaunchBar,
  I18n,
  AutoUpdate,
  NotifyNewVersion,
  Bisector,
]

export const isBuiltInComponent = (name: string) =>
  getBuiltInComponents().some(c => c.name === name)
