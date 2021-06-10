import { ComponentMetadata } from './types'
import { component as SettingsPanel } from './settings-panel'
import { component as LaunchBar } from './launch-bar'
import { component as I18n } from './i18n'
// import { component as DownloadVideo } from './video/download'
// import { component as DownloadDanmaku } from './video/danmaku/download'
import { component as AutoUpdate } from './utils/auto-update'

export const getBuiltInComponents = (): ComponentMetadata[] => [
  SettingsPanel,
  LaunchBar,
  I18n,
  // DownloadVideo,
  // DownloadDanmaku,
  AutoUpdate,
]
