import * as ajax from '@/core/ajax'
import * as cdnTypes from '@/core/cdn-types'
import * as download from '@/core/download'
import * as externalInput from '@/core/external-input'
import * as filePicker from '@/core/file-picker'
import * as lifeCycle from '@/core/life-cycle'
import * as loadingMode from '@/core/loading-mode'
import * as meta from '@/core/meta'
import * as observer from '@/core/observer'
import * as reorder from '@/core/reorder'
import * as spinQuery from '@/core/spin-query'
import * as style from '@/core/style'
import * as textColor from '@/core/text-color'
import * as settings from '@/core/settings'
import * as userInfo from '@/core/user-info'
import * as version from '@/core/version'
import * as watchlater from '@/core/watchlater'
import * as commonUtils from '@/core/utils'
import * as constants from '@/core/utils/constants'
import * as formatters from '@/core/utils/formatters'
import * as title from '@/core/utils/title'
import * as i18n from '@/core/utils/i18n'
import * as lazyPanel from '@/core/utils/lazy-panel'
import * as log from '@/core/utils/log'
import * as sort from '@/core/utils/sort'
import * as urls from '@/core/utils/urls'
import * as toast from '@/core/toast'
import * as themeColor from '@/core/theme-color'
import * as ui from '@/ui'
import { componentApis } from '@/components/api'
import { pluginApis } from '@/plugins/api'

/**
 * 核心API
 */
export const coreApis = {
  ajax,
  cdnTypes,
  download,
  externalInput,
  filePicker,
  lifeCycle,
  loadingMode,
  meta,
  observer,
  reorder,
  spinQuery,
  style,
  textColor,
  userInfo,
  version,
  watchlater,
  settings,
  toast,
  themeColor,
  utils: {
    ...commonUtils,
    constants,
    formatters,
    title,
    i18n,
    lazyPanel,
    log,
    sort,
    urls,
  },
  ui,
  componentApis,
  pluginApis,
}
export type CoreApis = typeof coreApis
/** 可供外部使用的核心API */
export const externalApis = {
  ajax,
  ...cdnTypes,
  ...download,
  ...externalInput,
  ...filePicker,
  lifeCycle,
  ...loadingMode,
  ...meta,
  observer,
  ...reorder,
  spinQuery,
  ...style,
  ...textColor,
  ...userInfo,
  ...version,
  watchlater,
  settingsApis: settings,
  get settings() {
    return settings.settings
  },
  ...toast,
  utils: {
    ...commonUtils,
    ...constants,
    ...formatters,
    ...title,
    ...i18n,
    ...lazyPanel,
    ...log,
    ...sort,
    ...urls,
  },
  ui,
  componentApis: {
    ...componentApis.component,
    ...componentApis.userComponent,
    ...componentApis.styledComponent,
    ...componentApis.launchBar,
    feeds: componentApis.feeds,
  },
  pluginApis: {
    ...pluginApis.style,
    ...pluginApis.plugin,
    ...pluginApis.data,
    ...pluginApis.hook,
  },
  monkeyApis: {
    GM_setValue,
    GM_getValue,
    GM_deleteValue,
    GM_setClipboard,
    GM_xmlhttpRequest,
    GM_info,
  },
  lodash,
  Vue,
  JSZip,
  sandboxWindow: window,
}
export type ExternalApis = typeof externalApis
